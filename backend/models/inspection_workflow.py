from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.models.database import Base


class InspectionWorkflow(Base):
    __tablename__ = "inspection_workflow"

    id = Column(Integer, primary_key=True, index=True)

    inspection_id = Column(Integer, nullable=False, index=True)

    status = Column(String, nullable=False)

    action_by = Column(String)

    action_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)