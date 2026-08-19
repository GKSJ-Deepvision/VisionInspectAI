from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from sqlalchemy.orm import Session

from backend.models.schemas import UserResponse
from backend.models.database import get_db
from backend.models.user import User

from backend.auth.security import hash_password, verify_password
from backend.auth.jwt_handler import (
    create_access_token,
    get_current_user,
    require_admin,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# -----------------------------
# Models
# -----------------------------

class LoginRequest(BaseModel):
    username: EmailStr
    password: str
    login_mode: str = "quality_engineer"


class UpdateUserRequest(BaseModel):
    username: EmailStr | None = None
    password: str | None = None
    role: str | None = None


# -----------------------------
# Login API
# -----------------------------

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = data.username.lower().strip()

    # ---------------------------------
    # Factory Supervisor Login
    # ---------------------------------

    if data.login_mode == "factory_supervisor":
        user = (
            db.query(User)
            .filter(User.username == email)
            .first()
        )

        if (
            not user
            or user.role != "admin"
            or not verify_password(
                data.password,
                user.password,
            )
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid admin credentials",
            )

        token = create_access_token(
            {
                "sub": user.username,
                "role": "admin",
            }
        )

        return {
            "message": "Login Successful",
            "access_token": token,
            "token_type": "bearer",
            "role": "factory_supervisor",
            "email": user.username,
        }

    # ---------------------------------
    # Quality Engineer Login
    # ---------------------------------

    if data.login_mode != "quality_engineer":
        raise HTTPException(
            status_code=400,
            detail="Invalid login mode",
        )

    user = (
        db.query(User)
        .filter(User.username == email)
        .first()
    )

    # ---------------------------------
    # First-time Quality Engineer
    # ---------------------------------

    if not user:
        user = User(
            username=email,
            password=hash_password(data.password),
            role="user",
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # ---------------------------------
    # Existing account
    # ---------------------------------

    else:
        # Admin accounts cannot use
        # Quality Engineer login.
        if user.role == "admin":
            raise HTTPException(
                status_code=401,
                detail="Use Factory Supervisor login for this account",
            )

        if not verify_password(
            data.password,
            user.password,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

    # ---------------------------------
    # Create JWT
    # ---------------------------------

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role,
        }
    )

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "role": "quality_engineer",
        "email": user.username,
    }


# -----------------------------
# Protected Profile API
# -----------------------------

@router.get(
    "/profile",
    response_model=UserResponse,
)
def profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.username == current_user["sub"]
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


# -----------------------------
# Admin Only APIs
# -----------------------------

@router.get(
    "/users",
    response_model=list[UserResponse],
)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    return db.query(User).all()


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    data: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if data.username:
        user.username = data.username.lower().strip()

    if data.password:
        user.password = hash_password(
            data.password
        )

    if data.role:
        user.role = data.role

    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
    }


@router.get("/admin")
def admin_dashboard(
    current_user: dict = Depends(require_admin),
):
    return {
        "message": "Welcome Admin!",
        "user": current_user,
    }