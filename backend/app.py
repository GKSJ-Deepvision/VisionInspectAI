from fastapi import FastAPI

from backend.routes.auth import router as auth_router
from backend.routes.upload import router as upload_router
from backend.routes.dataset import router as dataset_router
from backend.routes.preprocess import router as preprocess_router
from backend.routes.augmentation import router as augmentation_router
from backend.routes.severity import router as severity_router
from backend.routes.statistics import router as statistics_router

from backend.models.database import engine, Base
from backend.models.inspection_history import InspectionHistory
from backend.models.user_activity import UserActivity
from backend.models.analytics_storage import AnalyticsStorage
from backend.models.report_storage import ReportStorage
from backend.models.batch_inspection import BatchInspection

app = FastAPI(
    title="VisionInspect AI",
    version="1.0.0",
    description="Manufacturing Defect Detection Backend"
)

print(Base.metadata.tables.keys())

Base.metadata.create_all(bind=engine)

app.include_router(upload_router)
app.include_router(dataset_router)
app.include_router(preprocess_router)
app.include_router(augmentation_router)
app.include_router(severity_router)
app.include_router(statistics_router)
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to VisionInspect AI Backend!"
    }