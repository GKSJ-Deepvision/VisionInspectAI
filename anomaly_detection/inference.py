import io
import base64
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
import torch
import torch.nn.functional as F

from anomaly_detection import config
from anomaly_detection.model import PaDiM
from anomaly_detection.classifier import DefectClassifier, CATEGORY_DEFECT_CLASSES, detect_product_category
from anomaly_detection.preprocessor import validate_and_preprocess_image, get_category_transforms
from anomaly_detection.severity import calculate_severity_score
from anomaly_detection.yolo_helper import crop_product
from anomaly_detection.localization import localize_defects

# ── Global Model Caches ─────────────────────────────────────────────────────
_PADIM_CACHE       = {}   # category → PaDiM model
_CLASSIFIER_CACHE  = {}   # category → (DefectClassifier, class_list)


# ── Model Loaders ───────────────────────────────────────────────────────────

def load_padim(category: str) -> PaDiM:
    """Loads and caches the PaDiM model for the given category."""
    category = category.lower()
    if category in _PADIM_CACHE:
        return _PADIM_CACHE[category]

    device = config.DEVICE
    model = PaDiM(
        backbone=config.PADIM_BACKBONE,
        layer_names=config.PADIM_LAYERS,
        d_dim=config.PADIM_DIM,
        sigma=config.PADIM_SIGMA,
        epsilon=config.PADIM_EPSILON,
        device=device
    )

    weights_path = config.MODEL_DIR / f"padim_{category}.pth"
    if weights_path.exists():
        model.load(weights_path)
    else:
        # Fallback to autoencoder weights path or auto-fit if needed
        legacy_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
        print(f"[inference] Warning: PaDiM weights not found at {weights_path.name}. Initialized untrained model.")

    # Override threshold if present in CATEGORY_THRESHOLDS
    if category in config.CATEGORY_THRESHOLDS:
        model.threshold = float(config.CATEGORY_THRESHOLDS[category])

    model.eval()
    _PADIM_CACHE[category] = model
    return model


# Backward compatibility alias
load_autoencoder = load_padim



from anomaly_detection.classifier import load_classifier

def load_classifier_model(category: str):
    """Loads and caches the DefectClassifier for the given category."""
    category = category.lower()
    if category in _CLASSIFIER_CACHE:
        return _CLASSIFIER_CACHE[category]

    model, class_list = load_classifier(category)
    _CLASSIFIER_CACHE[category] = (model, class_list)
    return _CLASSIFIER_CACHE[category]



# ── Base64 Image Utilities ──────────────────────────────────────────────────

def pil_to_base64_uri(pil_img: Image.Image, fmt: str = "JPEG") -> str:
    buf = io.BytesIO()
    pil_img.save(buf, format=fmt)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/{fmt.lower()};base64,{b64}"


# ── Main Inference Pipeline ─────────────────────────────────────────────────

def predict_defect(image_input, category: str = "bottle", enable_yolo: bool = True) -> dict:
    """
    Full manufacturing quality inspection pipeline using PaDiM.

    Stages:
        1. Input Parsing & Auto Category Detection
        2. Image preprocessing & quality validation
        3. YOLO object crop (for applicable categories)
        4. PaDiM multi-scale feature extraction & Mahalanobis scoring
        5. Defect localization (connected components, contours, bounding boxes)
        6. High-resolution heatmap & overlay generation
        7. PASS / REJECT decision & confidence calibration
        8. Multiclass defect classification (naming)
        9. Severity scoring & Quality assessment report

    Returns a dict with complete inspection results, localization metadata, and Base64 images.
    """
    category = category.lower()

    # ── 1. Input Parsing & Category Detection ───────────────────────────────
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

    if category in ["auto", "autodetect", "detect", ""]:
        category, auto_conf = detect_product_category(pil_img)

    # ── 2. Quality Preprocessing ─────────────────────────────────────────────
    enhanced_img, quality_report = validate_and_preprocess_image(pil_img, enhance=False)

    # ── 3. YOLO Object Crop ─────────────────────────────────────────────────
    yolo_skip = getattr(config, "YOLO_SKIP_CATEGORIES", {"carpet", "grid", "leather", "tile", "wood"})
    use_yolo = enable_yolo and (category not in yolo_skip)

    if use_yolo:
        cropped_img, bbox, yolo_status = crop_product(pil_img, category=category, enable_yolo=True)
        if yolo_status.startswith("INVALID"):
            cropped_img = pil_img.copy()
            bbox = [0, 0, pil_img.width, pil_img.height]
    else:
        cropped_img = pil_img.copy()
        bbox = [0, 0, pil_img.width, pil_img.height]
        yolo_status = f"YOLO: Bypassed for category '{category}'"

    # ── 4. PaDiM Feature Extraction & Anomaly Map ──────────────────────────
    padim_model = load_padim(category)
    transform = get_category_transforms(category=category, split="test", image_size=config.IMAGE_SIZE)

    input_tensor = transform(cropped_img).unsqueeze(0).to(config.DEVICE)

    with torch.inference_mode():
        anomaly_map_tensor = padim_model.predict_anomaly_map(input_tensor)  # (1, 1, H, W)

    anomaly_map_np = anomaly_map_tensor.squeeze().cpu().numpy()  # (H, W)

    # ── 5. Anomaly Score & Thresholding ──────────────────────────────────────
    # Combined score: 60% top 0.1% peak intensity + 40% top 1.0% mean intensity
    flat_map = anomaly_map_np.ravel()
    top_k_01 = max(1, int(anomaly_map_np.size * 0.001))
    top_k_10 = max(1, int(anomaly_map_np.size * 0.010))
    
    peak_score = float(np.mean(np.partition(flat_map, -top_k_01)[-top_k_01:]))
    mean_score = float(np.mean(np.partition(flat_map, -top_k_10)[-top_k_10:]))
    anomaly_score = float(0.60 * peak_score + 0.40 * mean_score)


    threshold = float(padim_model.threshold if padim_model.threshold > 0 else config.CATEGORY_THRESHOLDS.get(category, config.ANOMALY_THRESHOLD))

    # PASS / REJECT verdict
    is_anomaly = bool(anomaly_score > threshold)
    is_ood = bool(anomaly_score > (threshold * 5.0))

    if is_ood:
        defect_result = "INVALID_IMAGE"
    elif is_anomaly:
        defect_result = "REJECT"
    else:
        defect_result = "PASS"

    # ── 6. Defect Localization ───────────────────────────────────────────────
    localization_info = localize_defects(
        anomaly_map=anomaly_map_np,
        threshold=threshold,
        original_img=cropped_img,
        min_area=25
    )

    primary_bbox = localization_info["primary_bbox"]
    all_bboxes = localization_info["bounding_boxes"]

    # ── 7. Heatmap & Overlay Generation ──────────────────────────────────────
    norm_map = np.clip((anomaly_map_np - anomaly_map_np.min()) / (anomaly_map_np.max() - anomaly_map_np.min() + 1e-8), 0.0, 1.0)
    heat_u8 = (norm_map * 255.0).astype(np.uint8)

    # High-contrast JET colormap
    heat_color = cv2.applyColorMap(heat_u8, cv2.COLORMAP_JET)
    heat_color = cv2.cvtColor(heat_color, cv2.COLOR_BGR2RGB)
    heatmap_pil = Image.fromarray(heat_color).resize(cropped_img.size, Image.BILINEAR)

    # Blend original cropped image with heatmap overlay
    crop_np = np.array(cropped_img)
    overlay_np = cv2.addWeighted(crop_np, 0.60, np.array(heatmap_pil), 0.40, 0)
    overlay_pil = Image.fromarray(overlay_np)

    # Contour & Bounding box overlay image
    contour_overlay_pil = localization_info["overlay_image"].resize(cropped_img.size)

    # ── 8. Defect Classification & Confidence Calibration ───────────────────
    predicted_class = "good"
    class_confidence = 99.0
    class_probs = {"good": 99.0}

    normalized_score = anomaly_score / max(1e-6, threshold)

    if is_ood:
        predicted_class = "out_of_distribution"
        class_confidence = 99.9
        reason = f"Anomaly score ({anomaly_score:.2f}) severely exceeds threshold ({threshold:.2f})."
    elif is_anomaly:
        classifier_model, class_list = load_classifier_model(category)
        if classifier_model is not None:
            predicted_class, class_confidence, class_probs = classifier_model.predict_class(
                input_tensor, class_list, exclude_good=True
            )
            if predicted_class in ("good", "class_0"):
                predicted_class = "defect_detected"
        else:
            predicted_class = "defect_detected"

        # Confidence calibration for defect prediction
        class_confidence = min(99.9, max(75.0, 75.0 + (normalized_score - 1.0) * 25.0))
        reason = f"Anomaly score ({anomaly_score:.2f}) exceeds calibrated threshold ({threshold:.2f}) by {(normalized_score-1.0)*100:.1f}%."
    else:
        class_confidence = min(99.9, max(75.0, 75.0 + (1.0 - normalized_score) * 25.0))
        reason = f"Anomaly score ({anomaly_score:.2f}) is within normal operating limits (Threshold: {threshold:.2f})."

    # ── 9. Severity Scoring ──────────────────────────────────────────────────
    severity_dict = calculate_severity_score(
        anomaly_map=anomaly_map_np,
        anomaly_score=anomaly_score,
        threshold=threshold,
        defect_type=predicted_class if predicted_class not in ("good", None) else None
    )

    if is_anomaly and predicted_class == "defect_detected":
        predicted_class = severity_dict.get("inferred_defect_type", "defect_detected")

    # ── 10. Construct Final Payload ──────────────────────────────────────────
    return {
        "category":            category,
        "is_anomaly":          is_anomaly,
        "defect_result":       defect_result,
        "defect_class":        predicted_class,
        "confidence_score":    round(class_confidence, 2),
        "anomaly_score":       round(anomaly_score, 4),
        "threshold":           round(threshold, 4),
        "normalized_score":    round(normalized_score, 4),
        "reason_for_prediction": reason,
        "severity_score":      round(severity_dict["severity_score"], 2),
        "severity_level":      severity_dict["severity_level"],
        "recommended_action":  severity_dict["recommended_action"],
        "yolo_status":         yolo_status,
        "bbox":                primary_bbox,
        "bounding_boxes":      all_bboxes,
        "defect_count":        localization_info["defect_count"],
        "total_defect_area":   localization_info["total_defect_area"],
        "localized_regions":   localization_info["localized_regions"],
        "class_probabilities": class_probs,
        "quality_report":      quality_report,
        "severity_breakdown":  severity_dict["breakdown"],
        # Base64 encoded image URIs for UI presentation
        "original_image":      pil_to_base64_uri(pil_img),
        "cropped_image":       pil_to_base64_uri(cropped_img),
        "reconstructed_image": pil_to_base64_uri(contour_overlay_pil),
        "heatmap_image":       pil_to_base64_uri(heatmap_pil),
        "overlay_image":       pil_to_base64_uri(overlay_pil),
        "mask_image":          pil_to_base64_uri(localization_info["segmentation_mask"])
    }
