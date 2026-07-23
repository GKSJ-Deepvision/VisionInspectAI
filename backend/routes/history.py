import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from routes.auth import get_current_user, role_required, ROLE_ADMIN, ROLE_QUALITY_ENGINEER, ROLE_QUALITY_INSPECTOR

history_bp = Blueprint("history", __name__)


def get_db_connection():
    db_path = current_app.config.get("DATABASE_PATH") or os.environ.get("DATABASE_PATH") or os.path.join(Path(__file__).resolve().parents[1], "..", "instance", "backend.db")
    from app import init_db

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@history_bp.route("", methods=["GET"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def history():
    user = get_current_user()

    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    
    conn = get_db_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, user_id, filename, status, score, created_at
            FROM inspection_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user["id"], limit, offset)
        ).fetchall()
        total = conn.execute(
            "SELECT COUNT(*) as count FROM inspection_results WHERE user_id = ?",
            (user["id"],),
        ).fetchone()["count"]
    finally:
        conn.close()

    return jsonify({
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": [dict(row) for row in rows]
    }), 200


@history_bp.route("/<int:inspection_id>", methods=["GET"])
@role_required(ROLE_QUALITY_INSPECTOR, ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def get_inspection(inspection_id):
    user = get_current_user()

    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT * FROM inspection_results WHERE id = ? AND user_id = ?",
            (inspection_id, user["id"])
        ).fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "inspection not found"}), 404

    return jsonify(dict(row)), 200
