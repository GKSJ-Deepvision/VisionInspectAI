import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify
from routes.auth import get_current_user, role_required, ROLE_ADMIN, ROLE_QUALITY_ENGINEER

analytics_bp = Blueprint("analytics", __name__)


def get_db_connection():
    db_path = current_app.config.get("DATABASE_PATH") or os.environ.get("DATABASE_PATH") or os.path.join(Path(__file__).resolve().parents[1], "..", "instance", "backend.db")
    from app import init_db

    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@analytics_bp.route("", methods=["GET"])
@role_required(ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def analytics():
    user = get_current_user()

    conn = get_db_connection()
    try:
        stats = conn.execute(
            """
            SELECT 
                COUNT(*) as total_inspections,
                AVG(score) as average_score,
                MAX(score) as max_score,
                MIN(score) as min_score
            FROM inspection_results
            WHERE user_id = ?
            """,
            (user["id"],)
        ).fetchone()
    finally:
        conn.close()

    return jsonify({
        "summary": {
            "total_inspections": stats["total_inspections"] or 0,
            "average_score": round(stats["average_score"] or 0.0, 2),
            "max_score": round(stats["max_score"] or 0.0, 2),
            "min_score": round(stats["min_score"] or 0.0, 2)
        }
    }), 200


@analytics_bp.route("/by-status", methods=["GET"])
@role_required(ROLE_QUALITY_ENGINEER, ROLE_ADMIN)
def analytics_by_status():
    user = get_current_user()

    conn = get_db_connection()
    try:
        stats = conn.execute(
            """
            SELECT status, COUNT(*) as count
            FROM inspection_results
            WHERE user_id = ?
            GROUP BY status
            """,
            (user["id"],)
        ).fetchall()
    finally:
        conn.close()

    return jsonify({
        "by_status": [dict(row) for row in stats]
    }), 200
