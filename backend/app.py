import os
import sqlite3
from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth import auth_bp
from routes.upload import upload_bp
from routes.inspection import inspection_bp
from routes.analytics import analytics_bp
from routes.history import history_bp


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "visioninspect_dev_secret_key_2026"),
        UPLOAD_FOLDER=os.path.join(Path(__file__).resolve().parent, "uploads"),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,
        DATABASE_PATH=os.environ.get("DATABASE_PATH", os.path.join(Path(__file__).resolve().parent.parent, "instance", "backend.db")),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    if test_config:
        app.config.update(test_config)

    app.config["DATABASE_PATH"] = os.path.abspath(app.config["DATABASE_PATH"])

    CORS(app)

    os.makedirs(os.path.dirname(app.config["DATABASE_PATH"]), exist_ok=True)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    init_db(app.config["DATABASE_PATH"])

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(inspection_bp, url_prefix="/api/inspection")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    try:
        from routes.dataset import dataset_bp

        app.register_blueprint(dataset_bp, url_prefix="/api/dataset")
    except ImportError:
        pass

    @app.route("/")
    def health_check():
        return jsonify({"status": "ok", "message": "VisionInspect-AI backend is running"})

    return app


def init_db(path):
    conn = sqlite3.connect(path)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
            """
        )
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        cur.execute("PRAGMA table_info(users)")
        columns = {row[1] for row in cur.fetchall()}
        if "email" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if "created_at" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN created_at TEXT")
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS inspection_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                status TEXT NOT NULL,
                score REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
    except sqlite3.OperationalError as exc:
        conn.rollback()
        if "already exists" not in str(exc):
            raise
        conn.commit()
    finally:
        conn.close()


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
