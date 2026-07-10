from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from security import decode_token
from models.user import User
from rbac import UserRole, Permission, ROLE_PERMISSIONS

# OAuth2PasswordBearer configuration points to the login router endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that secures route endpoints.
    Decodes the JWT token, extracts user identity, and fetches the User from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
        
    user_email: str = payload.get("sub")
    token_type: str = payload.get("type")
    
    if user_email is None or token_type != "access":
        raise credentials_exception
        
    user = db.query(User).filter(User.email == user_email).first()
    if user is None:
        raise credentials_exception
        
    return user


class RoleChecker:
    """
    Dependency check to restrict route endpoints to specific roles.
    Raises HTTP 403 Forbidden if current user role is not allowed.
    """
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in [role.value for role in self.allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted. Insufficient role permissions."
            )
        return current_user


class PermissionChecker:
    """
    Dependency check to restrict route endpoints based on permission maps.
    Raises HTTP 403 Forbidden if user lacks required permission.
    """
    def __init__(self, required_permission: Permission):
        self.required_permission = required_permission

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        try:
            user_role_enum = UserRole(current_user.role)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted. User role is invalid."
            )
            
        allowed_permissions = ROLE_PERMISSIONS.get(user_role_enum, set())
        if self.required_permission not in allowed_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Missing required permission: {self.required_permission.value}."
            )
        return current_user
