from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
import app.models.db_models as db_models
import hashlib
import jwt
from datetime import datetime, timedelta

router = APIRouter()

SECRET_KEY = "visioninspect_secret_key_for_industry_4_0"
ALGORITHM = "HS256"

# Simple password hashing helper
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Data formats we expect from the frontend
class UserRegister(BaseModel):
    username: str
    password: str
    role: str  # 'quality_engineer', 'owner', or 'client'

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(db_models.User).filter(db_models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered.")
    
    # Create new user
    new_user = db_models.User(
        username=user.username,
        hashed_password=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"status": "Success", "message": f"User {user.username} created as {user.role}!"}

@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # Find user in database
    db_user = db.query(db_models.User).filter(db_models.User.username == user.username).first()
    if not db_user or db_user.hashed_password != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
    # Generate login token
    token_payload = {
        "sub": db_user.username,
        "role": db_user.role,
        "exp": datetime.utcnow() + timedelta(hours=12)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role
    }