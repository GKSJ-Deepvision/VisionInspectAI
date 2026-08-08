"""
VisionInspect AI - Database Connection Handler
-------------------------------------------------
Sets up the connection between the Flask backend and the PostgreSQL database.

Uses SQLAlchemy, which is the standard way to talk to a SQL database from
Python/Flask without writing raw SQL everywhere.

HOW TO USE:
  1. Make sure PostgreSQL is installed and running.
  2. Create a database (e.g. `visioninspect_db`).
  3. Fill in your credentials in the `.env` file (see bottom of this file
     for the expected variable names).
  4. In app.py, import `db` and `init_db` from this file and call
     `init_db(app)` once when the Flask app starts.
"""

import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load variables from the .env file into the environment
load_dotenv()

# SQLAlchemy database object — shared across the whole backend.
# models.py will import this same `db` object to define tables.
db = SQLAlchemy()


def get_database_url():
    """
    Build the PostgreSQL connection URL from environment variables.

    Expected .env variables:
        DB_USER=postgres
        DB_PASSWORD=your_password_here
        DB_HOST=localhost
        DB_PORT=5432
        DB_NAME=visioninspect_db
    """
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "visioninspect_db")

    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


def init_db(app):
    """
    Initialize the database connection for a given Flask app instance.
    Call this once in backend/app.py, right after creating the Flask app.

    Example (in app.py):
        from flask import Flask
        from database.connection import init_db

        app = Flask(__name__)
        init_db(app)
    """
    app.config["SQLALCHEMY_DATABASE_URI"] = get_database_url()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # Creates tables automatically based on models.py, if they don't exist yet.
    # (Alternative to manually running schema.sql — either approach works,
    # but don't run both, to avoid conflicts.)
    with app.app_context():
        db.create_all()

    print("[OK] Database connected and tables verified.")
