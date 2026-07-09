import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

upload_bp = Blueprint("upload", __name__)


def get_db_connection():
    db_path = current_app.config.get("DATABASE_PATH") or os.environ.get("DATABASE_PATH") or os.path.join(Path(__file__).resolve().parents[1], "..", "instance", "backend.db")
    from app import init_db

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@upload_bp.route("", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"error": "file is required"}), 400

    upload_dir = os.path.join(Path(__file__).resolve().parents[1], "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    save_path = os.path.join(upload_dir, uploaded_file.filename)
    uploaded_file.save(save_path)

    return jsonify({"message": "uploaded", "filename": uploaded_file.filename, "path": save_path}), 201
