<<<<<<< HEAD
import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

from services.inference_log_service import (
    save_inference_result,
    get_inference_result
)


inspection_bp = Blueprint("inspection", __name__)


def get_db_connection():

    db_path = (
        current_app.config.get("DATABASE_PATH")
        or os.environ.get("DATABASE_PATH")
        or os.path.join(
            Path(__file__).resolve().parents[1],
            "..",
            "instance",
            "backend.db"
        )
    )

    from app import init_db

    init_db(db_path)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    return conn



@inspection_bp.route("", methods=["GET"])
def list_inspections():

    conn = get_db_connection()

    try:
        rows = conn.execute(
            """
            SELECT id, filename, status, score, created_at
            FROM inspection_results
            ORDER BY id DESC
            """
        ).fetchall()

    finally:
        conn.close()


    return jsonify(
        [dict(row) for row in rows]
    ), 200



@inspection_bp.route("", methods=["POST"])
def create_inspection():

    payload = request.get_json(silent=True) or {}

    filename = (
        payload.get("filename") or ""
    ).strip()

    status = (
        payload.get("status")
        or "pending"
    ).strip()

    score = float(
        payload.get("score", 0) or 0
    )

    user_id = int(
        payload.get("user_id", 0) or 0
    )


    if not filename:
        return jsonify(
            {"error": "filename is required"}
        ), 400



    conn = get_db_connection()

    try:

        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO inspection_results
            (user_id, filename, status, score)
            VALUES (?, ?, ?, ?)
            """,
            (
                user_id,
                filename,
                status,
                score
            ),
        )


        conn.commit()

        inspection_id = cur.lastrowid



        # Save AI result into MongoDB
        save_inference_result(

            inspection_id=inspection_id,

            model_version="patchcore-demo",

            anomaly_score=score,

            prediction=status,

            heatmap_path="uploads/demo_heatmap.png",

            mask_path="uploads/demo_mask.png",

            defects_detected=[
                {
                    "defect_type": "scratch",
                    "confidence": 0.91,
                    "severity_contribution": 27.3
                }
            ],

            processing_time_ms=300
        )


    finally:
        conn.close()



    return jsonify(
        {
            "message": "inspection created",
            "id": inspection_id
        }
    ), 201





@inspection_bp.route("/<int:inspection_id>", methods=["GET"])
def get_inspection(inspection_id):

    conn = get_db_connection()

    try:

        row = conn.execute(
            """
            SELECT id, user_id, filename, status, score, created_at
            FROM inspection_results
            WHERE id = ?
            """,
            (inspection_id,),
        ).fetchone()

    finally:
        conn.close()



    if not row:
        return jsonify(
            {"error": "inspection not found"}
        ), 404



    return jsonify(
        dict(row)
    ), 200





@inspection_bp.route("/<int:inspection_id>/raw", methods=["GET"])
def get_raw_result(inspection_id):

    result = get_inference_result(
        inspection_id
    )


    if not result:

        return jsonify(
            {
                "error": "MongoDB result not found"
            }
        ), 404


    return jsonify(result), 200





@inspection_bp.route("/<int:inspection_id>", methods=["PUT"])
def update_inspection(inspection_id):

    payload = request.get_json(silent=True) or {}


    status = (
        payload.get("status")
        or "pending"
    ).strip()


    score = float(
        payload.get("score", 0) or 0
    )


    conn = get_db_connection()


    try:

        cur = conn.cursor()


        cur.execute(
            """
            UPDATE inspection_results
            SET status = ?, score = ?
            WHERE id = ?
            """,
            (
                status,
                score,
                inspection_id
            ),
        )


        conn.commit()


        row = conn.execute(
            """
            SELECT id, user_id, filename, status, score, created_at
            FROM inspection_results
            WHERE id = ?
            """,
            (inspection_id,),
        ).fetchone()


    finally:

        conn.close()



    if not row:

        return jsonify(
            {
                "error": "inspection not found"
            }
        ), 404



    return jsonify(
        dict(row)
=======
import os
import sqlite3
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

from services.inference_log_service import (
    save_inference_result,
    get_inference_result
)


inspection_bp = Blueprint("inspection", __name__)


def get_db_connection():

    db_path = (
        current_app.config.get("DATABASE_PATH")
        or os.environ.get("DATABASE_PATH")
        or os.path.join(
            Path(__file__).resolve().parents[1],
            "..",
            "instance",
            "backend.db"
        )
    )

    from app import init_db

    init_db(db_path)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    return conn



@inspection_bp.route("", methods=["GET"])
def list_inspections():

    conn = get_db_connection()

    try:
        rows = conn.execute(
            """
            SELECT id, filename, status, score, created_at
            FROM inspection_results
            ORDER BY id DESC
            """
        ).fetchall()

    finally:
        conn.close()


    return jsonify(
        [dict(row) for row in rows]
    ), 200



@inspection_bp.route("", methods=["POST"])
def create_inspection():

    payload = request.get_json(silent=True) or {}

    filename = (
        payload.get("filename") or ""
    ).strip()

    status = (
        payload.get("status")
        or "pending"
    ).strip()

    score = float(
        payload.get("score", 0) or 0
    )

    user_id = int(
        payload.get("user_id", 0) or 0
    )


    if not filename:
        return jsonify(
            {"error": "filename is required"}
        ), 400



    conn = get_db_connection()

    try:

        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO inspection_results
            (user_id, filename, status, score)
            VALUES (?, ?, ?, ?)
            """,
            (
                user_id,
                filename,
                status,
                score
            ),
        )


        conn.commit()

        inspection_id = cur.lastrowid



        # Save AI result into MongoDB
        save_inference_result(

            inspection_id=inspection_id,

            model_version="patchcore-demo",

            anomaly_score=score,

            prediction=status,

            heatmap_path="uploads/demo_heatmap.png",

            mask_path="uploads/demo_mask.png",

            defects_detected=[
                {
                    "defect_type": "scratch",
                    "confidence": 0.91,
                    "severity_contribution": 27.3
                }
            ],

            processing_time_ms=300
        )


    finally:
        conn.close()



    return jsonify(
        {
            "message": "inspection created",
            "id": inspection_id
        }
    ), 201





@inspection_bp.route("/<int:inspection_id>", methods=["GET"])
def get_inspection(inspection_id):

    conn = get_db_connection()

    try:

        row = conn.execute(
            """
            SELECT id, user_id, filename, status, score, created_at
            FROM inspection_results
            WHERE id = ?
            """,
            (inspection_id,),
        ).fetchone()

    finally:
        conn.close()



    if not row:
        return jsonify(
            {"error": "inspection not found"}
        ), 404



    return jsonify(
        dict(row)
    ), 200





@inspection_bp.route("/<int:inspection_id>/raw", methods=["GET"])
def get_raw_result(inspection_id):

    result = get_inference_result(
        inspection_id
    )


    if not result:

        return jsonify(
            {
                "error": "MongoDB result not found"
            }
        ), 404


    return jsonify(result), 200





@inspection_bp.route("/<int:inspection_id>", methods=["PUT"])
def update_inspection(inspection_id):

    payload = request.get_json(silent=True) or {}


    status = (
        payload.get("status")
        or "pending"
    ).strip()


    score = float(
        payload.get("score", 0) or 0
    )


    conn = get_db_connection()


    try:

        cur = conn.cursor()


        cur.execute(
            """
            UPDATE inspection_results
            SET status = ?, score = ?
            WHERE id = ?
            """,
            (
                status,
                score,
                inspection_id
            ),
        )


        conn.commit()


        row = conn.execute(
            """
            SELECT id, user_id, filename, status, score, created_at
            FROM inspection_results
            WHERE id = ?
            """,
            (inspection_id,),
        ).fetchone()


    finally:

        conn.close()



    if not row:

        return jsonify(
            {
                "error": "inspection not found"
            }
        ), 404



    return jsonify(
        dict(row)
>>>>>>> d7138b90d4d222e0cde204ced986665bdbb2d095
    ), 200