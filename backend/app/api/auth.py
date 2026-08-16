import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import app.models as db_models
import app.schemas as schemas

try:
    from app.core.database import get_db
except ImportError:
    from app.core.database import SessionLocal
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

router = APIRouter()

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.strip().encode()).hexdigest()

def check_admin_role(user: db_models.User):
    if user.role not in ["ADMIN", "OWNER"]:
        raise HTTPException(status_code=403, detail="Admin privileges required")

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    existing = db.query(db_models.User).filter(func.lower(db_models.User.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="This corporate email is already registered in SQLite.")
    
    if req.role.strip().upper() == 'OWNER':
        existing_owner = db.query(db_models.User).filter(db_models.User.role == 'OWNER').first()
        if existing_owner:
            raise HTTPException(status_code=403, detail='Factory Owner account already exists. Only one owner is permitted.')

    new_user = db_models.User(
        full_name=req.full_name.strip(),
        email=clean_email,
        password_hash=hash_password(req.password),
        role=req.role.strip().upper()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "status": "SUCCESS",
        "user": {"id": new_user.id, "name": new_user.full_name, "email": new_user.email, "role": new_user.role}
    }

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    hashed = hash_password(req.password)
    
    user = db.query(db_models.User).filter(
        func.lower(db_models.User.email) == clean_email,
        db_models.User.password_hash == hashed
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid corporate email or password. Please verify credentials.")
    
    return {
        "status": "SUCCESS",
        "user": {"id": user.id, "name": user.full_name, "email": user.email, "role": user.role}
    }

@router.get("/users", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(db_models.User).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(user_id: int, req: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = req.role.strip().upper()
    db.commit()
    db.refresh(user)
    return user