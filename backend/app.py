from backend.routes.inspection import router as inspection_router
from fastapi import FastAPI

from backend.routes.upload import router as upload_router
from backend.routes.dataset import router as dataset_router
from backend.routes.preprocess import router as preprocess_router
from backend.routes.augmentation import router as augmentation_router
from backend.routes.severity import router as severity_router
from backend.routes.statistics import router as statistics_router

app = FastAPI(
    title="VisionInspect AI",
    version="1.0.0",
    description="Manufacturing Defect Detection Backend"
)
app.include_router(inspection_router)
app.include_router(upload_router)
app.include_router(dataset_router)
app.include_router(preprocess_router)
app.include_router(augmentation_router)
app.include_router(severity_router)
app.include_router(statistics_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to VisionInspect AI Backend!"
    }