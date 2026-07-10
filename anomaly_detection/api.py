import io
import base64
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
import torch
from torchvision import transforms
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from . import config
from .model import AnomalyAutoencoder
from .yolo_helper import crop_product

app = FastAPI(
    title="VisionInspect AI - Anomaly Detection API",
    description="API for detecting manufacturing defects using Unsupervised Convolutional Autoencoders.",
    version="1.1.0"
)

# Allow CORS for integration with frontend (React / Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold model and category
model = None
current_category = None
device = torch.device(config.DEVICE)

# Define prediction transform (same as test split)
predict_transform = transforms.Compose([
    transforms.Resize(config.IMAGE_SIZE),
    transforms.ToTensor()
])

# Calibrated default thresholds for all 15 MVTec AD categories
THRESHOLDS = {
    "bottle": 0.017216,
    "cable": 0.028136,
    "capsule": 0.005667,
    "carpet": 0.014516,
    "grid": 0.011530,
    "hazelnut": 0.008952,
    "leather": 0.004567,
    "metal_nut": 0.025286,
    "pill": 0.008796,
    "screw": 0.011649,
    "tile": 0.034607,
    "toothbrush": 0.069813,
    "transistor": 0.019222,
    "wood": 0.008313,
    "zipper": 0.015190
}

HTML_PATH = Path(__file__).resolve().parent / "dashboard.html"

def load_model_for_category(category: str):
    """Dynamically loads category-specific model weights if not already loaded."""
    global model, current_category
    category = category.lower()
    
    if model is None or current_category != category:
        model = AnomalyAutoencoder().to(device)
        model_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
        if model_path.exists():
            try:
                # Load weight file
                model.load_state_dict(torch.load(model_path, map_location=device))
                model.eval()
                current_category = category
                print(f"Loaded trained model weights for category '{category}' from {model_path}")
            except Exception as e:
                print(f"Error loading model weights for '{category}': {e}. Model running with random weights.")
                model.eval()
                current_category = category
        else:
            print(f"No trained model weights found for '{category}' at {model_path}. Running in baseline mode.")
            model.eval()
            current_category = category
            
    return model

@app.on_event("startup")
async def startup_event():
    # Pre-load bottle category by default
    load_model_for_category("bottle")

@app.get("/", response_class=HTMLResponse)
def get_dashboard():
    """Serves the interactive Visual Defect Detection Dashboard."""
    if HTML_PATH.exists():
        with open(HTML_PATH, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    return HTMLResponse(content="<h1>Dashboard file (dashboard.html) not found.</h1>", status_code=404)

@app.get("/status")
def get_status(category: str = "bottle"):
    """Returns the current server status and configuration."""
    category = category.lower()
    model_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
    return {
        "status": "online",
        "category": category,
        "device": str(device),
        "model_loaded": model_path.exists(),
        "anomaly_threshold": THRESHOLDS.get(category, 0.05)
    }

def image_to_base64(img_np):
    """Converts a numpy RGB image (0-255) to a base64 encoded JPEG data URI string."""
    # Convert RGB to BGR for OpenCV encoding
    img_bgr = cv2.cvtColor(img_np.astype(np.uint8), cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', img_bgr)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

@app.post("/predict")
async def predict(
    file: UploadFile = File(...), 
    category: str = "bottle",
    enable_yolo: bool = True
):
    """
    Primary quality inspection endpoint. 
    Accepts image file, runs Stage 1 (YOLO) crop, Stage 2 (Autoencoder) reconstruction, 
    and returns Pass/Fail result and visual base64 image steps.
    """
    category = category.lower()
    
    # 1. Read uploaded file
    try:
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
        
    orig_w, orig_h = pil_img.size
    
    # 2. Stage 1: Crop product with YOLO helper
    cropped_img, bbox, yolo_status = crop_product(pil_img, category=category, enable_yolo=enable_yolo)
    
    # 3. Load model weights for the active category
    active_model = load_model_for_category(category)
    active_threshold = THRESHOLDS.get(category, 0.05)
    
    # 4. Preprocess full image for the Autoencoder input (aligning with model training data)
    input_tensor = predict_transform(pil_img).unsqueeze(0).to(device)
    
    # 5. Stage 2: Autoencoder reconstruction and anomaly calculation
    with torch.no_grad():
        reconstructed_tensor, anomaly_map_tensor, anomaly_score_tensor = active_model.compute_anomaly_map(input_tensor)
        anomaly_score = anomaly_score_tensor.item()
        
    # Classify based on calibrated threshold
    is_anomaly = anomaly_score > active_threshold
    
    # 6. Prepare visual assets for frontend dashboard rendering
    input_np = (input_tensor.squeeze(0).cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    recon_np = (reconstructed_tensor.squeeze(0).cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    
    # Normalize anomaly map to [0, 255] range for visualization
    anomaly_map_np = anomaly_map_tensor.squeeze(0).cpu().numpy()
    max_val = anomaly_map_np.max()
    if max_val > 0:
        anomaly_map_norm = (anomaly_map_np / max_val * 255).astype(np.uint8)
    else:
        anomaly_map_norm = np.zeros_like(anomaly_map_np, dtype=np.uint8)
        
    # Generate Heatmap (colormapped JET)
    heatmap = cv2.applyColorMap(anomaly_map_norm, cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB) # convert to RGB
    
    # Create overlay (original full image blended with heatmap)
    overlay = cv2.addWeighted(input_np, 0.6, heatmap, 0.4, 0)
    
    # If YOLO cropped, let's draw a bounding box on the original image for frontend visualization
    original_np = np.array(pil_img)
    if bbox is not None:
        x1, y1, x2, y2 = bbox
        # Draw red bounding box (thickness 4)
        cv2.rectangle(original_np, (x1, y1), (x2, y2), (216, 59, 1), 4)
        
    # Convert cropped image to standard display numpy shape
    cropped_np = np.array(cropped_img.resize(config.IMAGE_SIZE))
        
    # Convert outputs to base64 strings
    original_b64 = image_to_base64(original_np)
    cropped_b64 = image_to_base64(cropped_np)
    reconstructed_b64 = image_to_base64(recon_np)
    heatmap_b64 = image_to_base64(heatmap)
    overlay_b64 = image_to_base64(overlay)
    
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 6),
        "threshold": active_threshold,
        "category": category,
        "yolo_status": yolo_status,
        "bbox": bbox,
        "original_image": original_b64,
        "cropped_image": cropped_b64,
        "reconstructed_image": reconstructed_b64,
        "heatmap_image": heatmap_b64,
        "overlay_image": overlay_b64
    }

@app.post("/reload")
def reload_model_weights(category: str = "bottle"):
    """Reloads the category-specific model weights from disk."""
    try:
        load_model_for_category(category)
        return {"status": "success", "message": f"Model weights for category '{category}' reloaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
