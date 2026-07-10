from fastapi import FastAPI, UploadFile, File
from auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from inspection import router as inspection_router
from history import router as history_router

import os
import shutil

from preprocessing import preprocess_image

app = FastAPI()

app.include_router(auth_router)
app.include_router(inspection_router)
app.include_router(history_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_FOLDER = "../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Processed folder
PROCESSED_FOLDER = "../processed"
os.makedirs(PROCESSED_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {"message": "VisionInspect AI Backend Running"}


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    # Save uploaded image
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Preprocess image
    result = preprocess_image(file_path, PROCESSED_FOLDER)

    if result is None:
        return {"error": "Image could not be read"}

    return {
    "message": "Image uploaded and processed successfully",
    "filename": file.filename,
    "original_height": result["height"],
    "original_width": result["width"],
    "channels": result["channels"],
    "processed_size": "256 x 256",
    "preprocessing": [
        "Image Resized",
        "Converted to Grayscale",
        "Noise Removed using Gaussian Blur"
     ] 
    } 