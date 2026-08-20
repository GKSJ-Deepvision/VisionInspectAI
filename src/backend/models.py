from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="factory_supervisor")

    inspections = relationship("InspectionLog", back_populates="user")


class InspectionLog(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    pred_label = Column(String, nullable=False)
    pred_score = Column(Float, nullable=False)
    severity_score = Column(Float, nullable=True)
    severity_level = Column(String, nullable=True)
    heatmap_filename = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="inspections")
