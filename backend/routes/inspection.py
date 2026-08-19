from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
    Response,
)
from PIL import Image
from sqlalchemy.orm import Session
from sqlalchemy import func
import io

from backend.pdf_report import (
    generate_single_inspection_pdf,
    generate_history_pdf,
)

from anomaly_detection.inference import predict_defect
from backend.report import generate_report

from backend.models.database import get_db
from backend.models.inspection_history import InspectionHistory
from backend.models.report_storage import ReportStorage
from backend.models.analytics_storage import AnalyticsStorage
from backend.models.batch_inspection import BatchInspection

from backend.services.database_service import (
    save_inspection,
    save_report,
    save_analytics,
    save_batch_inspection,
)

from backend.auth.jwt_handler import (
    get_current_user,
    require_admin,
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

    username = current_user["sub"]
    image_name = file.filename or "uploaded_image"

    prediction_result["image_name"] = image_name
    report = generate_report(prediction_result)


    inspection_id = save_inspection(
        username=username,
        image_name=image_name,
        category=prediction_result["category"],
        defect=prediction_result["defect_class"],
        result=prediction_result["defect_result"],
        confidence=prediction_result["confidence_score"],
        anomaly_score=prediction_result["anomaly_score"],
        severity_score=float(prediction_result["severity_score"]),
        severity_level=prediction_result["severity_level"],
        threshold=prediction_result.get("threshold"),
        recommended_action=prediction_result.get("recommended_action"),
        class_probabilities=prediction_result.get("class_probabilities"),
        severity_breakdown=prediction_result.get("severity_breakdown"),
        quality_report=prediction_result.get("quality_report"),
        processing_time_ms=prediction_result.get("processing_time_ms"),
    )
    prediction_result["inspection_id"] = inspection_id

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
    current_user: dict = Depends(get_current_user),
):
    query = db.query(
        InspectionHistory
    )

    if current_user.get("role") != "admin":
        query = query.filter(
            InspectionHistory.username ==
            current_user["sub"]
        )

    return (
        query
        .order_by(
            InspectionHistory.created_at.desc()
        )
        .all()
    )

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
    current_user: dict = Depends(get_current_user),
):
    query = db.query(
        AnalyticsStorage
    )

    if current_user.get("role") != "admin":
        query = query.filter(
            AnalyticsStorage.username ==
            current_user["sub"]
        )

    total_images = (
        query.with_entities(
            func.sum(
                AnalyticsStorage.total_images
            )
        ).scalar()
    ) or 0

    total_defects = (
        query.with_entities(
            func.sum(
                AnalyticsStorage.defect_count
            )
        ).scalar()
    ) or 0

    total_normal = (
        query.with_entities(
            func.sum(
                AnalyticsStorage.normal_count
            )
        ).scalar()
    ) or 0

    return {
        "username":
            current_user["sub"],

        "total_images":
            total_images,

        "defect_count":
            total_defects,

        "normal_count":
            total_normal,
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

@router.get("/admin/history")
def get_all_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    history = (
        db.query(InspectionHistory)
        .order_by(InspectionHistory.created_at.desc())
        .all()
    )

    return history

@router.get("/admin/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    total_images = (
        db.query(func.sum(AnalyticsStorage.total_images))
        .scalar()
    ) or 0

    total_defects = (
        db.query(func.sum(AnalyticsStorage.defect_count))
        .scalar()
    ) or 0

    total_normal = (
        db.query(func.sum(AnalyticsStorage.normal_count))
        .scalar()
    ) or 0

    return {
        "total_images": total_images,
        "defect_count": total_defects,
        "normal_count": total_normal,
    }

@router.get("/report/{inspection_id}/pdf")
def download_inspection_pdf(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    entry = (
        db.query(InspectionHistory)
        .filter(
            InspectionHistory.id == inspection_id
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found."
        )

    # Normal users can only access their own inspection.
    if (
        current_user.get("role") != "admin"
        and entry.username != current_user["sub"]
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access this inspection."
        )

    pdf_bytes = generate_single_inspection_pdf(entry)

    filename = (
        f"inspection_{entry.id}_report.pdf"
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )   

@router.get("/reports/history/pdf")
def download_my_history_pdf(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    entries = (
        db.query(InspectionHistory)
        .filter(
            InspectionHistory.username == current_user["sub"]
        )
        .order_by(
            InspectionHistory.created_at.desc()
        )
        .all()
    )

    pdf_bytes = generate_history_pdf(
        entries,
        title="My Inspection History Report",
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                'attachment; filename="my_inspection_history.pdf"'
            )
        },
    )

@router.get("/admin/reports/history/pdf")
def download_all_history_pdf(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    entries = (
        db.query(InspectionHistory)
        .order_by(
            InspectionHistory.created_at.desc()
        )
        .all()
    )

    pdf_bytes = generate_history_pdf(
        entries,
        title="Supervisor Inspection History Report",
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                'attachment; filename="all_inspection_history.pdf"'
            )
        },
    )