from pydantic import BaseModel
from datetime import datetime


class InspectionResponse(BaseModel):
    id: int
    image_name: str
    image_path: str | None = None

    prediction: str
    confidence: float

    defect_type: str | None = None
    severity: str | None = None
    risk_score: float = 0
    recommendation: str | None = None

    created_at: datetime
    user_id: int | None = None

    class Config:
        from_attributes = True