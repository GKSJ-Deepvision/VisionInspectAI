import os
import hashlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.core.database import engine, Base, SessionLocal
import app.models as db_models

# Initialize database tables
Base.metadata.create_all(bind=engine)

for folder in ["storage/raw_images", "storage/processed_images", "storage/heatmaps"]:
    os.makedirs(folder, exist_ok=True)

app = FastAPI(title="VisionInspect AI - Enterprise Gateway", version="3.0.0-PROD")

app.mount("/storage", StaticFiles(directory="storage"), name="storage")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(api_router, prefix="/api", tags=["Inspection"])

# MASTER AUTO-SEEDER: Pre-populates Multi-Role Users & Product SKUs
@app.on_event("startup")
def seed_enterprise_data():
    db = SessionLocal()
    try:
        # 1. Seed Accounts (Password for all: admin123)
        default_users = [
            {"name": "Vasu Nayak (Owner)", "email": "vasu@gmail.com", "role": "OWNER"},
            {"name": "Line Operator Station #1", "email": "operator@gmail.com", "role": "OPERATOR"},
            {"name": "Senior Quality Engineer", "email": "engineer@gmail.com", "role": "ENGINEER"}
        ]
        
        hashed_pw = hashlib.sha256("admin123".encode()).hexdigest()
        
        for u in default_users:
            existing = db.query(db_models.User).filter(func.lower(db_models.User.email) == u["email"]).first()
            if not existing:
                new_user = db_models.User(
                    full_name=u["name"],
                    email=u["email"],
                    password_hash=hashed_pw,
                    role=u["role"]
                )
                db.add(new_user)
        
        # 2. Seed Manufacturing SKUs (Prevents 500 NoneType Foreign Key Crashes!)
        default_products = [
            {"sku": "MVI-PROD-2026", "name": "WideResNet Conveyor Frame A1"},
            {"sku": "MVI-OPERATOR-LINE-01", "name": "High-Speed Station Capsule B2"}
        ]
        for p in default_products:
            existing_prod = db.query(db_models.Product).filter(db_models.Product.sku == p["sku"]).first()
            if not existing_prod:
                new_prod = db_models.Product(sku=p["sku"], name=p["name"], category="Automotive / Medical")
                db.add(new_prod)
                
        db.commit()
        print("[OK] ENTERPRISE SEEDING COMPLETE: Multi-Role Accounts & SKUs Ready.")
    except Exception as e:
        print(f"[WARN] Seeding notification: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
def home():
    return {"status": "ONLINE", "system": "VisionInspect AI Server Running Cleanly."}