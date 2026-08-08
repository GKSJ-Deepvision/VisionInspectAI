

import os
import shutil
import tempfile
from datetime import datetime

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from predict import predict_image, RESULTS_DIR, HEATMAP_OUTPUT_DIR

app = FastAPI(
    title="VisionInspect AI - Inference API",
    description="Serves PatchCore anomaly detection models trained in Milestone 2.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(HEATMAP_OUTPUT_DIR, exist_ok=True)
app.mount("/predictions", StaticFiles(directory=HEATMAP_OUTPUT_DIR), name="predictions")

ALL_CATEGORIES = [
    "bottle", "cable", "capsule", "carpet", "grid",
    "hazelnut", "leather", "metal_nut", "pill", "screw",
    "tile", "toothbrush", "transistor", "wood", "zipper",
]


def get_severity(pred_label: str, pred_score: float) -> str:
    if pred_label == "Normal":
        return "None"
    if pred_score >= 0.85:
        return "Critical"
    if pred_score >= 0.70:
        return "High"
    if pred_score >= 0.50:
        return "Medium"
    return "Low"


@app.get("/health")
def health():
    import torch
    return {
        "status": "ok",
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/categories")
def categories():
    available = []
    missing = []
    for cat in ALL_CATEGORIES:
        ckpt_dir = os.path.join(RESULTS_DIR, "Patchcore", "MVTecAD", cat)
        has_ckpt = os.path.isdir(ckpt_dir) and any(
            f.endswith(".ckpt")
            for _, _, files in os.walk(ckpt_dir)
            for f in files
        )
        (available if has_ckpt else missing).append(cat)
    return {"available": available, "missing": missing, "total": len(ALL_CATEGORIES)}


@app.post("/predict")
async def predict(category: str = Form(...), image: UploadFile = File(...)):
    if category not in ALL_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown category '{category}'. Must be one of: {ALL_CATEGORIES}",
        )

    suffix = os.path.splitext(image.filename or "upload.png")[1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(image.file, tmp)
        tmp_path = tmp.name

    try:
        result = predict_image(category, tmp_path, save_heatmap=True)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
    finally:
        os.remove(tmp_path)

    severity = get_severity(result["pred_label"], result["pred_score"])
    verdict = "FAIL" if result["pred_label"] == "Defective" else "PASS"

    heatmap_url = None
    if "heatmap_path" in result:
        heatmap_filename = os.path.basename(result["heatmap_path"])
        heatmap_url = f"/predictions/{heatmap_filename}"

    return {
        "category": category,
        "original_filename": image.filename,
        "pred_label": result["pred_label"],
        "pred_score": result["pred_score"],
        "severity": severity,
        "verdict": verdict,
        "heatmap_url": heatmap_url,
        "timestamp": datetime.now().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)