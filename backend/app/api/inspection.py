from pathlib import Path
import shutil
from app.services.inspection_service import get_dashboard_stats

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.inspection import Inspection
from app.models.user import User
from app.services.prediction_service import predict_image
from app.core.security import get_current_user

router = APIRouter(
    prefix="/inspection",
    tags=["Inspection"]
)

# Folder to store uploaded images
UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ----------------------------------
# Predict Defect
# ----------------------------------
@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate uploaded file
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image."
        )

    # Save uploaded image
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # AI Prediction
    try:
        result = predict_image(file_path)
    except Exception as e:
        print("Prediction Error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Prediction failed."
        )

    # -------------------------
    # Defect Classification Logic
    # -------------------------

    if result["prediction"] == "GOOD":
        defect_type = "None"
        severity = "LOW"
        risk_score = 0
        recommendation = "Accept Product"

    else:
        defect_type = "General Defect"   # पुढे AI model replace करेल

        confidence = result["confidence"]

        if confidence >= 90:
            severity = "CRITICAL"
            risk_score = 95
            recommendation = "Reject Product"

        elif confidence >= 70:
            severity = "HIGH"
            risk_score = 80
            recommendation = "Immediate Inspection Required"

        elif confidence >= 40:
            severity = "MEDIUM"
            risk_score = 60
            recommendation = "Recheck Product"

        else:
            severity = "LOW"
            risk_score = 30
            recommendation = "Monitor Product"

    # -------------------------
    # Save Prediction
    # -------------------------

    inspection = Inspection(
        image_name=file.filename,
        image_path=str(file_path),
        prediction=result["prediction"],
        confidence=result["confidence"],

        defect_type=defect_type,
        severity=severity,
        risk_score=risk_score,
        recommendation=recommendation,

        user_id=current_user.id
    )

    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    return {
        "id": inspection.id,
        "image_name": inspection.image_name,
        "image_path": inspection.image_path,
        "prediction": inspection.prediction,
        "confidence": inspection.confidence,

        "defect_type": inspection.defect_type,
        "severity": inspection.severity,
        "risk_score": inspection.risk_score,
        "recommendation": inspection.recommendation,

        "created_at": inspection.created_at,
        "user_id": inspection.user_id
    }


# ----------------------------------
# Inspection History
# ----------------------------------
@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inspections = (
        db.query(Inspection)
        .order_by(Inspection.id.desc())
        .all()
    )

    return [
        {
            "id": inspection.id,
            "image_name": inspection.image_name,
            "image_path": inspection.image_path,
            "prediction": inspection.prediction,
            "confidence": inspection.confidence,

            "defect_type": inspection.defect_type,
            "severity": inspection.severity,
            "risk_score": inspection.risk_score,
            "recommendation": inspection.recommendation,

            "created_at": inspection.created_at,
            "user_id": inspection.user_id
        }
        for inspection in inspections
    ]
    
    # ----------------------------------
# Manufacturing Analytics Dashboard
# ----------------------------------
@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_stats(db)

# ----------------------------------
# Delete Inspection
# ----------------------------------

@router.delete("/{inspection_id}")
def delete_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inspection = (
        db.query(Inspection)
        .filter(Inspection.id == inspection_id)
        .first()
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    db.delete(inspection)
    db.commit()

    return {
        "message": "Inspection deleted successfully"
    }