from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.models.database import Base


class ReportStorage(Base):
    __tablename__ = "report_storage"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    report_name = Column(String)
    report_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)