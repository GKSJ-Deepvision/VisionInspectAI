from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

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
# Temporary Users Database
# -----------------------------
users_db = {
    "admin": {
        "username": "admin",
        "password": hash_password("admin123"),
        "role": "admin"
    }
}


# -----------------------------
# Signup API
# -----------------------------
@router.post("/signup")
def signup(user: SignupRequest):

    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")

    users_db[user.username] = {
        "username": user.username,
        "password": hash_password(user.password),
        "role": user.role
    }

    return {
        "message": "User registered successfully"
    }


# -----------------------------
# Login API
# -----------------------------
@router.post("/login")
def login(data: LoginRequest):

    user = users_db.get(data.username)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"]
    })

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
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