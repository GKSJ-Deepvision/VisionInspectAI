import os
import sys
import shutil
import tempfile
from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User, InspectionLog
from schemas import UserCreate, UserOut, Token, InspectionOut, RoleUpdate
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_roles, ACCESS_TOKEN_EXPIRE_MINUTES,
)

# predict.py lives in src/inference/, backend/ is a sibling folder under src/
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "inference"))
from predict import predict_image, find_checkpoint
from severity import calculate_severity

Base.metadata.create_all(bind=engine)

PREDICTIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "predictions")

ALL_CATEGORIES = [
    "bottle", "cable", "capsule", "carpet", "grid",
    "hazelnut", "leather", "metal_nut", "pill", "screw",
    "tile", "toothbrush", "transistor", "wood", "zipper",
]

app = FastAPI(title="VisionInspect AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Role is never taken from the request body - public self-registration
    # always lands as the lowest-privilege role. See schemas.UserCreate.
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
    """Admin-only. The only way an account becomes admin / quality_engineer -
    public registration always forces factory_supervisor (see /auth/register).
    Bootstrapping the very first admin has to happen out-of-band (direct DB
    edit or a one-off script), since no admin exists yet to grant that role."""
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
    """Checks which categories actually have a trained checkpoint on disk,
    rather than assuming all 15 exist - avoids the frontend offering a
    category that hasn't finished training yet."""
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(tmp_path)

    heatmap_filename = os.path.basename(result["heatmap_path"]) if result.get("heatmap_path") else None

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
        "heatmap_url": f"/heatmap/{heatmap_filename}" if heatmap_filename else None,
    }
    if severity:
        response.update(severity)
    return response


@app.get("/heatmap/{filename}")
def get_heatmap(filename: str):
    # Heatmap filenames are always generated internally as
    # {category}_{base_name}_heatmap.png, so a legitimate request should
    # never contain path separators. Reject anything where the basename
    # doesn't match the raw value (e.g. "../../etc/passwd") before it ever
    # touches the filesystem.
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
        pass  # supervisors can view all inspections, just not trigger new ones
    else:
        # admin / quality_engineer roles only see their own inspection runs
        query = query.filter(InspectionLog.user_id == current_user.id)
    return query.limit(limit).all()


@app.get("/health")
def health():
    return {"status": "ok"}
