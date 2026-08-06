import os
import sqlite3
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

try:
    from ..database_utils import get_db_connection
    from ..services.inference import run_inference
    from .auth import get_current_user
    from .utils import error_response, success_response
except ImportError:  # pragma: no cover - pytest imports routes as top-level modules
    from database_utils import get_db_connection
    from services.inference import run_inference
    from routes.auth import get_current_user
    from routes.utils import error_response, success_response

inspection_bp = Blueprint("inspection", __name__)


def allowed_file(filename):
    allowed_extensions = current_app.config.get(
        "ALLOWED_EXTENSIONS",
        {"jpg", "jpeg", "png", "bmp", "tif", "tiff", "webp"},
    )
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in allowed_extensions
    )


@inspection_bp.route("", methods=["GET"])
def list_inspections():
    user = get_current_user()

    if not user:
        return error_response("unauthorized", 401)

    conn = get_db_connection()

    try:
        if user["role"] == "factory_supervisor":
            rows = conn.execute(
                """
                SELECT
                    ir.id,
                    ir.user_id,
                    COALESCE(u.username, u.name, u.email) AS username,
                    u.email,
                    COALESCE(ir.filename, i.image_path) AS filename,
                    COALESCE(ir.category, i.category) AS category,
                    COALESCE(ir.status, i.status, ir.result_summary) AS status,
                    ir.anomaly_score,
                    ir.defect,
                    ir.confidence,
                    ir.severity_score,
                    ir.severity_level,
                    ir.quality_decision,
                    ir.recommended_action,
                    ir.heatmap_url,
                    ir.inspection_status,
                    ir.inspection_passed,
                    ir.created_at
                FROM inspection_results ir
                LEFT JOIN users u ON ir.user_id = u.id
                LEFT JOIN inspections i ON ir.inspection_id = i.id
                ORDER BY ir.id DESC
                """
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT
                    ir.id,
                    ir.user_id,
                    COALESCE(u.username, u.name, u.email) AS username,
                    u.email,
                    COALESCE(ir.filename, i.image_path) AS filename,
                    COALESCE(ir.category, i.category) AS category,
                    COALESCE(ir.status, i.status, ir.result_summary) AS status,
                    ir.anomaly_score,
                    ir.defect,
                    ir.confidence,
                    ir.severity_score,
                    ir.severity_level,
                    ir.quality_decision,
                    ir.recommended_action,
                    ir.heatmap_url,
                    ir.inspection_status,
                    ir.inspection_passed,
                    ir.created_at
                FROM inspection_results ir
                LEFT JOIN users u ON ir.user_id = u.id
                LEFT JOIN inspections i ON ir.inspection_id = i.id
                WHERE ir.user_id = ?
                ORDER BY ir.id DESC
                """,
                (user["id"],),
            ).fetchall()

    finally:
        conn.close()

    return success_response({"results": [dict(row) for row in rows]})


@inspection_bp.route("", methods=["POST"])
def create_inspection():
    user = get_current_user()

    if not user:
        return error_response("unauthorized", 401)

    payload = request.get_json(silent=True) or {}
    if request.form:
        payload.update(request.form.to_dict())

    uploaded_file = None
    if "file" in request.files and request.files["file"].filename:
        uploaded_file = request.files["file"]

    filename = (payload.get("filename") or "").strip()
    status = (payload.get("status") or "pending").strip()

    if uploaded_file:
        filename = secure_filename(uploaded_file.filename)

        upload_dir = current_app.config.get(
            "UPLOAD_FOLDER",
            os.path.join(
                Path(__file__).resolve().parents[1],
                "uploads",
            ),
        )
        os.makedirs(upload_dir, exist_ok=True)
        save_path = os.path.join(upload_dir, filename)
        uploaded_file.save(save_path)
        payload["filename"] = filename
        payload["file_path"] = save_path

    if not filename:
        return error_response("filename is required", 400)

    try:
        anomaly_score = float(payload.get("anomaly_score", payload.get("score", 0)) or 0)
    except (TypeError, ValueError):
        return error_response("anomaly_score must be a valid number", 400)

    inference_result = {}
    if uploaded_file:
        try:
            inference_result = run_inference(payload["file_path"], payload.get("category") or "unknown")
        except Exception:
            inference_result = {
                "status": "Pending",
                "anomaly_score": anomaly_score,
                "heatmap_url": None,
                "defect": None,
                "confidence": None,
                "severity_score": None,
                "severity_level": None,
                "quality_decision": "Review Required",
                "recommended_action": "Manual review required",
                "inspection_status": "Pending",
                "inspection_passed": False,
            }

    if inference_result:
        payload.setdefault("status", inference_result.get("status") or status)
        payload.setdefault("anomaly_score", inference_result.get("anomaly_score", anomaly_score))
        payload.setdefault("heatmap_url", inference_result.get("heatmap_url"))
        payload.setdefault("defect", inference_result.get("defect"))
        payload.setdefault("confidence", inference_result.get("confidence"))
        payload.setdefault("severity_score", inference_result.get("severity_score"))
        payload.setdefault("severity_level", inference_result.get("severity_level"))
        payload.setdefault("quality_decision", inference_result.get("quality_decision"))
        payload.setdefault("recommended_action", inference_result.get("recommended_action"))
        payload.setdefault("inspection_status", inference_result.get("inspection_status"))
        payload.setdefault("inspection_passed", inference_result.get("inspection_passed"))

    if payload.get("anomaly_score") is None:
        payload["anomaly_score"] = anomaly_score

    conn = get_db_connection()

    try:
        cur = conn.cursor()
        inspection_category = payload.get("category") or "unknown"
        inspection_status = payload.get("status") or status

        inspection_path = payload.get("file_path") or filename
        cur.execute(
            """
            INSERT INTO inspections (user_id, category, image_path, status)
            VALUES (?, ?, ?, ?)
            """,
            (user["id"], inspection_category, inspection_path, inspection_status),
        )
        inspection_row_id = cur.lastrowid

        cur.execute(
            """
            INSERT INTO inspection_results
                (inspection_id, user_id, filename, category, status, anomaly_score, defect, confidence, severity_score, severity_level, quality_decision, recommended_action, heatmap_url, inspection_status, inspection_passed, result_summary, is_defective)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                inspection_row_id,
                user["id"],
                filename,
                inspection_category,
                inspection_status,
                float(payload.get("anomaly_score", anomaly_score) or 0),
                payload.get("defect"),
                payload.get("confidence"),
                payload.get("severity_score"),
                payload.get("severity_level"),
                payload.get("quality_decision"),
                payload.get("recommended_action"),
                payload.get("heatmap_url"),
                payload.get("inspection_status"),
                int(bool(payload.get("inspection_passed", False))),
                "Pass" if str(inspection_status).lower() != "defective" else "Fail",
                int(bool(str(inspection_status).lower() == "defective")),
            ),
        )
        conn.commit()
        inspection_id = cur.lastrowid
    except sqlite3.Error:
        conn.rollback()
        return error_response("database error", 500)
    finally:
        conn.close()

    return success_response(
        {
            "message": "inspection created",
            "id": inspection_id,
            "user_id": user["id"],
            "filename": filename,
            "status": payload.get("status") or status,
        },
        status=201,
    )


@inspection_bp.route("/<int:inspection_id>", methods=["GET"])
def get_inspection(inspection_id):
    user = get_current_user()

    if not user:
        return error_response("unauthorized", 401)

    conn = get_db_connection()

    try:
        row = conn.execute(
            """
            SELECT
                ir.id,
                ir.user_id,
                COALESCE(u.username, u.name, u.email) AS username,
                u.email,
                COALESCE(ir.filename, i.image_path) AS filename,
                COALESCE(ir.category, i.category) AS category,
                COALESCE(ir.status, i.status, ir.result_summary) AS status,
                ir.anomaly_score,
                ir.defect,
                ir.confidence,
                ir.severity_score,
                ir.severity_level,
                ir.quality_decision,
                ir.recommended_action,
                ir.heatmap_url,
                ir.inspection_status,
                ir.inspection_passed,
                ir.created_at
            FROM inspection_results ir
            LEFT JOIN users u ON ir.user_id = u.id
            LEFT JOIN inspections i ON ir.inspection_id = i.id
            WHERE ir.id = ?
            """,
            (inspection_id,),
        ).fetchone()

    finally:
        conn.close()

    if not row:
        return error_response("inspection not found", 404)

    if user["role"] == "quality_inspector" and row["user_id"] != user["id"]:
        return error_response("forbidden", 403)

    return success_response(dict(row))


@inspection_bp.route("/<int:inspection_id>", methods=["PUT"])
def update_inspection(inspection_id):
    user = get_current_user()

    if not user:
        return error_response("unauthorized", 401)

    payload = request.get_json(silent=True) or {}

    status = (payload.get("status") or "pending").strip()

    try:
        anomaly_score = float(payload.get("anomaly_score", payload.get("score", 0)) or 0)
    except (TypeError, ValueError):
        return error_response("anomaly_score must be a valid number", 400)

    conn = get_db_connection()

    try:
        existing = conn.execute(
            """
            SELECT id, user_id
            FROM inspection_results
            WHERE id = ?
            """,
            (inspection_id,),
        ).fetchone()

        if not existing:
            return error_response("inspection not found", 404)

        if user["role"] == "quality_inspector" and existing["user_id"] != user["id"]:
            return error_response("forbidden", 403)

        cur = conn.cursor()

        cur.execute(
            """
            UPDATE inspection_results
            SET status = ?, anomaly_score = ?, category = ?, defect = ?, confidence = ?, severity_score = ?, severity_level = ?, quality_decision = ?, recommended_action = ?, heatmap_url = ?, inspection_status = ?, inspection_passed = ?
            WHERE id = ?
            """,
            (
                status,
                anomaly_score,
                payload.get("category"),
                payload.get("defect"),
                payload.get("confidence"),
                payload.get("severity_score"),
                payload.get("severity_level"),
                payload.get("quality_decision"),
                payload.get("recommended_action"),
                payload.get("heatmap_url"),
                payload.get("inspection_status"),
                int(bool(payload.get("inspection_passed", False))),
                inspection_id,
            ),
        )

        conn.commit()

        row = conn.execute(
            """
            SELECT
                ir.id,
                ir.user_id,
                COALESCE(u.username, u.name, u.email) AS username,
                u.email,
                COALESCE(ir.filename, i.image_path) AS filename,
                COALESCE(ir.category, i.category) AS category,
                COALESCE(ir.status, i.status, ir.result_summary) AS status,
                ir.anomaly_score,
                ir.defect,
                ir.confidence,
                ir.severity_score,
                ir.severity_level,
                ir.quality_decision,
                ir.recommended_action,
                ir.heatmap_url,
                ir.inspection_status,
                ir.inspection_passed,
                ir.created_at
            FROM inspection_results ir
            LEFT JOIN users u ON ir.user_id = u.id
            LEFT JOIN inspections i ON ir.inspection_id = i.id
            WHERE ir.id = ?
            """,
            (inspection_id,),
        ).fetchone()

    except sqlite3.Error:
        conn.rollback()
        return error_response("database error", 500)
    finally:
        conn.close()

    return success_response(dict(row)), 200


@inspection_bp.route("/predict", methods=["POST"])
def predict_inspection():
    user = get_current_user()

    if not user:
        return error_response("unauthorized", 401)

    if "image" not in request.files:
        return error_response("Image is required", 400)

    image = request.files["image"]
    category = request.form.get("category")

    if not category:
        return error_response("Category is required", 400)

    if image.filename == "":
        return error_response("No image selected", 400)

    if not allowed_file(image.filename):
        return error_response("Unsupported image format", 400)

    filename = secure_filename(image.filename)
    unique_filename = f"{uuid4().hex}_{filename}"
    image_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)

    image.save(image_path)
    import traceback
    try:
        result = run_inference(image_path=image_path, category=category)
    except FileNotFoundError:
        return error_response("Missing file", 404)
    except ValueError as exc:
        return error_response(str(exc), 400)

    except Exception:
        traceback.print_exc()
        raise
    #except Exception:
        #return error_response("AI inference failure", 500)

    status = result.get("status") or "Pending"
    inspection_status = result.get("inspection_status") or "Completed"
    inspection_passed = int(bool(result.get("inspection_passed", False)))
    is_defective = int(
        not bool(result.get("inspection_passed", True))
        or str(status).lower() == "defective"
    )
    result_summary = result.get("result_summary") or f"Inspection result: {status}"

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO inspections (user_id, category, image_path, status)
            VALUES (?, ?, ?, ?)
            """,
            (user["id"], result.get("category") or category, image_path, status),
        )
        inspection_row_id = cur.lastrowid

        cur.execute(
            """
            INSERT INTO inspection_results (
                inspection_id, user_id, filename, category, status, anomaly_score, defect, confidence,
                severity_score, severity_level, quality_decision, recommended_action,
                heatmap_url, inspection_status, inspection_passed, result_summary, is_defective
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                inspection_row_id,
                user["id"],
                result.get("image_name") or filename,
                result.get("category") or category,
                status,
                float(result.get("anomaly_score") or 0),
                result.get("defect"),
                result.get("confidence"),
                result.get("severity_score"),
                result.get("severity_level"),
                result.get("quality_decision"),
                result.get("recommended_action"),
                result.get("heatmap_url"),
                inspection_status,
                inspection_passed,
                result_summary,
                is_defective,
            ),
        )
        inspection_result_id = cur.lastrowid

        # Persist any defects returned by the inference into the defects table
        defects = result.get("defects") or []
        if isinstance(defects, list) and defects:
            for d in defects:
                cur.execute(
                    """
                    INSERT INTO defects (
                        inspection_id, defect_type, size_score, location_score, type_score, confidence_score, severity_score, severity_level, heatmap_path
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        inspection_row_id,
                        d.get("defect_type"),
                        float(d.get("size_score") or 0),
                        float(d.get("location_score") or 0),
                        float(d.get("type_score") or 0),
                        float(d.get("confidence_score") or d.get("confidence") or 0),
                        float(d.get("severity_score") or 0),
                        d.get("severity_level"),
                        d.get("heatmap_path"),
                    ),
                )

        # Persist quality decision if present
        quality_decision = result.get("quality_decision") or result.get("decision")
        recommended_action = result.get("recommended_action")
        if quality_decision:
            cur.execute(
                "INSERT OR REPLACE INTO quality_decisions (inspection_id, decision, recommended_action) VALUES (?, ?, ?)",
                (inspection_row_id, quality_decision, recommended_action),
            )

        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        return error_response("database error", 500)
    finally:
        conn.close()

    result["inspection_id"] = inspection_row_id
    result["inspection_result_id"] = inspection_result_id
    result["result_summary"] = result.get("result_summary") or result_summary

    return success_response(result, status=200)