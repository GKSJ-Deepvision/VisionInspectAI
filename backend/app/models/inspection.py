from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)

    image_name = Column(String, nullable=False)

    image_path = Column(String, nullable=True)

    prediction = Column(String, nullable=False)

    confidence = Column(Float, nullable=False)

    # ---------- NEW FIELDS ----------
    defect_type = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    risk_score = Column(Float, default=0)
    recommendation = Column(String, nullable=True)
    # -------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="inspections"
    )