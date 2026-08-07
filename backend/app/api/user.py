from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserProfile

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserProfile)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user