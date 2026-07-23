import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from routes.auth import role_required, ROLE_ADMIN, ROLE_QUALITY_ENGINEER, ROLE_QUALITY_INSPECTOR
from werkzeug.utils import secure_filename

upload_bp = Blueprint("upload", __name__)


def get_db_connection():
    db_path = current_app.config.get("DATABASE_PATH") or os.environ.get("DATABASE_PATH") or os.path.join(Path(__file__).resolve().parents[1], "..", "instance", "backend.db")
    from app import init_db

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@upload_bp.route("", methods=["POST"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"error": "file is required"}), 400

    filename = secure_filename(uploaded_file.filename)
    if not filename:
        return jsonify({"error": "invalid filename"}), 400

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    save_path = os.path.join(upload_dir, filename)
    uploaded_file.save(save_path)

    return jsonify({"message": "uploaded", "filename": filename, "path": save_path}), 201
