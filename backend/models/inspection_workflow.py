from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime

from backend.models.database import Base


class InspectionWorkflow(Base):
    __tablename__ = "inspection_workflow"

    id = Column(Integer, primary_key=True, index=True)

    inspection_id = Column(
        Integer,
        ForeignKey("inspection_history.id"),
        nullable=False,
        index=True,
    )

    status = Column(
        String,
        nullable=False,
        default="PENDING",
    )

    action_by = Column(String, nullable=True)

    action_at = Column(
        DateTime,
        nullable=True,
    )

    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )