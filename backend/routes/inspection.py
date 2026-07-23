import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from routes.auth import get_current_user, role_required, ROLE_ADMIN, ROLE_QUALITY_ENGINEER, ROLE_QUALITY_INSPECTOR
from services.inference import run_inference

inspection_bp = Blueprint("inspection", __name__)


def get_db_connection():
    db_path = current_app.config.get("DATABASE_PATH") or os.environ.get("DATABASE_PATH") or os.path.join(Path(__file__).resolve().parents[1], "..", "instance", "backend.db")
    from app import init_db

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@inspection_bp.route("", methods=["GET"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def list_inspections():
    user = get_current_user()

    conn = get_db_connection()
    try:
        rows = conn.execute(
            "SELECT id, user_id, filename, status, score, created_at FROM inspection_results WHERE user_id = ? ORDER BY id DESC",
            (user["id"],),
        ).fetchall()
    finally:
        conn.close()

    return jsonify([dict(row) for row in rows]), 200


@inspection_bp.route("", methods=["POST"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def create_inspection():
    user = get_current_user()

    payload = request.get_json(silent=True) or {}
    filename = (payload.get("filename") or "").strip()
    status = (payload.get("status") or "pending").strip()
    score = float(payload.get("score", 0) or 0)
    if not filename:
        return jsonify({"error": "filename is required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO inspection_results (user_id, filename, status, score) VALUES (?, ?, ?, ?)",
            (user["id"], filename, status, score),
        )
        conn.commit()
        inspection_id = cur.lastrowid
    finally:
        conn.close()

    return jsonify({"message": "inspection created", "id": inspection_id}), 201


@inspection_bp.route("/image", methods=["POST"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def inspect_image():
    user = get_current_user()

    if "file" not in request.files or not request.files["file"].filename:
        return jsonify({"error": "file is required"}), 400

    uploaded_file = request.files["file"]
    filename = secure_filename(uploaded_file.filename)
    if not filename:
        return jsonify({"error": "invalid filename"}), 400

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    uploaded_file.save(os.path.join(upload_dir, filename))

    result = run_inference(filename, user["id"], upload_dir)
    conn = get_db_connection()
    try:
        cur = conn.execute(
            "INSERT INTO inspection_results (user_id, filename, status, score) VALUES (?, ?, ?, ?)",
            (user["id"], filename, result["status"], result["score"]),
        )
        conn.commit()
        result["id"] = cur.lastrowid
    finally:
        conn.close()

    return jsonify(result), 201


@inspection_bp.route("/<int:inspection_id>", methods=["GET"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def get_inspection(inspection_id):
    user = get_current_user()

    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT id, user_id, filename, status, score, created_at FROM inspection_results WHERE id = ? AND user_id = ?",
            (inspection_id, user["id"]),
        ).fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "inspection not found"}), 404

    return jsonify(dict(row)), 200


@inspection_bp.route("/<int:inspection_id>", methods=["PUT"])
@role_required(ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def update_inspection(inspection_id):
    user = get_current_user()

    payload = request.get_json(silent=True) or {}
    status = (payload.get("status") or "pending").strip()
    score = float(payload.get("score", 0) or 0)

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE inspection_results SET status = ?, score = ? WHERE id = ? AND user_id = ?",
            (status, score, inspection_id, user["id"]),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, user_id, filename, status, score, created_at FROM inspection_results WHERE id = ? AND user_id = ?",
            (inspection_id, user["id"]),
        ).fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "inspection not found"}), 404

    return jsonify(dict(row)), 200
