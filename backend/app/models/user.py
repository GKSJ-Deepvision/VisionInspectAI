from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)

    # User Role
    role = Column(String, default="inspector", nullable=False)

    # Relationship with Inspection
    inspections = relationship(
        "Inspection",
        back_populates="user"
    )