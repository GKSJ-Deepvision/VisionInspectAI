from fastapi import FastAPI

from backend.routes.upload import router as upload_router
from backend.routes.dataset import router as dataset_router
from backend.routes.preprocess import router as preprocess_router

app = FastAPI(
    title="VisionInspect AI",
    version="1.0.0",
    description="Manufacturing Defect Detection Backend"
)

app.include_router(upload_router)
app.include_router(dataset_router)
app.include_router(preprocess_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to VisionInspect AI Backend!"
    }