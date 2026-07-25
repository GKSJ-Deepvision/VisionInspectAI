from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.base import Base
from app.database.database import engine
from app.api.auth import router as auth_router
from app.api.inspection import router as inspection_router

app = FastAPI(
    title="VisionInspect AI API",
    version="1.0.0"
)

# -----------------------------
# CORS Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Create Database Tables
# -----------------------------
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# -----------------------------
# Register Routers
# -----------------------------
app.include_router(auth_router)
app.include_router(inspection_router)

# -----------------------------
# Home Route
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "VisionInspectAI Backend - TEST 123"
    }

# -----------------------------
# Debug Route
# -----------------------------
@app.get("/routes")
def get_routes():
    return [
        {
            "path": route.path,
            "methods": list(route.methods) if hasattr(route, "methods") else []
        }
        for route in app.routes
        if hasattr(route, "path")
    ]