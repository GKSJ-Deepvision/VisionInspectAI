from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.inspection import Inspection


class Report(Base):
    """
    Report entity representing the exported PDF/HTML summary of an inspection.
    Each inspection record maps to at most one export report (One-to-One).
    """
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    inspection_id: Mapped[int] = mapped_column(
        ForeignKey("inspections.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    report_path: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    inspection: Mapped["Inspection"] = relationship("Inspection", back_populates="report")
