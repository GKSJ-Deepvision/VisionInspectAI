from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from auth import router as auth_router
from history import router as history_router
from dashboard import router as dashboard_router

from preprocessing import preprocess_image
from ai.yolo_model import predict_objects
from database import history_collection

from datetime import datetime

import os
import shutil
import cv2

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

    print("========== UPLOAD RECEIVED ==========")
    print("Filename:", file.filename)

    # Save Uploaded Image
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("Saved at:", file_path)

    # Image Preprocessing
    result = preprocess_image(file_path, PROCESSED_FOLDER)

    if result is None:
        return {
            "success": False,
            "message": "Image could not be processed"
        }

    print("Preprocessing Done")

   # ---------------- YOLO Object Detection ---------------- #

    detections = predict_objects(file_path)

    print("Detections:", detections)

    # Highest confidence detection only
    best_detection = None

    if len(detections) > 0:
        best_detection = max(
            detections,
            key=lambda x: x["confidence"]
        )

    if best_detection is None:

        defect = "No Defect"
        category = "No Defect"
        severity = "Low"
        risk = "Low"
        confidence = 100

    else:

        defect = "Defective"

        category = best_detection["class"]
        confidence = best_detection["confidence"]

        if confidence >= 80:
            severity = "High"
            risk = "High Risk"

        elif confidence >= 50:
            severity = "Medium"
            risk = "Medium Risk"

        else:
            severity = "Low"
            risk = "Low Risk"

    # ---------------- Detection Result ---------------- #

    if len(detections) == 0:

        defect = "No Defect"
        category = "No Defect"
        severity = "Low"
        risk = "Low"
        confidence = 100

    else:

        best = detections[0]

        defect = "Defective"

        category = best["class"]
        confidence = best["confidence"]

        if confidence >= 80:
            severity = "High"
            risk = "High Risk"

        elif confidence >= 50:
            severity = "Medium"
            risk = "Medium Risk"

        else:
            severity = "Low"
            risk = "Low Risk"

    # ---------------- Save History ---------------- #

    history_collection.insert_one({
        "filename": file.filename,
        "status": "Completed",
        "width": result["width"],
        "height": result["height"],
        "channels": result["channels"],
        "processed_size": "256 × 256",
        "defect": defect,
        "category": category,
        "severity": severity,
        "risk": risk,
        "confidence": confidence,
        "detections": detections,
        "date": datetime.now().strftime("%d-%m-%Y %I:%M %p")
    })

    # ---------------- Response ---------------- #

    return {

    "success": True,
    "message": "Image uploaded and processed successfully",

    "filename": file.filename,

    "original_width": result["width"],
    "original_height": result["height"],

    "channels": result["channels"],

    "processed_size": "256 × 256",

    "defect": defect,
    "category": category,
    "severity": severity,
    "risk": risk,
    "confidence": confidence,

    "detections": [] if best_detection is None else [best_detection],

    "preprocessing": [
        "Image Resized",
        "Converted to Grayscale",
        "Noise Removed using Gaussian Blur"
    ]
}