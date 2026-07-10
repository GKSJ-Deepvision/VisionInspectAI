import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import PermissionChecker
from rbac import Permission
from models.image import UploadedImage
from models.inspection import Inspection

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])


@router.get("")
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker(Permission.VIEW_DASHBOARD))
):
    """
    Computes quality control stats and retrieves recent inspections log entries.
    """
    # 1. Compute aggregate statistics
    total_inspections = db.query(Inspection).count()
    defective_inspections = db.query(Inspection).filter(Inspection.prediction == "Defective").count()
    
    # Calculate Pass Rate percentage
    if total_inspections > 0:
        pass_rate = round(((total_inspections - defective_inspections) / total_inspections) * 100, 1)
    else:
        pass_rate = 100.0

    # 2. Retrieve recent 5 inspections with joined image filenames
    recent_inspections_raw = (
        db.query(Inspection, UploadedImage)
        .join(UploadedImage, Inspection.image_id == UploadedImage.id)
        .order_by(Inspection.created_at.desc())
        .limit(5)
        .all()
    )
    
    recent_inspections = []
    for inspection, image in recent_inspections_raw:
        recent_inspections.append({
            "id": inspection.id,
            "image_id": inspection.image_id,
            "filename": image.filename,
            "filepath": f"/uploads/{os.path.basename(image.filepath)}",
            "prediction": inspection.prediction or "Pending",
            "confidence": f"{round(inspection.confidence * 100, 1)}%" if inspection.confidence else "0%",
            "severity": inspection.severity or "None",
            "status": inspection.status,
            "created_at": inspection.created_at
        })

    return {
        "stats": {
            "total_inspected": total_inspections,
            "defects_detected": defective_inspections,
            "pass_rate": pass_rate,
            "yield_target": 95.0
        },
        "recent_inspections": recent_inspections
    }
