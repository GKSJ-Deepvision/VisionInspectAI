from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.models.database import Base


class BatchInspection(Base):
    __tablename__ = "batch_inspection"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    batch_name = Column(String)
    total_images = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)