import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Production PostgreSQL URI with SQLite fallback for instant local development setup
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./visioninspect.db"
)

# Handle SQLite specific threading requirements if fallback is used
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args, 
    pool_pre_ping=True, 
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency injection for secure database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
