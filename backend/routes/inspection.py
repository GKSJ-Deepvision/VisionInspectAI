from fastapi import APIRouter, UploadFile, File, Form, Depends
from PIL import Image
from sqlalchemy.orm import Session
from sqlalchemy import func
import io

from anomaly_detection.inference import predict_defect
from backend.report import generate_report

from backend.models.database import get_db
from backend.models.inspection_history import InspectionHistory
from backend.models.report_storage import ReportStorage
from backend.models.analytics_storage import AnalyticsStorage
from backend.models.batch_inspection import BatchInspection

from backend.auth.jwt_handler import get_current_user

from backend.services.database_service import (
    save_inspection,
    save_report,
    save_analytics,
    save_batch_inspection,
)

router = APIRouter()

@router.post("/inspect")
async def inspect_image(
    file: UploadFile = File(...),
    category: str = Form("bottle"),
    enable_yolo: bool = Form(True),
    current_user: dict = Depends(get_current_user),
):
    contents = await file.read()

    image = Image.open(io.BytesIO(contents)).convert("RGB")

    prediction_result = predict_defect(
        image,
        category=category,
        enable_yolo=enable_yolo,
    )
    prediction_result.pop("original_image", None)

    report = generate_report(prediction_result)

    username = current_user["sub"]
    image_name = file.filename

    save_inspection(
    username=username,
    image_name=image_name,
    category=prediction_result["category"],
    defect=prediction_result["defect_class"],
    result=prediction_result["defect_result"],
    confidence=prediction_result["confidence_score"],
    anomaly_score=prediction_result["anomaly_score"],
    severity_score=float(prediction_result["severity_score"]),
    severity_level=prediction_result["severity_level"],
)

    report_name = f"{image_name}_report"

    save_report(
    username=username,
    report_name=report_name,
    report_path="Generated in API response"
)

    if prediction_result["defect_result"] == "PASS":
        normal_count = 1
        defect_count = 0
    else:
        normal_count = 0
        defect_count = 1

    save_analytics(
    username=username,
    total_images=1,
    defect_count=defect_count,
    normal_count=normal_count
)

    save_batch_inspection(
    username=username,
    batch_name="Single Inspection",
    total_images=1,
    status="Completed"
)

    return {
        "inspection_result": prediction_result,
        "inspection_report": report,
    }

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    history = (
        db.query(InspectionHistory)
        .filter(
            InspectionHistory.username == current_user["sub"]
        )
        .order_by(
            InspectionHistory.created_at.desc()
        )
        .all()
    )

    return history

@router.get("/reports")
def get_reports(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reports = (
        db.query(ReportStorage)
        .filter(
            ReportStorage.username == current_user["sub"]
        )
        .order_by(
            ReportStorage.created_at.desc()
        )
        .all()
    )

    return reports

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    username = current_user["sub"]

    total_images = (
        db.query(func.sum(AnalyticsStorage.total_images))
        .filter(AnalyticsStorage.username == username)
        .scalar()
    ) or 0

    total_defects = (
        db.query(func.sum(AnalyticsStorage.defect_count))
        .filter(AnalyticsStorage.username == username)
        .scalar()
    ) or 0

    total_normal = (
        db.query(func.sum(AnalyticsStorage.normal_count))
        .filter(AnalyticsStorage.username == username)
        .scalar()
    ) or 0

    return {
        "username": username,
        "total_images": total_images,
        "defect_count": total_defects,
        "normal_count": total_normal,
    }

@router.get("/batches")
def get_batches(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    username = current_user["sub"]

    batches = (
        db.query(BatchInspection)
        .filter(BatchInspection.username == username)
        .order_by(BatchInspection.created_at.desc())
        .all()
    )

    return batches