from fastapi import APIRouter, UploadFile, File
import os

from backend.utils.validation import validate_extension, validate_image

from backend.services.database_service import (
    save_inspection,
    save_analytics,
    save_report,
    save_batch_inspection
)


from backend.config import UPLOAD_FOLDER

router = APIRouter()

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    validate_extension(file.filename)

    contents = await file.read()

    validate_image(contents)

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    # Save Inspection History
    save_inspection(
        username="admin",
        image_name=file.filename,
        defect="Pending",
        result="Uploaded"
    )

    # Save Analytics Storage
    save_analytics(
        username="admin",
        total_images=1,
        defect_count=0,
        normal_count=1
    )

    # Save Report Storage
    save_report(
        username="admin",
        report_name=f"{file.filename}_report",
        report_path=filepath
    )

    save_batch_inspection(
    username="admin",
    batch_name="Batch-001",
    total_images=1,
    status="Completed"
    )

    return {
        "message": "Image uploaded successfully",
        "filename": file.filename,
        "saved_path": filepath
    }