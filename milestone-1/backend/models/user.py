from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from rbac import UserRole

if TYPE_CHECKING:
    from models.image import UploadedImage


class User(Base):
    """
    User entity representing system operators.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=UserRole.QUALITY_ENGINEER.value, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    images: Mapped[List["UploadedImage"]] = relationship(
        "UploadedImage",
        back_populates="uploader",
        cascade="all, delete-orphan"
    )
