from datetime import datetime
from sqlalchemy import String, Float, DateTime, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base

class AIModel(Base):
    """
    AIModel entity representing AI models metadata and active status.
    """
    __tablename__ = "ai_models"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    version: Mapped[str] = mapped_column(String(100), nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    filepath: Mapped[str] = mapped_column(String(512), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
