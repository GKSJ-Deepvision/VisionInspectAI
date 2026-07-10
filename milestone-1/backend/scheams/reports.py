import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import PermissionChecker
from rbac import Permission
from models.image import UploadedImage
from models.inspection import Inspection
from models.report import Report

router = APIRouter(prefix="/reports", tags=["Quality Inspection Reports"])


@router.get("")
def get_inspection_reports_list(
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker(Permission.VIEW_REPORTS))
):
    """
    Retrieves all inspection records in PostgreSQL to populate the report log table.
    """
    reports_raw = (
        db.query(Inspection, UploadedImage)
        .join(UploadedImage, Inspection.image_id == UploadedImage.id)
        .order_by(Inspection.created_at.desc())
        .all()
    )
    
    reports = []
    for inspection, image in reports_raw:
        # Search for corresponding report path if it exists
        report_record = db.query(Report).filter(Report.inspection_id == inspection.id).first()
        report_path = report_record.report_path if report_record else None
        
        reports.append({
            "id": f"INSP-{inspection.id}",
            "inspection_db_id": inspection.id,
            "created_at": inspection.created_at,
            "item": image.filename,
            "prediction": inspection.prediction or "Pending",
            "confidence": f"{round(inspection.confidence * 100, 1)}%" if inspection.confidence else "0%",
            "severity": inspection.severity or "None",
            "status": inspection.status,
            "report_path": report_path
        })
        
    return reports
