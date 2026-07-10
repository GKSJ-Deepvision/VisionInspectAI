from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.user import User
    from models.inspection import Inspection


class UploadedImage(Base):
    """
    UploadedImage entity representing product images captured from the line.
    """
    __tablename__ = "uploaded_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    filepath: Mapped[str] = mapped_column(String(512), nullable=False)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    uploader: Mapped["User"] = relationship("User", back_populates="images")
    
    inspections: Mapped[List["Inspection"]] = relationship(
        "Inspection",
        back_populates="image",
        cascade="all, delete-orphan"
    )
