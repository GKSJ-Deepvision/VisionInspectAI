from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.database import engine
from app.database.base import Base

from app.api.auth import router as auth_router
from app.api.inspection import router as inspection_router

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisionInspect AI API",
    version="1.0.0"
)

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Static Files (Uploaded Images)
# -----------------------------
app.mount(
    "/app/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth_router)
app.include_router(inspection_router)

# -----------------------------
# Root
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "VisionInspect AI Backend Running",
        "database": "Connected Successfully"
    }