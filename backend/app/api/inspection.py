from pathlib import Path
import shutil

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.inspection import Inspection
from app.services.prediction_service import predict_image

router = APIRouter(
    prefix="/inspection",
    tags=["Inspection"]
)

# Folder to store uploaded images
UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# -------------------------------
# Predict Defect
# -------------------------------
@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
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
    result = predict_image(file_path)

    # Save to database
    inspection = Inspection(
        image_name=file.filename,
        prediction=result["prediction"],
        confidence=result["confidence"]
    )

    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    return {
        "id": inspection.id,
        "image_name": inspection.image_name,
        "prediction": inspection.prediction,
        "confidence": inspection.confidence,
        "created_at": inspection.created_at
    }


# -------------------------------
# Inspection History
# -------------------------------
@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    inspections = (
        db.query(Inspection)
        .order_by(Inspection.id.desc())
        .all()
    )

    return [
        {
            "id": inspection.id,
            "image_name": inspection.image_name,
            "prediction": inspection.prediction,
            "confidence": inspection.confidence,
            "created_at": inspection.created_at
        }
        for inspection in inspections
    ]