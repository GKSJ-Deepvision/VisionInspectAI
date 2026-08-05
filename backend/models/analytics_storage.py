from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.models.database import Base


class AnalyticsStorage(Base):
    __tablename__ = "analytics_storage"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    total_images = Column(Integer)
    defect_count = Column(Integer)
    normal_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)