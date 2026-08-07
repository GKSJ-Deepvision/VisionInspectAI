from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="quality_engineer")  # Can be 'quality_engineer' or 'factory_supervisor'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InspectionLog(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    category = Column(String, default="unknown")  # e.g., bottle, cable, metal_nut
    status = Column(String, default="Pending AI Analysis")  # Pending, Pass, Fail
    severity_score = Column(Float, default=0.0)
    defect_type = Column(String, default="None")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
