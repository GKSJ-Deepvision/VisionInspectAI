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
from backend.routes.upload import router as upload_router
from backend.routes.preprocess import router as preprocess_router
from backend.routes.dataset import router as dataset_router
from backend.routes.augmentation import router as augmentation_router
from backend.routes.statistics import router as statistics_router

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

app.include_router(upload_router)
app.include_router(preprocess_router)
app.include_router(dataset_router)
app.include_router(augmentation_router)
app.include_router(statistics_router)

# Mount Static Assets Directory
STATIC_DIR = Path(__file__).resolve().parent.parent / "frontend"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

TEMPLATE_PATH = STATIC_DIR / "index.html"
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

# Pipeline-consistent thresholds optimized for balanced accuracy
THRESHOLDS = config.CATEGORY_THRESHOLDS

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
    # Pre-load autoencoder for default category at startup
    from anomaly_detection.inference import load_autoencoder
    load_autoencoder("bottle")

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
    import time
    t0 = time.time()
    category = category.lower()
    from anomaly_detection.inference import predict_defect
    result = predict_defect(pil_img, category=category, enable_yolo=enable_yolo)
    proc_time_ms = round((time.time() - t0) * 1000.0, 2)
    
    inspection_id = inspection_log.add_entry(
        category=category,
        is_anomaly=result["is_anomaly"],
        anomaly_score=result["anomaly_score"],
        threshold=result["threshold"],
        severity_score=result["severity_score"],
        severity_level=result["severity_level"],
        recommended_action=result["recommended_action"],
        inferred_defect_type=result["defect_class"],
        severity_breakdown=result["severity_breakdown"],
        quality_report=result["quality_report"],
        filename=filename
    )

    return {
        "inspection_id": inspection_id,
        "category": result.get("category", category),
        "is_anomaly": result["is_anomaly"],
        "defect_result": result["defect_result"],
        "defect_class": result["defect_class"],
        "confidence_score": result["confidence_score"] / 100.0 if result["confidence_score"] > 1.0 else result["confidence_score"],
        "anomaly_score": result["anomaly_score"],
        "threshold": result["threshold"],
        "severity_score": result["severity_score"],
        "severity_level": result["severity_level"],
        "recommended_action": result["recommended_action"],
        "processing_time_ms": proc_time_ms,
        "yolo_status": result["yolo_status"],
        "bbox": result["bbox"],
        "class_probabilities": result["class_probabilities"],
        "quality_report": result["quality_report"],
        "severity_breakdown": result["severity_breakdown"],
        "original_image":      result["original_image"],
        "cropped_image":       result["cropped_image"],
        "reconstructed_image": result["reconstructed_image"],
        "heatmap_image":       result["heatmap_image"],
        "overlay_image":       result["overlay_image"],
        "images": {
            "original":      result["original_image"],
            "cropped":       result["cropped_image"],
            "reconstructed": result["reconstructed_image"],
            "heatmap":       result["heatmap_image"],
            "overlay":       result["overlay_image"],
            "defect_overlay":result["overlay_image"],
            "defect_crop":   result["cropped_image"]
        }
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
