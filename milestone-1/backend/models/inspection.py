from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.image import UploadedImage
    from models.report import Report


class Inspection(Base):
    """
    Inspection entity representing AI/manual inspection result of a single uploaded product image.
    """
    __tablename__ = "inspections"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    image_id: Mapped[int] = mapped_column(ForeignKey("uploaded_images.id", ondelete="CASCADE"), nullable=False)
    prediction: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    image: Mapped["UploadedImage"] = relationship("UploadedImage", back_populates="inspections")
    
    report: Mapped[Optional["Report"]] = relationship(
        "Report",
        back_populates="inspection",
        uselist=False,
        cascade="all, delete-orphan"
    )
