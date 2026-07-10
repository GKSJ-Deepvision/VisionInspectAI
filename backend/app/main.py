from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.core.database import engine, Base
import app.models.db_models as db_models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VisionInspect AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validation
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(api_router, prefix="/api", tags=["Inspection"])

@app.get("/")
def home():
    return {"message": "Welcome""VisionInspect AI Server & Database are running successfully! "}

