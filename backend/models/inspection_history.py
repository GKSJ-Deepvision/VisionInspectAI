from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.models.database import Base


class InspectionHistory(Base):
    __tablename__ = "inspection_history"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    image_name = Column(String, nullable=False)
    defect = Column(String, nullable=False)
    result = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)