from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    # No `role` field here on purpose - public registration must not let a
    # client hand themselves elevated access. Every self-registered account
    # is forced to "factory_supervisor" in the endpoint; promoting someone
    # to "admin" / "quality_engineer" goes through the separate
    # admin-only PATCH /users/{user_id}/role endpoint instead.
    username: str
    password: str


class RoleUpdate(BaseModel):
    role: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class InspectionOut(BaseModel):
    id: int
    category: str
    filename: str
    pred_label: str
    pred_score: float
    severity_score: Optional[float]
    severity_level: Optional[str]
    heatmap_filename: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
