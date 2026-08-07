from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User

from backend.auth.security import hash_password, verify_password
from backend.auth.jwt_handler import (
    create_access_token,
    get_current_user,
    require_admin
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# -----------------------------
# Models
# -----------------------------
class SignupRequest(BaseModel):
    username: str
    password: str
    role: str = "user"


class LoginRequest(BaseModel):
    username: str
    password: str


# -----------------------------
# Signup API
# -----------------------------
@router.post("/signup")
def signup(
    user: SignupRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = User(
        username=user.username,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User registered successfully"
    }

# -----------------------------
# Login API
# -----------------------------
@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role
        }
    )

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }

# -----------------------------
# Protected Profile API
# -----------------------------
@router.get("/profile")
def profile(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Protected Route Accessed Successfully",
        "user": current_user
    }


# -----------------------------
# Admin Only API
# -----------------------------
@router.get("/admin")
def admin_dashboard(current_user: dict = Depends(require_admin)):
    return {
        "message": "Welcome Admin!",
        "user": current_user
    }