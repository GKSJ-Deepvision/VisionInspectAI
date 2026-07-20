import io
import base64
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
import torch
from torchvision import transforms
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from . import config
from .model import AnomalyAutoencoder
from .yolo_helper import crop_product
from .preprocessor import validate_and_preprocess_image
from .severity import calculate_severity_score
from .classifier import predict_defect_class
from .inspection_log import inspection_log
from .report import generate_markdown_report

app = FastAPI(
    title="VisionInspect AI - Anomaly Detection API",
    description="API for detecting manufacturing defects using Unsupervised Convolutional Autoencoders.",
    version="1.1.0"
)

# Mount Static Assets Directory
STATIC_DIR = Path(__file__).resolve().parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

TEMPLATE_PATH = Path(__file__).resolve().parent / "templates" / "index.html"
HTML_PATH = Path(__file__).resolve().parent / "dashboard.html"

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
    "hazelnut": 0.004904,
    "leather": 0.003908,
    "metal_nut": 0.019792,
    "pill": 0.005162,
    "screw": 0.005689,
    "tile": 0.016959,
    "toothbrush": 0.066125,
    "transistor": 0.016376,
    "wood": 0.007200,
    "zipper": 0.010053
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
    target_path = TEMPLATE_PATH if TEMPLATE_PATH.exists() else HTML_PATH
    if target_path.exists():
        with open(target_path, "r", encoding="utf-8") as f:
            return HTMLResponse(
                content=f.read(),
                status_code=200,
                headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
            )
    return HTMLResponse(content="<h1>Dashboard file (index.html) not found.</h1>", status_code=404)

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

def predict_image_internal(
    pil_img: Image.Image,
    filename: str,
    category: str = "bottle",
    enable_yolo: bool = True
):
    category = category.lower()
    orig_w, orig_h = pil_img.size
    
    # 2. Stage 1: Crop product with YOLO helper
    cropped_img, bbox, yolo_status = crop_product(pil_img, category=category, enable_yolo=enable_yolo)
    
    # Product Category Validation: Check if alien / unrelated object was uploaded
    if yolo_status.startswith("INVALID_PRODUCT_IMAGE"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Product Image: Uploaded image does not match product category '{category}'."
        )

    # 3. Preprocess cropped product image for Autoencoder input
    input_tensor = predict_transform(cropped_img).unsqueeze(0).to(device)
    
    # 4. Load model weights for the active category
    active_model = load_model_for_category(category)
    active_threshold = THRESHOLDS.get(category, 0.017)

    # 5. Stage 2: Compute SSIM+MSE Anomaly Map & Multi-Class Classification
    with torch.no_grad():
        reconstructed_tensor, anomaly_map_tensor, anomaly_score_tensor = active_model.compute_anomaly_map(input_tensor)
        anomaly_score = anomaly_score_tensor.item()
        
    anomaly_map_np = anomaly_map_tensor.squeeze(0).cpu().numpy()

    # Predict multi-class sub-defect type (e.g., 'crack', 'broken_large', 'good')
    predicted_defect, confidence_pct, _ = predict_defect_class(input_tensor.cpu(), category)
    
    # Is anomaly if anomaly_score exceeds threshold AND classifier does not classify as good
    is_anomaly = (anomaly_score > active_threshold) or (predicted_defect.lower() != "good")
    defect_result = "REJECT" if is_anomaly else "PASS"
    defect_class = predicted_defect if is_anomaly else "Good"

    # Severity Calculation
    if is_anomaly:
        severity_report = calculate_severity_score(
            anomaly_map=anomaly_map_np,
            anomaly_score=anomaly_score,
            threshold=active_threshold,
            defect_type=defect_class
        )
    else:
        severity_report = {
            "severity_score": 0.0,
            "severity_level": "None",
            "recommended_action": "Pass Product - Quality Control Verified",
            "inferred_defect_type": "Good",
            "breakdown": {"coverage_pct": 0.0, "peak_anomaly": 0.0}
        }

    # 6. Specific Defect Region Bounding Box Localization (Locating the CRACK / DEFECT AREA)
    enhanced_cropped, _ = validate_and_preprocess_image(cropped_img)
    cropped_np = np.array(enhanced_cropped.resize(config.IMAGE_SIZE))
    defect_overlay_np = cropped_np.copy()
    
    defect_bbox = None
    defect_crop_np = cropped_np.copy()
    
    if is_anomaly and anomaly_map_np.max() > 0:
        # Binary mask of high anomaly intensity pixels
        mask = (anomaly_map_np > (active_threshold * 0.8)).astype(np.uint8) * 255
        mask_resized = cv2.resize(mask, (config.IMAGE_SIZE[0], config.IMAGE_SIZE[1]))
        contours, _ = cv2.findContours(mask_resized, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        valid_contours = [c for c in contours if cv2.contourArea(c) > 10]
        if valid_contours:
            all_pts = np.vstack(valid_contours)
            dx, dy, dw, dh = cv2.boundingRect(all_pts)
            defect_bbox = [int(dx), int(dy), int(dx + dw), int(dy + dh)]
            
            # Draw bright neon red bounding box around the SPECIFIC DEFECT AREA
            cv2.rectangle(defect_overlay_np, (dx, dy), (dx + dw, dy + dh), (255, 0, 80), 3)
            label = f"DEFECT: {defect_class.upper()} ({confidence_pct:.0f}%)"
            cv2.putText(defect_overlay_np, label, (dx, max(15, dy - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 2)
            
            # Crop specific defect area
            y1_crop, y2_crop = max(0, dy-8), min(config.IMAGE_SIZE[1], dy+dh+8)
            x1_crop, x2_crop = max(0, dx-8), min(config.IMAGE_SIZE[0], dx+dw+8)
            if (y2_crop - y1_crop) > 5 and (x2_crop - x1_crop) > 5:
                defect_crop_np = cropped_np[y1_crop:y2_crop, x1_crop:x2_crop]

    # Heatmap visualization
    max_val = anomaly_map_np.max()
    anomaly_map_norm = (anomaly_map_np / max_val * 255).astype(np.uint8) if max_val > 0 else np.zeros_like(anomaly_map_np, dtype=np.uint8)
    heatmap = cv2.applyColorMap(anomaly_map_norm, cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    
    # Heatmap overlay
    input_np = (input_tensor.squeeze(0).cpu().permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    overlay = cv2.addWeighted(input_np, 0.65, heatmap, 0.35, 0)
    
    # Draw YOLO bounding box on original image if available
    original_np = np.array(pil_img)
    if bbox is not None:
        x1, y1, x2, y2 = bbox
        cv2.rectangle(original_np, (x1, y1), (x2, y2), (0, 210, 255), 4)

    # Base64 encodings
    original_b64 = image_to_base64(original_np)
    cropped_b64 = image_to_base64(cropped_np)
    heatmap_b64 = image_to_base64(heatmap)
    overlay_b64 = image_to_base64(overlay)
    defect_overlay_b64 = image_to_base64(defect_overlay_np)
    defect_crop_b64 = image_to_base64(defect_crop_np)

    inspection_id = inspection_log.add_entry(
        category=category,
        is_anomaly=is_anomaly,
        anomaly_score=anomaly_score,
        threshold=active_threshold,
        severity_score=severity_report["severity_score"],
        severity_level=severity_report["severity_level"],
        recommended_action=severity_report["recommended_action"],
        inferred_defect_type=defect_class,
        severity_breakdown=severity_report["breakdown"],
        quality_report={},
        filename=filename
    )

    return {
        "inspection_id": inspection_id,
        "is_anomaly": is_anomaly,
        "defect_result": defect_result,
        "defect_class": defect_class,
        "confidence_score": confidence_pct / 100.0,
        "anomaly_score": round(anomaly_score, 6),
        "threshold": active_threshold,
        "category": category,
        "yolo_status": yolo_status,
        "product_bbox": bbox,
        "defect_bbox": defect_bbox,
        "original_image": original_b64,
        "cropped_image": cropped_b64,
        "heatmap_image": heatmap_b64,
        "overlay_image": overlay_b64,
        "defect_overlay_image": defect_overlay_b64,
        "defect_crop_image": defect_crop_b64,
        "severity_score": severity_report["severity_score"],
        "severity_level": severity_report["severity_level"],
        "recommended_action": severity_report["recommended_action"]
    }

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
    try:
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
        
    return predict_image_internal(
        pil_img=pil_img,
        filename=file.filename,
        category=category,
        enable_yolo=enable_yolo
    )

@app.post("/quality-check")
async def quality_check(file: UploadFile = File(...)):
    """
    Image quality analysis endpoint.
    Accepts an uploaded image, runs quality validation metrics, and returns the results.
    """
    try:
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # Run preprocessing and quality validation
    enhanced_pil, report = validate_and_preprocess_image(pil_img)
    
    # Convert images to base64 for visualization
    orig_np = np.array(pil_img)
    enhanced_np = np.array(enhanced_pil)
    
    orig_b64 = image_to_base64(orig_np)
    enhanced_b64 = image_to_base64(enhanced_np)
    
    return {
        "is_valid": report["is_valid"],
        "blur_score": report["blur_score"],
        "brightness": report["brightness"],
        "contrast": report["contrast"],
        "warnings": report["warnings"],
        "original_image": orig_b64,
        "enhanced_image": enhanced_b64
    }

@app.post("/batch-predict")
async def batch_predict(
    files: list[UploadFile] = File(...),
    category: str = "bottle",
    enable_yolo: bool = True
):
    """
    Batch quality inspection endpoint.
    Accepts up to 20 image files, runs the full preprocessing and defect detection pipeline on each,
    saves results to the history log, and returns an aggregated batch summary.
    """
    category = category.lower()
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum batch size is 20 images.")
        
    results = []
    anomalous_count = 0
    
    for file in files:
        try:
            # Read contents
            contents = await file.read()
            pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
            
            res = predict_image_internal(
                pil_img=pil_img,
                filename=file.filename,
                category=category,
                enable_yolo=enable_yolo
            )
            results.append(res)
            if res["is_anomaly"]:
                anomalous_count += 1
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": f"Failed to process: {str(e)}",
                "is_anomaly": False
            })
            
    return {
        "category": category,
        "batch_size": len(files),
        "anomalous_count": anomalous_count,
        "pass_count": len(files) - anomalous_count,
        "pass_rate": round(((len(files) - anomalous_count) / len(files)) * 100.0, 2) if files else 100.0,
        "results": results
    }

@app.get("/history")
def get_history(limit: int = Query(50, ge=1, le=500)):
    """Retrieves the recent quality inspections log."""
    return inspection_log.get_all(limit=limit)

@app.get("/analytics")
def get_analytics():
    """Retrieves aggregated statistics and distribution trends."""
    return inspection_log.get_analytics()

@app.get("/analytics/trends")
def get_analytics_trends():
    """Milestone 3: Returns time-series defect trend analysis and severity distributions."""
    analytics = inspection_log.get_analytics()
    recent_logs = inspection_log.get_all(limit=100)
    
    time_series = []
    for entry in reversed(recent_logs):
        time_series.append({
            "timestamp": entry.get("timestamp"),
            "category": entry.get("category"),
            "is_anomaly": entry.get("is_anomaly"),
            "anomaly_score": entry.get("anomaly_score"),
            "severity_score": entry.get("severity_score"),
            "severity_level": entry.get("severity_level"),
            "inferred_defect_type": entry.get("inferred_defect_type")
        })
        
    return {
        "summary": analytics,
        "time_series": time_series,
        "defect_type_breakdown": analytics.get("severity_distribution", {})
    }

@app.get("/analytics/risk-assessment")
def get_risk_assessment():
    """Milestone 3: Evaluates manufacturing quality risk level by product category."""
    analytics = inspection_log.get_analytics()
    category_stats = analytics.get("category_stats", {})
    
    risk_report = {}
    for cat, stats in category_stats.items():
        total = stats.get("total", 0)
        defective = stats.get("anomalous", 0)
        defect_rate = (defective / total * 100.0) if total > 0 else 0.0
        
        if defect_rate > 30.0:
            risk_level = "HIGH RISK"
            action = "Escalate to Quality Assurance Supervisor immediately"
        elif defect_rate > 10.0:
            risk_level = "MEDIUM RISK"
            action = "Monitor conveyor line calibration and tool wear"
        else:
            risk_level = "LOW RISK"
            action = "Normal operating parameters"
            
        risk_report[cat] = {
            "total_inspections": total,
            "defective_units": defective,
            "defect_rate_pct": round(defect_rate, 2),
            "risk_level": risk_level,
            "recommended_action": action
        }
        
    return {
        "overall_defect_rate": analytics.get("defect_rate", 0.0),
        "total_units_inspected": analytics.get("total_inspections", 0),
        "category_risk_levels": risk_report
    }

@app.get("/reports/production")
def get_production_report():
    """Milestone 3: Executive Manufacturing Quality & Production Summary Report."""
    analytics = inspection_log.get_analytics()
    total = analytics.get("total_inspections", 0)
    anomalous = analytics.get("anomalous_count", 0)
    pass_count = total - anomalous
    pass_rate = analytics.get("pass_rate", 100.0)
    
    return {
        "report_title": "Executive Production Quality Summary Report",
        "system_status": "OPERATIONAL",
        "total_units_inspected": total,
        "units_passed": pass_count,
        "units_rejected": anomalous,
        "yield_pass_rate_pct": pass_rate,
        "defect_rate_pct": analytics.get("defect_rate", 0.0),
        "severity_distribution": analytics.get("severity_distribution", {}),
        "category_performance": analytics.get("category_stats", {})
    }

@app.get("/report/{inspection_id}")
def get_report(inspection_id: str, format: str = Query("json", pattern="^(json|markdown|html)$")):
    """Generates and retrieves an inspection certificate by ID."""
    entry = inspection_log.get_by_id(inspection_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Inspection report not found.")
        
    if format in ("markdown", "html"):
        md_text = generate_markdown_report(entry)
        if format == "markdown":
            return HTMLResponse(content=md_text, media_type="text/plain")
        
        # Build HTML page
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Inspection Certificate - {inspection_id}</title>
    <style>
        body {{
            font-family: 'Segoe UI', system-ui, sans-serif;
            max-width: 750px;
            margin: 40px auto;
            padding: 30px;
            color: #24292e;
            background-color: #fafbfc;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }}
        h1, h2, h3 {{ color: #1b1f23; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }}
        hr {{ border: 0; border-top: 1px solid #eaecef; margin: 20px 0; }}
        blockquote {{
            border-left: 4px solid #007c10;
            background: #f6f8fa;
            padding: 12px 20px;
            margin: 15px 0;
            font-weight: 500;
        }}
        .badge {{
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
        }}
        .badge-pass {{ background-color: #d4edda; color: #155724; }}
        .badge-fail {{ background-color: #f8d7da; color: #721c24; }}
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge {'badge-fail' if entry['is_anomaly'] else 'badge-pass'}">
            {"FAIL - DEFECTIVE" if entry['is_anomaly'] else "PASS - APPROVED"}
        </span>
    </div>
    {md_text.replace('# QUALITY INSPECTION CERTIFICATE', '<h1>QUALITY INSPECTION CERTIFICATE</h1>').replace('**VisionInspect AI - Smart Quality Assurance System**', '<h3>VisionInspect AI - Smart Quality Assurance System</h3>').replace('## 📋 General Information', '<h2>📋 General Information</h2>').replace('## ⚖️ Inspection Verdict', '<h2>⚖️ Inspection Verdict</h2>').replace('## 🔍 Image Quality Control (Stage 1)', '<h2>🔍 Image Quality Control (Stage 1)</h2>').replace('## 🧠 Defect Classification & Severity (Stage 2)', '<h2>🧠 Defect Classification & Severity (Stage 2)</h2>').replace('## ⚙️ Recommended Action', '<h2>⚙️ Recommended Action</h2>').replace('### Quality Alerts:', '<h3>Quality Alerts:</h3>').replace('### Severity Component Breakdown:', '<h3>Severity Component Breakdown:</h3>').replace('\n', '<br>')}
</body>
</html>"""
        return HTMLResponse(content=html_content)
        
    return JSONResponse(content=entry)

@app.post("/reload")
def reload_model_weights(category: str = "bottle"):
    """Reloads the category-specific model weights from disk."""
    try:
        load_model_for_category(category)
        return {"status": "success", "message": f"Model weights for category '{category}' reloaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
