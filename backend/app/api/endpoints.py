from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io

router = APIRouter()

@router.post("/upload/")
async def upload_image(file: UploadFile = File(...)): 
    # Check if the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        # Read the image data
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Verify it isn't corrupted
        image.verify()
        
        #  Return success and image details
        return {
            "filename": file.filename,
            "status": "Success",
            "format": image.format,
            "dimensions": f"{image.width}x{image.height}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")