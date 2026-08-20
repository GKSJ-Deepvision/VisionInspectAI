from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from backend.models.database import Base

class InspectionHistory(Base):
    __tablename__ = "inspection_history"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False)
    image_name = Column(String(255), nullable=False)
    category = Column(String(100))
    defect = Column(String(255))
    result = Column(String(50))
    confidence = Column(Float)
    anomaly_score = Column(Float)
    severity_score = Column(Float)
    severity_level = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    # New inspection metadata
    threshold = Column(Float)
    recommended_action = Column(String(255))
    class_probabilities = Column(Text)
    severity_breakdown = Column(Text)
    quality_report = Column(Text)
    processing_time_ms = Column(Float)
