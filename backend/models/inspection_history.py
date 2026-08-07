from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from backend.models.database import Base


class InspectionHistory(Base):
    __tablename__ = "inspection_history"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False)

    image_name = Column(String, nullable=False)

    category = Column(String)

    defect = Column(String)

    result = Column(String)

    confidence = Column(Float)

    anomaly_score = Column(Float)

    severity_score = Column(Float)

    severity_level = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
