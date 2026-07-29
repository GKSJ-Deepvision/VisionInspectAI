from fastapi import HTTPException
from PIL import Image
import io

# Allowed image formats
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "tiff", "webp"}

def validate_extension(filename: str):
    if "." not in filename:
        raise HTTPException(status_code=400, detail="File has no extension.")

    extension = filename.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )


def validate_image(file_bytes: bytes):
    try:
        Image.open(io.BytesIO(file_bytes))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image."
        )