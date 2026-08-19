from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from PIL import Image
import io
import json

from backend.auth.jwt_handler import get_current_user
from backend.routes.auth import router as auth_router
from backend.routes.upload import router as upload_router
from backend.routes.dataset import router as dataset_router
from backend.routes.preprocess import router as preprocess_router
from backend.routes.augmentation import router as augmentation_router
from backend.routes.severity import router as severity_router
from backend.routes.statistics import router as statistics_router
from backend.routes.inspection import router as inspection_router

from backend.models.database import engine, Base, get_db
from backend.models.inspection_history import InspectionHistory

from backend.report import generate_report

from anomaly_detection.inference import predict_defect


app = FastAPI(
    title="VisionInspect AI",
    version="1.1.0",
    description="Manufacturing Defect Detection Backend"
)


def normalize_category(category: str) -> str:
    category = category.strip().lower()

    aliases = {
        "metalnut": "metal_nut",
    }

    return aliases.get(category, category)


# ------------------------------------------------------------------
# Database
# ------------------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ------------------------------------------------------------------
# Routers
# ------------------------------------------------------------------

app.include_router(upload_router)
app.include_router(dataset_router)
app.include_router(preprocess_router)
app.include_router(augmentation_router)
app.include_router(severity_router)
app.include_router(statistics_router)
app.include_router(auth_router)
app.include_router(inspection_router)


# ------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://visioninspect-m9s6mn1x0-ruchira807s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Basic endpoint
# ------------------------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to VisionInspect AI Backend!",
        "status": "online"
    }


# ------------------------------------------------------------------
# Status
# ------------------------------------------------------------------

@app.get("/status")
def get_status(category: str = "bottle"):
    return {
        "status": "online",
        "category": normalize_category(category),
    }


# ------------------------------------------------------------------
# Main prediction endpoint
# ------------------------------------------------------------------

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    category: str = "bottle",
    enable_yolo: bool = True
):
    try:
        category = normalize_category(category)
        contents = await file.read()

        image = Image.open(io.BytesIO(contents)).convert("RGB")

        result = predict_defect(
            image,
            category=category.lower(),
            enable_yolo=enable_yolo
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Prediction failed: {str(e)}"
        )


# ------------------------------------------------------------------
# Batch prediction
# ------------------------------------------------------------------

@app.post("/batch-predict")
async def batch_predict(
    files: list[UploadFile] = File(...),
    category: str = "bottle",
    enable_yolo: bool = True
):
    category = normalize_category(category)

    if len(files) > 20:
        raise HTTPException(
            status_code=400,
            detail="Maximum batch size is 20 images."
        )

    results = []
    anomalous_count = 0

    for file in files:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")

            result = predict_defect(
                image,
                category=category,
                enable_yolo=enable_yolo
            )

            results.append({
                "filename": file.filename,
                **result
            })

            if result.get("is_anomaly"):
                anomalous_count += 1

        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "is_anomaly": False
            })

    total = len(files)
    pass_count = total - anomalous_count

    return {
        "category": category,
        "batch_size": total,
        "anomalous_count": anomalous_count,
        "pass_count": pass_count,
        "pass_rate": round(
            (pass_count / total) * 100,
            2
        ) if total else 100.0,
        "results": results
    }


# ------------------------------------------------------------------
# Analytics
# ------------------------------------------------------------------

@app.get("/analytics/trends")
def get_analytics_trends(
    db: Session = Depends(get_db)
):
    records = (
        db.query(InspectionHistory)
        .order_by(InspectionHistory.created_at.asc())
        .all()
    )

    time_series = []

    for entry in records:
        time_series.append({
            "timestamp": entry.created_at.isoformat() if entry.created_at else None,
            "category": entry.category,
            "is_anomaly": entry.result == "REJECT",
            "anomaly_score": entry.anomaly_score,
            "severity_score": entry.severity_score,
            "severity_level": entry.severity_level,
            "inferred_defect_type": entry.defect,
        })

    total = len(records)
    defective = sum(1 for entry in records if entry.result == "REJECT")
    passed = total - defective

    severity_distribution = {
        "Critical": sum(1 for e in records if e.severity_level == "Critical"),
        "High": sum(1 for e in records if e.severity_level == "High"),
        "Medium": sum(1 for e in records if e.severity_level == "Medium"),
        "Low": sum(1 for e in records if e.severity_level == "Low"),
    }

    category_stats = {}

    for entry in records:
        category = entry.category or "unknown"

        if category not in category_stats:
            category_stats[category] = {
                "total": 0,
                "anomalous": 0
            }

        category_stats[category]["total"] += 1

        if entry.result == "REJECT":
            category_stats[category]["anomalous"] += 1

    defect_rate = (
        (defective / total) * 100
        if total
        else 0.0
    )

    pass_rate = (
        (passed / total) * 100
        if total
        else 100.0
    )

    return {
        "summary": {
            "total_inspections": total,
            "pass_rate": round(pass_rate, 2),
            "defect_rate": round(defect_rate, 2),
            "anomalous_count": defective,
            "severity_distribution": severity_distribution,
            "category_stats": category_stats,
        },
        "time_series": time_series,
        "defect_type_breakdown": severity_distribution,
    }


@app.get("/analytics/risk-assessment")
def get_risk_assessment(
    db: Session = Depends(get_db)
):
    records = db.query(InspectionHistory).all()

    category_risk = {}

    categories = set(
        entry.category or "unknown"
        for entry in records
    )

    for category in categories:
        category_records = [
            entry
            for entry in records
            if (entry.category or "unknown") == category
        ]

        total = len(category_records)

        defective = sum(
            1
            for entry in category_records
            if entry.result == "REJECT"
        )

        defect_rate = (
            defective / total * 100
            if total
            else 0.0
        )

        if defect_rate > 30:
            risk_level = "HIGH RISK"
            action = (
                "Escalate to Quality Assurance "
                "Supervisor immediately"
            )
        elif defect_rate > 10:
            risk_level = "MEDIUM RISK"
            action = (
                "Monitor conveyor line calibration "
                "and tool wear"
            )
        else:
            risk_level = "LOW RISK"
            action = "Normal operating parameters"

        category_risk[category] = {
            "total_inspections": total,
            "defective_units": defective,
            "defect_rate_pct": round(defect_rate, 2),
            "risk_level": risk_level,
            "recommended_action": action,
        }

    total = len(records)

    defective = sum(
        1
        for entry in records
        if entry.result == "REJECT"
    )

    overall_defect_rate = (
        defective / total * 100
        if total
        else 0.0
    )

    return {
        "overall_defect_rate": round(
            overall_defect_rate,
            2
        ),
        "total_units_inspected": total,
        "category_risk_levels": category_risk,
    }


# ------------------------------------------------------------------
# Production report
# ------------------------------------------------------------------

@app.get("/reports/production")
def get_production_report(
    db: Session = Depends(get_db)
):
    records = db.query(InspectionHistory).all()

    total = len(records)

    rejected = sum(
        1
        for entry in records
        if entry.result == "REJECT"
    )

    passed = total - rejected

    pass_rate = (
        passed / total * 100
        if total
        else 100.0
    )

    defect_rate = (
        rejected / total * 100
        if total
        else 0.0
    )

    severity_distribution = {
        "Critical": sum(
            1 for e in records
            if e.severity_level == "Critical"
        ),
        "High": sum(
            1 for e in records
            if e.severity_level == "High"
        ),
        "Medium": sum(
            1 for e in records
            if e.severity_level == "Medium"
        ),
        "Low": sum(
            1 for e in records
            if e.severity_level == "Low"
        ),
    }

    category_performance = {}

    for entry in records:
        category = entry.category or "unknown"

        if category not in category_performance:
            category_performance[category] = {
                "total": 0,
                "anomalous": 0
            }

        category_performance[category]["total"] += 1

        if entry.result == "REJECT":
            category_performance[category]["anomalous"] += 1

    return {
        "report_title": (
            "Executive Production Quality "
            "Summary Report"
        ),
        "system_status": "OPERATIONAL",
        "total_units_inspected": total,
        "units_passed": passed,
        "units_rejected": rejected,
        "yield_pass_rate_pct": round(pass_rate, 2),
        "defect_rate_pct": round(defect_rate, 2),
        "severity_distribution": severity_distribution,
        "category_performance": category_performance,
    }


# ------------------------------------------------------------------
# Inspection report
# ------------------------------------------------------------------

@app.get("/report/{inspection_id}")
def get_report(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    format: str = Query(
        "json",
        pattern="^(json|markdown|html)$"
    )
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
            detail="Inspection report not found."
        )

    if (
        current_user.get("role") != "admin"
        and entry.username != current_user["sub"]
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access this inspection."
        )

    if format == "json":
        return serialize_inspection(entry)

    prediction = {
        "image_name": entry.image_name,
        "defect_result": entry.result,
        "defect_class": entry.defect,
        "confidence_score": entry.confidence,
        "anomaly_score": entry.anomaly_score,
        "threshold": entry.threshold,
        "severity_score": entry.severity_score,
        "severity_level": entry.severity_level,
        "recommended_action": entry.recommended_action,
    }

    report = generate_report(prediction)

    if format == "markdown":
        return {
            "inspection_id": entry.id,
            "format": "markdown",
            "report": report,
        }

    if format == "html":
        return {
            "inspection_id": entry.id,
            "format": "html",
            "report": report,
        }


def safe_json_load(value):
    if not value:
        return None

    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return value


def serialize_inspection(entry: InspectionHistory):
    return {
        "id": entry.id,
        "username": entry.username,
        "image_name": entry.image_name,
        "category": entry.category,
        "defect": entry.defect,
        "result": entry.result,
        "confidence": entry.confidence,
        "anomaly_score": entry.anomaly_score,
        "threshold": entry.threshold,
        "severity_score": entry.severity_score,
        "severity_level": entry.severity_level,
        "recommended_action": entry.recommended_action,

        "class_probabilities": safe_json_load(
            entry.class_probabilities
        ),

        "severity_breakdown": safe_json_load(
            entry.severity_breakdown
        ),

        "quality_report": safe_json_load(
            entry.quality_report
        ),

        "processing_time_ms": entry.processing_time_ms,

        "created_at": (
            entry.created_at.isoformat()
            if entry.created_at
            else None
        ),
    }