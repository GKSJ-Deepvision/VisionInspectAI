from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.models.database import Base

class ReportStorage(Base):
    __tablename__ = "report_storage"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255))
    report_name = Column(String(255))
    report_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
