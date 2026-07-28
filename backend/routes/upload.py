from fastapi import APIRouter, UploadFile, File
import os

from backend.utils.validation import validate_extension, validate_image

router = APIRouter()

from backend.config import UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    validate_extension(file.filename)

    contents = await file.read()

    validate_image(contents)

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "message": "Image uploaded successfully",
        "filename": file.filename,
        "saved_path": filepath
    }