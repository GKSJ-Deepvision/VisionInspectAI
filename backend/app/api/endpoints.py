import os
import time
import cv2
import numpy as np
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.core.database import get_db
import app.models as db_models

# Import run_pipeline from visualization package
from visulization.src.pipeline import run_pipeline

router = APIRouter()

# Directory constants
RAW_DIR = Path("storage/raw_images")
HEATMAP_DIR = Path("storage/heatmaps")

RAW_DIR.mkdir(parents=True, exist_ok=True)
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Dynamic analytics endpoint pulling directly from database records."""
    records = db.query(db_models.InspectionRecord).all()
    total_inspections = len(records)
    
    if total_inspections == 0:
        return {
            "shift_throughput": 0,
            "total_inspections": 0,
            "pass_rate": 100.0,
            "rejection_rate": 0.0,
            "failed_inspections": 0,
            "avg_latency_ms": 0.0,
            "defects_breakdown": {
                "Surface Scratch": 0,
                "Pitting / Specks": 0,
                "Misalignment": 0,
                "Debris": 0
            }
        }

    failed_inspections = sum(1 for r in records if r.pass_fail_decision == "FAIL")
    pass_count = total_inspections - failed_inspections
    
    pass_rate = round((pass_count / total_inspections) * 100, 1)
    rejection_rate = round((failed_inspections / total_inspections) * 100, 1)
    avg_latency = round(sum(r.latency_ms or 0 for r in records) / total_inspections, 1)

    # Calculate real defect breakdown
    defects = {}
    for r in records:
        if r.pass_fail_decision == "FAIL" and r.defect_type:
            defects[r.defect_type] = defects.get(r.defect_type, 0) + 1

    return {
        "shift_throughput": total_inspections,
        "total_inspections": total_inspections,
        "pass_rate": pass_rate,
        "rejection_rate": rejection_rate,
        "failed_inspections": failed_inspections,
        "avg_latency_ms": avg_latency,
        "defects_breakdown": defects if defects else {"None": 0}
    }


@router.post("/inspect")
async def inspect_product(
    request: Request,
    file: UploadFile = File(...),
    product_sku: str = Form("MVI-PROD-2026"),
    db: Session = Depends(get_db),
):
    """Product inspection endpoint integrating ML Engine & Database persistence."""
    start_time = time.time()
    base_url = str(request.base_url).rstrip("/")

    # 1. Read input image file bytes
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(
            status_code=400, detail="Invalid image file or unreadable format."
        )

    # 2. Save original raw image
    timestamp = int(time.time() * 1000)
    raw_filename = f"raw_{timestamp}.jpg"
    raw_file_path = RAW_DIR / raw_filename
    cv2.imwrite(str(raw_file_path), image)

    # 3. Run full Pipeline Inspection on a worker thread pool (non-blocking)
    try:
        ml_results = await run_in_threadpool(run_pipeline, str(raw_file_path))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Pipeline execution failed: {str(e)}"
        )

    # 4. Map ML Prediction Engine outputs safely to DB Fields
    is_defective = ml_results.get("is_defective", False)
    decision = str(
        ml_results.get("pass_fail_decision", ml_results.get("Decision", ml_results.get("verdict", "")))
    ).upper()
    
    if is_defective or decision in ["FAIL", "REVIEW", "DEFECTIVE"]:
        verdict = "FAIL"
        is_defective = True
    else:
        verdict = "PASS"
        is_defective = False

    # Extract Defect Classification
    defect_type = ml_results.get("defect_type", ml_results.get("Defect Type", ml_results.get("classification", "Normal")))
    if defect_type in ["None", "Defective"]:
        defect_type = "Surface Defect" if is_defective else "Normal"

    # Extract Severity Score
    if "overall_severity_score" in ml_results:
        severity_score = round(float(ml_results["overall_severity_score"]), 2)
    elif "Overall" in ml_results:
        severity_score = round(float(ml_results["Overall"]), 2)
    elif "severity_score" in ml_results:
        severity_score = round(float(ml_results["severity_score"]), 2)
    else:
        anomaly_score = float(ml_results.get("anomaly_score", 0.0))
        severity_score = round(anomaly_score * 100, 2)

    # Confidence score mapping
    raw_confidence = ml_results.get("confidence_score", ml_results.get("Confidence", ml_results.get("confidence", 0.85)))
    confidence_score = (
        float(raw_confidence * 100) if float(raw_confidence) <= 1.0 else float(raw_confidence)
    )

    matched_category = ml_results.get("matched_category", "bottle")

    # Classical Features extracted from pipeline
    texture_score = float(ml_results.get("texture_score", 0.0))
    edge_density_score = float(ml_results.get("edge_density_score", 0.0))

    # Construct Image URLs dynamically based on incoming request host/protocol
    raw_url = f"{base_url}/storage/raw_images/{raw_filename}"

    heatmap_local = ml_results.get("heatmap_path") or ml_results.get("heatmap_image_path")
    if heatmap_local and os.path.exists(str(heatmap_local)):
        heatmap_filename = os.path.basename(heatmap_local)
        heatmap_url = f"{base_url}/storage/heatmaps/{heatmap_filename}"
    else:
        # Fallback heatmap generation directly on grayscale image
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        heatmap_img = cv2.applyColorMap(gray, cv2.COLORMAP_JET)
        heatmap_filename = f"heatmap_{timestamp}.jpg"
        cv2.imwrite(str(HEATMAP_DIR / heatmap_filename), heatmap_img)
        heatmap_url = f"{base_url}/storage/heatmaps/{heatmap_filename}"

    latency_ms = round((time.time() - start_time) * 1000, 2)

    # 5. Populate InspectionRecord
    inspection_record = db_models.InspectionRecord(
        product_sku=product_sku,
        pass_fail_decision=verdict,
        is_defective=is_defective,
        defect_type=defect_type,
        confidence_score=confidence_score,
        severity_score=severity_score,
        matched_category=matched_category,
        texture_score=texture_score,
        edge_density_score=edge_density_score,
        raw_image_path=raw_url,
        processed_image_path=raw_url,
        heatmap_image_path=heatmap_url,
        status="COMPLETED",
        latency_ms=latency_ms,
        processing_latency_ms=latency_ms,
    )

    # 6. Commit transaction safely
    try:
        db.add(inspection_record)
        db.commit()
        db.refresh(inspection_record)
    except Exception as db_err:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database insert error: {str(db_err)}"
        )

    # 7. Return complete API response structure
    return {
        "id": inspection_record.inspection_id,
        "product_sku": inspection_record.product_sku,
        "pass_fail_decision": inspection_record.pass_fail_decision,
        "is_defective": inspection_record.is_defective,
        "severity_score": inspection_record.severity_score,
        
        # Pass all key variations so React frontend catches it:
        "classification": inspection_record.defect_type,
        "defect_category": inspection_record.defect_type,
        "defect_type": inspection_record.defect_type,
        
        "matched_category": inspection_record.matched_category,
        "confidence": inspection_record.confidence_score,
        "heatmap_image_path": inspection_record.heatmap_image_path,
        "raw_image_path": inspection_record.raw_image_path,
        "latency_ms": inspection_record.latency_ms,
    }