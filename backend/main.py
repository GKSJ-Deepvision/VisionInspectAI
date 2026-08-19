from fastapi import FastAPI, UploadFile, File, Header
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


app = FastAPI()


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(history_router)
app.include_router(dashboard_router)


# =========================================================
# CORS
# =========================================================

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


# =========================================================
# FOLDERS
# =========================================================

UPLOAD_FOLDER = "../uploads"
PROCESSED_FOLDER = "../processed"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    PROCESSED_FOLDER,
    exist_ok=True
)


# =========================================================
# SERVE PROCESSED IMAGES
# =========================================================

app.mount(
    "/processed",
    StaticFiles(
        directory=PROCESSED_FOLDER
    ),
    name="processed"
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message":
            "VisionInspect AI Backend Running"
    }


# =========================================================
# UPLOAD IMAGE
# =========================================================

@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),

    username: str = Header(
        None,
        alias="X-Username"
    ),

    role: str = Header(
        None,
        alias="X-Role"
    )
):

    print("======================================")
    print("UPLOAD RECEIVED")
    print("Filename:", file.filename)
    print("Username:", username)
    print("Role:", role)
    print("======================================")


    # =====================================================
    # USER VALIDATION
    # =====================================================

    if not username:

        return {
            "success": False,
            "message":
                "User session not found. Please login again."
        }


    # =====================================================
    # SAVE UPLOADED IMAGE
    # =====================================================

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    print(
        "Image saved:",
        file_path
    )


    # =====================================================
    # IMAGE PREPROCESSING
    # =====================================================

    result = preprocess_image(
        file_path,
        PROCESSED_FOLDER
    )


    if result is None:

        return {
            "success": False,
            "message":
                "Image could not be processed"
        }


    print(
        "Preprocessing completed"
    )


    # =====================================================
    # YOLO
    # =====================================================

    yolo_result = predict_objects(
        file_path
    )


    detections = yolo_result.get(
        "detections",
        []
    )


    detected_category = yolo_result.get(
        "category",
        "Unknown"
    )


    print(
        "Detections:",
        detections
    )


    print(
        "Detected Category:",
        detected_category
    )


    # =====================================================
    # BEST DETECTION
    # =====================================================

    best_detection = None


    if len(detections) > 0:

        best_detection = max(
            detections,
            key=lambda x: x["confidence"]
        )


    # =====================================================
    # DEFECT CLASSIFICATION
    # =====================================================

    if best_detection is None:

        # -------------------------------------------------
        # NO DEFECT
        # -------------------------------------------------

        defect = "No Defect"

        # IMPORTANT:
        # Category is NOT changed to "No Defect".
        # It comes from YOLO category prediction.

        category = detected_category

        severity = "Low"

        risk = "No Defect"

        confidence = 100


    else:

        # -------------------------------------------------
        # DEFECTIVE
        # -------------------------------------------------

        defect = "Defective"

        category = best_detection["class"]

        confidence = best_detection["confidence"]


        # -------------------------------------------------
        # SEVERITY + RISK
        # -------------------------------------------------

        if confidence >= 80:

            severity = "High"

            risk = "High Risk"

        elif confidence >= 50:

            severity = "Medium"

            risk = "Medium Risk"

        else:

            severity = "Low"

            risk = "Low Risk"


    # =====================================================
    # FALLBACK CATEGORY
    # =====================================================

    if not category:

        category = "Unknown"


    print("======================================")
    print("FINAL INSPECTION RESULT")
    print("Prediction:", defect)
    print("Category:", category)
    print("Severity:", severity)
    print("Risk:", risk)
    print("Confidence:", confidence)
    print("======================================")


    # =====================================================
    # SAVE HISTORY
    # =====================================================

    history_collection.insert_one({

        # USER
        "username": username,

        "role": role,

        # FILE
        "filename": file.filename,

        "status": "Completed",

        # IMAGE
        "width":
            result["width"],

        "height":
            result["height"],

        "channels":
            result["channels"],

        "processed_size":
            "256 × 256",

        # INSPECTION
        "defect":
            defect,

        "category":
            category,

        "severity":
            severity,

        "risk":
            risk,

        "confidence":
            confidence,

        # ALL DETECTIONS
        "detections":
            detections,

        # DATE
        "date":
            datetime.now().strftime(
                "%d-%m-%Y %I:%M %p"
            )
    })


    print(
        "History saved for:",
        username
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "success":
            True,

        "message":
            "Image uploaded and processed successfully",

        "filename":
            file.filename,

        # IMAGE INFORMATION
        "original_width":
            result["width"],

        "original_height":
            result["height"],

        "channels":
            result["channels"],

        "processed_size":
            "256 × 256",

        # INSPECTION
        "defect":
            defect,

        "category":
            category,

        "severity":
            severity,

        "risk":
            risk,

        "confidence":
            confidence,

        # DETECTIONS
        "detections":
            detections,

        # PREPROCESSING
        "preprocessing": [

            "Image Resized",

            "Converted to Grayscale",

            "Noise Removed using Gaussian Blur"

        ]
    }