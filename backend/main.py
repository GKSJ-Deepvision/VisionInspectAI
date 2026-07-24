from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from auth import router as auth_router
from history import router as history_router
from dashboard import router as dashboard_router

from preprocessing import preprocess_image
from ai.model import predict_defect
from database import history_collection

from datetime import datetime

import os
import shutil

app = FastAPI()

# ------------------ Routers ------------------ #

app.include_router(auth_router)
app.include_router(history_router)
app.include_router(dashboard_router)

# ------------------ CORS ------------------ #

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

# ------------------ Folders ------------------ #

UPLOAD_FOLDER = "../uploads"
PROCESSED_FOLDER = "../processed"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# ------------------ Serve Processed Images ------------------ #

app.mount(
    "/processed",
    StaticFiles(directory=PROCESSED_FOLDER),
    name="processed"
)

# ------------------ Home ------------------ #

@app.get("/")
def home():
    return {
        "message": "VisionInspect AI Backend Running"
    }

# ------------------ Upload Image ------------------ #

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    # Save Uploaded Image
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Image Preprocessing
    result = preprocess_image(file_path, PROCESSED_FOLDER)

    if result is None:
        return {
            "success": False,
            "message": "Image could not be processed"
        }

    # Dummy AI Prediction
    prediction = predict_defect(file_path)

    # Save Inspection History into MongoDB
    history_collection.insert_one({
        "filename": file.filename,
        "status": "Completed",
        "width": result["width"],
        "height": result["height"],
        "channels": result["channels"],
        "processed_size": "256 × 256",
        "defect": prediction["defect"],
        "confidence": prediction["confidence"],
        "date": datetime.now().strftime("%d-%m-%Y %I:%M %p")
    })

    # Response
    return {
        "success": True,
        "message": "Image uploaded and processed successfully",

        "filename": file.filename,

        "original_width": result["width"],
        "original_height": result["height"],

        "channels": result["channels"],

        "processed_size": "256 × 256",

        "defect": prediction["defect"],
        "confidence": prediction["confidence"],

        "preprocessing": [
            "Image Resized",
            "Converted to Grayscale",
            "Noise Removed using Gaussian Blur"
        ]
    }