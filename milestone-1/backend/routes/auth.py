from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from schemas.user import UserCreate, UserOut
from schemas.token import Token, TokenRefresh
from services.user_service import create_user, authenticate_user, refresh_token_service
from security import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new system user operator.
    """
    return create_user(db=db, user_in=user_in)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticates operator credentials and issues an Access Token and Refresh Token.
    Compatible with FastAPI Swagger (/docs) Authorization headers flow.
    """
    user = authenticate_user(db=db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(payload: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refreshes the access token using a valid, unexpired refresh token.
    """
    return refresh_token_service(db=db, refresh_token=payload.refresh_token)


@router.post("/logout")
def logout():
    """
    Logs out the user. Stateless JWT logout is handled client-side by deleting the tokens.
    """
    return {"message": "Logout successful. Clean local token storage."}
