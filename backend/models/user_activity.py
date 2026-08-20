from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.models.database import Base

class UserActivity(Base):
    __tablename__ = "user_activity"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False)
    activity = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
