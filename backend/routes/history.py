import sqlite3

from flask import Blueprint, request

try:
    from ..database_utils import get_db_connection
    from .auth import get_current_user
    from .utils import error_response, success_response
except ImportError:  # pragma: no cover - pytest imports routes as top-level modules
    from database_utils import get_db_connection
    from routes.auth import get_current_user
    from routes.utils import error_response, success_response

history_bp = Blueprint("history", __name__)


@history_bp.route("", methods=["GET"])
def history():
    user = get_current_user()

    if not user:
        return error_response("unauthorized", 401)

    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    status_filter = (request.args.get("status") or "").strip()
    category_filter = (request.args.get("category") or "").strip()
    search = (request.args.get("search") or "").strip()
    date_from = (request.args.get("date_from") or "").strip()
    date_to = (request.args.get("date_to") or "").strip()

    limit = max(1, min(limit or 50, 100))
    offset = max(0, offset or 0)

    conn = get_db_connection()

    try:
        filters = []
        params = []
        if user["role"] != "factory_supervisor":
            filters.append("ir.user_id = ?")
            params.append(user["id"])

        if status_filter:
            filters.append("(COALESCE(ir.status, i.status, ir.result_summary) = ?)")
            params.append(status_filter)

        if category_filter:
            filters.append("(COALESCE(ir.category, i.category) = ?)")
            params.append(category_filter)

        if search:
            filters.append("(COALESCE(ir.filename, i.image_path) LIKE ? OR ir.defect LIKE ? OR ir.quality_decision LIKE ?)")
            like_term = f"%{search}%"
            params.extend([like_term, like_term, like_term])

        if date_from:
            filters.append("ir.created_at >= ?")
            params.append(date_from)

        if date_to:
            filters.append("ir.created_at <= ?")
            params.append(date_to)

        where_clause = f" WHERE {' AND '.join(filters)}" if filters else ""

        rows = conn.execute(
            f"""
            SELECT
                ir.id,
                ir.user_id,
                COALESCE(u.username, u.name, u.email) AS username,
                u.email,
                COALESCE(ir.filename, i.image_path) AS filename,
                COALESCE(ir.category, i.category, ir.category) AS category,
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
            {where_clause}
            ORDER BY ir.created_at DESC
            LIMIT ? OFFSET ?
            """,
            [*params, limit, offset],
        ).fetchall()

        # fetch defects for the returned inspection_result ids in a single query
        ids = [str(r["id"]) for r in rows]
        defects_map = {}
        if ids:
            q = f"SELECT inspection_id, defect_type, size_score, location_score, type_score, confidence_score, severity_score, severity_level, heatmap_path FROM defects WHERE inspection_id IN ({','.join(['?']*len(ids))})"
            defect_rows = conn.execute(q, ids).fetchall()
            for d in defect_rows:
                defects_map.setdefault(d["inspection_id"], []).append(dict(d))

        total_row = conn.execute(
            f"""
            SELECT COUNT(*) AS count
            FROM inspection_results ir
            LEFT JOIN users u ON ir.user_id = u.id
            {where_clause}
            """,
            params,
        ).fetchone()
        total = total_row["count"] if total_row else 0

    except sqlite3.Error:
        return error_response("database error", 500)
    finally:
        conn.close()

    results = []
    for r in rows:
        item = dict(r)
        item["defects"] = defects_map.get(r["id"], [])
        results.append(item)

    return success_response(
        {
            "total": total,
            "limit": limit,
            "offset": offset,
            "results": results,
        }
    )


@history_bp.route("/<int:inspection_id>", methods=["GET"])
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

    except sqlite3.Error:
        return error_response("database error", 500)
    finally:
        conn.close()

    if not row:
        return error_response("inspection not found", 404)

    if user["role"] == "quality_inspector" and row["user_id"] != user["id"]:
        return error_response("forbidden", 403)

    # include defects and quality_decision detail
    try:
        defect_rows = conn.execute(
            "SELECT defect_type, size_score, location_score, type_score, confidence_score, severity_score, severity_level, heatmap_path FROM defects WHERE inspection_id = ?",
            (row["id"],),
        ).fetchall()
        qrow = conn.execute(
            "SELECT decision, recommended_action, decided_at FROM quality_decisions WHERE inspection_id = ?",
            (row["id"],),
        ).fetchone()
    except sqlite3.Error:
        return error_response("database error", 500)
    finally:
        conn.close()

    result = dict(row)
    result["defects"] = [dict(d) for d in defect_rows] if defect_rows else []
    result["quality_decision_detail"] = dict(qrow) if qrow else None

    return success_response(result)