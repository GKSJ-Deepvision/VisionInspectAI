import io
import os
import base64
from pathlib import Path
from PIL import Image
import numpy as np
import torch
from torchvision import transforms

from anomaly_detection import config
from anomaly_detection.model import AnomalyAutoencoder
from anomaly_detection.classifier import DefectClassifier, CATEGORY_DEFECT_CLASSES
from anomaly_detection.preprocessor import validate_and_preprocess_image
from anomaly_detection.severity import calculate_severity_score
from anomaly_detection.yolo_helper import crop_product

# Global Model Caches for zero-latency inference
_AUTOENCODER_CACHE = {}
_CLASSIFIER_CACHE = {}

def load_autoencoder_model(category: str):
    category = category.lower()
    if category in _AUTOENCODER_CACHE:
        return _AUTOENCODER_CACHE[category]
        
    device = torch.device(config.DEVICE)
    model = AnomalyAutoencoder().to(device)
    model_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
    
    if model_path.exists():
        try:
            model.load_state_dict(torch.load(model_path, map_location=device))
        except Exception as e:
            print(f"Warning loading weights for {category}: {e}")
            
    model.eval()
    _AUTOENCODER_CACHE[category] = model
    return model

def load_classifier_model(category: str):
    category = category.lower()
    if category in _CLASSIFIER_CACHE:
        return _CLASSIFIER_CACHE[category]
        
    device = torch.device(config.DEVICE)
    class_list = CATEGORY_DEFECT_CLASSES.get(category, ["good", "defective"])
    num_classes = len(class_list)
    
    model = DefectClassifier(num_classes=num_classes).to(device)
    model_path = config.MODEL_DIR / f"classifier_{category}.pth"
    
    loaded = False
    if model_path.exists():
        try:
            model.load_state_dict(torch.load(model_path, map_location=device))
            loaded = True
        except Exception as e:
            print(f"Warning loading classifier for {category}: {e}")
            
    model.eval()
    _CLASSIFIER_CACHE[category] = (model if loaded else None, class_list)
    return _CLASSIFIER_CACHE[category]

def pil_to_base64_uri(pil_img, format="JPEG") -> str:
    buffered = io.BytesIO()
    pil_img.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{img_str}"

def predict_defect(image_input, category: str = "bottle", enable_yolo: bool = True) -> dict:
    """
    Unified ML Inference API for Manufacturing Quality Control.
    
    Parameters:
        image_input: PIL.Image, bytes, numpy array, or file path str.
        category: Product category name (e.g. 'bottle', 'cable', 'capsule').
        enable_yolo: If True, crops product using YOLOv8 bounding box.
        
    Returns:
        Dict containing defect result, confidence score, defect class, anomaly score,
        severity breakdown, and base64 heatmap URIs.
    """
    category = category.lower()
    
    # 1. Input Parsing
    if isinstance(image_input, (str, Path)):
        pil_img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, np.ndarray):
        pil_img = Image.fromarray(image_input).convert("RGB")
    elif isinstance(image_input, Image.Image):
        pil_img = image_input.convert("RGB")
    else:
        raise ValueError("Unsupported image_input type.")
        
    # 2. Stage 1 Image Quality Analysis & Preprocessing
    enhanced_img, quality_report = validate_and_preprocess_image(pil_img)
    
    # 3. Object Detection Bounding Box & ROI Extraction
    if enable_yolo:
        cropped_img, bbox, yolo_status = crop_product(pil_img, category=category, enable_yolo=True)
    else:
        cropped_img = pil_img.copy()
        bbox = [0, 0, pil_img.width, pil_img.height]
        yolo_status = "YOLO: Disabled (Full frame standard crop)"
        
    # 4. Autoencoder Anomaly Score & SSIM+MSE Heatmap
    device = torch.device(config.DEVICE)
    autoencoder = load_autoencoder_model(category)
    
    transform = transforms.Compose([
        transforms.Resize(config.IMAGE_SIZE),
        transforms.ToTensor()
    ])
    input_tensor = transform(cropped_img).unsqueeze(0).to(device)
    
    reconstructed_tensor, anomaly_map_tensor, anomaly_score_tensor = autoencoder.compute_anomaly_map(input_tensor, use_ssim=True)
    
    # 5. Defect Classification & Confidence Calculation
    classifier_model, class_list = load_classifier_model(category)
    if classifier_model is not None:
        predicted_class, class_confidence, class_probs = classifier_model.predict_class(input_tensor, class_list)
    else:
        predicted_class = "good"
        class_confidence = 99.0
        class_probs = {"good": 99.0}

    anomaly_score = float(anomaly_score_tensor.item())
    threshold = float(config.CATEGORY_THRESHOLDS.get(category, 0.125))

    is_anomaly = (anomaly_score > threshold) or (predicted_class.lower() != "good")
    defect_result = "REJECT" if is_anomaly else "PASS"
    defect_class = predicted_class if is_anomaly else "good"
        
    # 6. Morphological Severity Scoring Framework
    anomaly_map_np = anomaly_map_tensor.squeeze(0).cpu().numpy()
    reconstructed_np = reconstructed_tensor.squeeze(0).cpu().numpy().transpose(1, 2, 0)
    reconstructed_np = np.clip(reconstructed_np * 255.0, 0, 255).astype(np.uint8)
    reconstructed_img = Image.fromarray(reconstructed_np)
    
    severity_dict = calculate_severity_score(
        anomaly_map=anomaly_map_np,
        anomaly_score=anomaly_score,
        threshold=threshold,
        defect_type=predicted_class if (predicted_class and predicted_class != "good") else None
    )
    
    if is_anomaly and predicted_class == "good":
        predicted_class = severity_dict["inferred_defect_type"]
        class_confidence = round(min(99.0, max(85.0, (anomaly_score / max(1e-6, threshold)) * 50.0)), 2)
        class_probs[predicted_class] = class_confidence
        
    # 7. Heatmap & Overlay Visual Generation
    norm_map = (anomaly_map_np - anomaly_map_np.min()) / (anomaly_map_np.max() - anomaly_map_np.min() + 1e-8)
    heatmap_uint8 = (norm_map * 255.0).astype(np.uint8)
    
    import cv2
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
    heatmap_pil = Image.fromarray(heatmap_color).resize(cropped_img.size)
    
    crop_cv = np.array(cropped_img)
    overlay_np = cv2.addWeighted(crop_cv, 0.6, np.array(heatmap_pil), 0.4, 0)
    overlay_pil = Image.fromarray(overlay_np)
    
    return {
        "is_anomaly": is_anomaly,
        "defect_result": "REJECT" if is_anomaly else "PASS",
        "defect_class": predicted_class,
        "confidence_score": class_confidence,
        "anomaly_score": round(anomaly_score, 6),
        "threshold": round(threshold, 6),
        "severity_score": round(severity_dict["severity_score"], 2),
        "severity_level": severity_dict["severity_level"],
        "recommended_action": severity_dict["recommended_action"],
        "yolo_status": yolo_status,
        "bbox": bbox,
        "class_probabilities": class_probs,
        "quality_report": quality_report,
        "severity_breakdown": severity_dict["breakdown"],
        "original_image": pil_to_base64_uri(pil_img),
        "cropped_image": pil_to_base64_uri(cropped_img),
        "reconstructed_image": pil_to_base64_uri(reconstructed_img),
        "heatmap_image": pil_to_base64_uri(heatmap_pil),
        "overlay_image": pil_to_base64_uri(overlay_pil)
    }
