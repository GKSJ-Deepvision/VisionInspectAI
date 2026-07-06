import io
import base64
from PIL import Image
import numpy as np
import cv2
import torch
from torchvision import transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from . import config
from .model import AnomalyAutoencoder

app = FastAPI(
    title="VisionInspect AI - Anomaly Detection API",
    description="API for detecting manufacturing defects using Unsupervised Convolutional Autoencoders.",
    version="1.0.0"
)

# Allow CORS for integration with frontend (React / Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold model and threshold
model = None
device = torch.device(config.DEVICE)

# Define prediction transform (same as test split)
predict_transform = transforms.Compose([
    transforms.Resize(config.IMAGE_SIZE),
    transforms.ToTensor()
])

def load_model():
    global model
    model = AnomalyAutoencoder().to(device)
    if config.MODEL_PATH.exists():
        try:
            model.load_state_dict(torch.load(config.MODEL_PATH, map_location=device))
            model.eval()
            print(f"Loaded trained model weights from {config.MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model weights: {e}. Model running with uninitialized weights.")
    else:
        print(f"No trained model found at {config.MODEL_PATH}. Running in baseline/uninitialized mode.")
    model.eval()

@app.on_event("startup")
async def startup_event():
    load_model()

@app.get("/status")
def get_status():
    return {
        "status": "online",
        "category": config.CATEGORY,
        "device": str(device),
        "model_loaded": config.MODEL_PATH.exists(),
        "anomaly_threshold": config.ANOMALY_THRESHOLD
    }

def image_to_base64(img_np):
    """Converts a numpy RGB image (0-255) to a base64 encoded JPEG data URI string."""
    # Convert RGB to BGR for OpenCV encoding
    img_bgr = cv2.cvtColor(img_np.astype(np.uint8), cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', img_bgr)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global model
    if model is None:
        load_model()
        
    # Read uploaded file
    try:
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
        
    # Original image size for scaling back visual outputs if needed
    orig_w, orig_h = pil_img.size
    
    # Preprocess image for model input
    input_tensor = predict_transform(pil_img).unsqueeze(0).to(device) # Shape: [1, 3, H, W]
    
    # Model inference
    with torch.no_grad():
        reconstructed_tensor = model(input_tensor)
        
        # Calculate anomaly map (pixel-wise MSE across channels)
        # Shape: [1, H, W]
        anomaly_map_tensor = torch.mean((input_tensor - reconstructed_tensor) ** 2, dim=1)
        
        # Mean anomaly score for the image
        anomaly_score = torch.mean(anomaly_map_tensor).item()
        
    # Classify based on threshold
    is_anomaly = anomaly_score > config.ANOMALY_THRESHOLD
    
    # Prepare visual assets for frontend dashboard rendering
    # Convert tensors back to numpy format [H, W, C] in range [0, 255]
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
    
    # Create overlay (original image blended with heatmap)
    overlay = cv2.addWeighted(input_np, 0.6, heatmap, 0.4, 0)
    
    # Convert outputs to base64 strings
    original_b64 = image_to_base64(input_np)
    reconstructed_b64 = image_to_base64(recon_np)
    heatmap_b64 = image_to_base64(heatmap)
    overlay_b64 = image_to_base64(overlay)
    
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 6),
        "threshold": config.ANOMALY_THRESHOLD,
        "category": config.CATEGORY,
        "original_image": original_b64,
        "reconstructed_image": reconstructed_b64,
        "heatmap_image": heatmap_b64,
        "overlay_image": overlay_b64
    }

@app.post("/reload")
def reload_model_weights():
    """Reloads the model weights from disk (e.g. after training)."""
    try:
        load_model()
        return {"status": "success", "message": "Model weights reloaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
