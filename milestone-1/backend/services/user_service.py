from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserCreate
from security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Fetches a user account by email address.
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    """
    Registers a new user operator in the database.
    Prevents duplicate email registration.
    """
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists."
        )
        
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticates a user operator.
    Verifies credentials and returns User object if successful.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def refresh_token_service(db: Session, refresh_token: str) -> dict:
    """
    Validates a refresh token and generates a new access token.
    """
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
        
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload claims."
        )
        
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
        
    new_access_token = create_access_token(subject=user.email)
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
