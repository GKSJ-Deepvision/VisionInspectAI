from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.models.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # User's login email
    username = Column(String(255), unique=True, nullable=False, index=True)
    # Hashed password
    password = Column(String(255), nullable=False)
    # quality_engineer / factory_supervisor
    role = Column(String(50), default="quality_engineer", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
