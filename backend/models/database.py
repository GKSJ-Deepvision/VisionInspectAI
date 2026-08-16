from pathlib import Path
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    from sqlalchemy.engine import make_url

    db_url = make_url(DATABASE_URL)

    print(
        "DATABASE DEBUG:",
        "driver =", db_url.drivername,
        "username =", db_url.username,
        "host =", db_url.host,
        "port =", db_url.port,
        "database =", db_url.database,
    )

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Add it to the project .env file."
    )


connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()