from fastapi import APIRouter, HTTPException
import os

from backend.services.image_processor import preprocess_image

router = APIRouter()

UPLOAD_FOLDER = "backend/uploads"
PROCESSED_FOLDER = "backend/processed"


@router.post("/preprocess")
def preprocess(filename: str):

    input_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(input_path):
        raise HTTPException(
            status_code=404,
            detail="Image not found."
        )

    output_path = os.path.join(PROCESSED_FOLDER, filename)

    preprocess_image(input_path, output_path)

    return {
        "message": "Image processed successfully",
        "original": input_path,
        "processed": output_path
    }