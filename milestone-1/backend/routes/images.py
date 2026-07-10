import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from dependencies import PermissionChecker, get_current_user
from rbac import Permission
from models.user import User
from models.image import UploadedImage
from models.inspection import Inspection

router = APIRouter(prefix="/images", tags=["Image Log Uploads"])

# Ensure uploads directory exists on server initialization
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(PermissionChecker(Permission.UPLOAD_IMAGES))
):
    """
    Validates and uploads a line item photo.
    Saves image to disk, writes metadata to PostgreSQL, and starts a pending inspection log.
    """
    # 1. Validate File Extension
    _, file_ext = os.path.splitext(file.filename.lower())
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # 2. Validate File Size
    # Read bytes to verify size
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Maximum allowed size is 5MB."
        )
        
    # Reset file pointer to beginning for writing to disk
    await file.seek(0)
    
    # 3. Create Unique Filename & Path
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    destination_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # 4. Save File to Storage Directory
    try:
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file to disk storage: {str(e)}"
        )
        
    # 5. Save Metadata entry to PostgreSQL
    # Create image record
    db_image = UploadedImage(
        filename=file.filename,
        filepath=destination_path,
        uploaded_by=current_user.id
    )
    db_image.uploader = current_user
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    # Create associated Inspection record placeholder for future AI models
    db_inspection = Inspection(
        image_id=db_image.id,
        prediction=None,  # Placeholder for future AI prediction
        confidence=None,  # Placeholder for model confidence score
        severity=None,    # Placeholder for defect severity classification
        status="pending"  # Inspection status is pending trigger
    )
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    
    return {
        "message": "Image uploaded successfully. Inspection scheduled.",
        "image": {
            "id": db_image.id,
            "filename": db_image.filename,
            "uploaded_by": current_user.full_name,
            "uploaded_at": db_image.uploaded_at
        },
        "inspection": {
            "id": db_inspection.id,
            "status": db_inspection.status,
            "prediction": db_inspection.prediction,
            "confidence": db_inspection.confidence,
            "severity": db_inspection.severity,
            "created_at": db_inspection.created_at
        }
    }


@router.get("")
def get_uploaded_images(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves a list of all uploaded images metadata.
    """
    images = db.query(UploadedImage).order_by(UploadedImage.uploaded_at.desc()).all()
    return [
        {
            "id": img.id,
            "filename": img.filename,
            "filepath": f"/uploads/{os.path.basename(img.filepath)}",
            "uploaded_at": img.uploaded_at
        }
        for img in images
    ]
