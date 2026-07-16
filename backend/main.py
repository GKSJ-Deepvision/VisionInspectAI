from fastapi import FastAPI
from backend.severity import router

app = FastAPI()

app.include_router(router)

@app.get("/")
def home():
    return {
        "message": "Welcome to VisionInspect AI - Severity Score & Statistics Module"
    }