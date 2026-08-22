import os
import sys
import shutil
import tempfile
import base64
from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import Base, engine, get_db, SessionLocal
from models import User, InspectionLog
from schemas import UserCreate, UserOut, Token, InspectionOut, RoleUpdate
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_roles, ACCESS_TOKEN_EXPIRE_MINUTES,
)

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "inference"))
from predict import predict_image, find_checkpoint
from severity import calculate_severity

app = FastAPI(title="VisionInspect AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def seed_demo_users():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin = User(
                username="admin",
                hashed_password=hash_password("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()

        supervisor_user = db.query(User).filter(User.username == "supervisor").first()
        if not supervisor_user:
            supervisor = User(
                username="supervisor",
                hashed_password=hash_password("supervisor123"),
                role="factory_supervisor"
            )
            db.add(supervisor)
            db.commit()
    finally:
        db.close()

PREDICTIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "predictions")

ALL_CATEGORIES = [
    "bottle", "cable", "capsule", "carpet", "grid",
    "hazelnut", "leather", "metal_nut", "pill", "screw",
    "tile", "toothbrush", "transistor", "wood", "zipper",
]

@app.post("/auth/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
        role="factory_supervisor",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    valid_roles = {"admin", "quality_engineer", "factory_supervisor"}
    if role_in.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {sorted(valid_roles)}")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role_in.role
    db.commit()
    db.refresh(user)
    return user

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/categories")
def get_categories(current_user: User = Depends(get_current_user)):
    available, missing = [], []
    for cat in ALL_CATEGORIES:
        try:
            find_checkpoint(cat)
            available.append(cat)
        except FileNotFoundError:
            missing.append(cat)
    return {"available": available, "missing": missing, "total": len(ALL_CATEGORIES)}

@app.post("/predict")
async def predict(
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "quality_engineer")),
):
    if category not in ALL_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Unknown category '{category}'")

    suffix = os.path.splitext(file.filename)[1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = predict_image(category, tmp_path, save_heatmap=True)
        
        # --- THE ULTIMATE FALLBACK ---
        # If the item passes and no anomaly map is generated, copy the original image!
        if not result.get("heatmap_path") or not os.path.exists(result.get("heatmap_path", "")):
            os.makedirs(PREDICTIONS_DIR, exist_ok=True)
            fallback_name = f"fallback_{os.path.basename(tmp_path)}.png"
            fallback_path = os.path.join(PREDICTIONS_DIR, fallback_name)
            shutil.copy(tmp_path, fallback_path)
            result["heatmap_path"] = fallback_path
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    heatmap_filename = os.path.basename(result["heatmap_path"]) if result.get("heatmap_path") else None

    # --- THE BULLETPROOF BASE64 FIX ---
    heatmap_data_uri = None
    if result.get("heatmap_path") and os.path.exists(result["heatmap_path"]):
        with open(result["heatmap_path"], "rb") as img_file:
            b64_str = base64.b64encode(img_file.read()).decode("utf-8")
            heatmap_data_uri = f"data:image/png;base64,{b64_str}"

    severity = None
    if result["pred_label"] == "Defective":
        severity = calculate_severity(
            pred_score=result["pred_score"],
            defect_area_pct=result.get("defect_area_pct", 0.0),
            dist_from_center=result.get("dist_from_center", 0.5),
        )

    log = InspectionLog(
        user_id=current_user.id,
        category=category,
        filename=file.filename,
        pred_label=result["pred_label"],
        pred_score=result["pred_score"],
        severity_score=severity["severity_score"] if severity else None,
        severity_level=severity["severity_level"] if severity else None,
        heatmap_filename=heatmap_filename,
    )
    db.add(log)
    db.commit()

    response = {
        "category": category,
        "pred_label": result["pred_label"],
        "pred_score": result["pred_score"],
        "verdict": "FAIL" if result["pred_label"] == "Defective" else "PASS",
        "heatmap_url": heatmap_data_uri,
    }
    if severity:
        response.update(severity)
    return response

@app.get("/heatmap/{filename}")
def get_heatmap(filename: str):
    if os.path.basename(filename) != filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    path = os.path.join(PREDICTIONS_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Heatmap not found")
    return FileResponse(path)

@app.get("/history", response_model=list[InspectionOut])
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(InspectionLog).order_by(InspectionLog.id.desc())
    if current_user.role == "factory_supervisor":
        pass  
    else:
        query = query.filter(InspectionLog.user_id == current_user.id)
    return query.limit(limit).all()

@app.get("/health")
def health():
    return {"status": "ok"}