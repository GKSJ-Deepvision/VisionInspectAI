import sqlite3

import csv
import io
import sqlite3

from flask import Blueprint, request, Response

try:
    from ..database_utils import get_db_connection
    from .auth import require_role
    from .utils import error_response, success_response
except ImportError:  # pragma: no cover - pytest imports routes as top-level modules
    from database_utils import get_db_connection
    from routes.auth import require_role
    from routes.utils import error_response, success_response

analytics_bp = Blueprint("analytics", __name__)


def _build_where_clause(user, extra_filters=None):
    filters = []
    params = []
    if user["role"] == "quality_inspector":
        filters.append("user_id = ?")
        params.append(user["id"])

    if extra_filters:
        filters.extend(extra_filters)

    where_clause = f" WHERE {' AND '.join(filters)}" if filters else ""
    return where_clause, params


@analytics_bp.route("", methods=["GET"])
def analytics():
    user, error_response_payload, status_code = require_role("quality_inspector", "factory_supervisor")

    if error_response_payload:
        return error_response_payload, status_code

    where_clause, params = _build_where_clause(user)

    conn = get_db_connection()
    try:
        stats = conn.execute(
            f"""
            SELECT
                COUNT(*) as total_inspections,
                AVG(anomaly_score) as average_score,
                MAX(anomaly_score) as max_score,
                MIN(anomaly_score) as min_score
            FROM inspection_results{where_clause}
            """,
            params,
        ).fetchone()

        status_breakdown = conn.execute(
            f"""
            SELECT status, COUNT(*) as count
            FROM inspection_results{where_clause}
            GROUP BY status
            ORDER BY count DESC
            """,
            params,
        ).fetchall()

        category_where, category_params = _build_where_clause(
            user,
            ["category IS NOT NULL AND category != ''"],
        )
        category_breakdown = conn.execute(
            f"""
            SELECT category, COUNT(*) as count
            FROM inspection_results{category_where}
            GROUP BY category
            ORDER BY count DESC
            """,
            category_params,
        ).fetchall()

        # Category-wise anomaly statistics (avg, max, min)
        category_stats = conn.execute(
            f"""
            SELECT category,
                   AVG(anomaly_score) as avg_score,
                   MAX(anomaly_score) as max_score,
                   MIN(anomaly_score) as min_score,
                   COUNT(*) as count
            FROM inspection_results{category_where}
            GROUP BY category
            ORDER BY count DESC
            """,
            category_params,
        ).fetchall()

        severity_where, severity_params = _build_where_clause(
            user,
            ["severity_level IS NOT NULL AND severity_level != ''"],
        )
        severity_breakdown = conn.execute(
            f"""
            SELECT severity_level, COUNT(*) as count
            FROM inspection_results{severity_where}
            GROUP BY severity_level
            ORDER BY count DESC
            """,
            severity_params,
        ).fetchall()

        quality_where, quality_params = _build_where_clause(
            user,
            ["quality_decision IS NOT NULL AND quality_decision != ''"],
        )
        quality_breakdown = conn.execute(
            f"""
            SELECT quality_decision, COUNT(*) as count
            FROM inspection_results{quality_where}
            GROUP BY quality_decision
            ORDER BY count DESC
            """,
            quality_params,
        ).fetchall()
    finally:
        conn.close()

    normal_count = sum(1 for row in status_breakdown if row["status"] == "Normal")
    defective_count = sum(1 for row in status_breakdown if row["status"] == "Defective")

    return success_response({
        "summary": {
            "total_inspections": stats["total_inspections"] or 0,
            "normal_count": normal_count,
            "defective_count": defective_count,
            "average_score": round(stats["average_score"] or 0.0, 2),
            "max_score": round(stats["max_score"] or 0.0, 2),
            "min_score": round(stats["min_score"] or 0.0, 2),
        },
        "by_status": [dict(row) for row in status_breakdown],
        "by_category": [dict(row) for row in category_breakdown],
        "category_stats": [dict(row) for row in category_stats],
        "by_severity": [dict(row) for row in severity_breakdown],
        "severity_stats": [dict(row) for row in severity_breakdown],
        "by_quality_decision": [dict(row) for row in quality_breakdown],
    })


@analytics_bp.route("/by-status", methods=["GET"])
def analytics_by_status():
    user, error_response_payload, status_code = require_role("quality_inspector", "factory_supervisor")

    if error_response_payload:
        return error_response_payload, status_code

    where_clause, params = _build_where_clause(user)

    conn = get_db_connection()
    try:
        stats = conn.execute(
            f"""
            SELECT status, COUNT(*) as count
            FROM inspection_results{where_clause}
            GROUP BY status
            ORDER BY count DESC
            """,
            params,
        ).fetchall()
    finally:
        conn.close()

    return success_response({"by_status": [dict(row) for row in stats]})


@analytics_bp.route("/reports", methods=["GET"])
def reports():
    user, error_response_payload, status_code = require_role("factory_supervisor")

    if error_response_payload:
        return error_response_payload, status_code

    conn = get_db_connection()
    try:
        rows = conn.execute(
            """
            SELECT
                id,
                report_date,
                total_inspections,
                total_defects,
                pass_count,
                fail_count,
                rework_count,
                generated_at
            FROM reports
            ORDER BY generated_at DESC
            """
        ).fetchall()

        if not rows:
            rows = conn.execute(
                """
                SELECT
                    DATE(COALESCE(i.completed_at, ir.created_at, i.uploaded_at)) AS report_date,
                    COUNT(*) AS total_inspections,
                    SUM(CASE WHEN ir.is_defective = 1 THEN 1 ELSE 0 END) AS total_defects,
                    SUM(CASE WHEN ir.inspection_passed = 1 THEN 1 ELSE 0 END) AS pass_count,
                    SUM(CASE WHEN ir.inspection_passed = 0 THEN 1 ELSE 0 END) AS fail_count,
                    0 AS rework_count,
                    MAX(ir.created_at) AS generated_at
                FROM inspection_results ir
                LEFT JOIN inspections i ON ir.inspection_id = i.id
                GROUP BY report_date
                ORDER BY generated_at DESC
                """
            ).fetchall()
    finally:
        conn.close()

    return success_response({"records": [dict(row) for row in rows]})


@analytics_bp.route("/export", methods=["GET"])
def export_reports():
    user, error_response_payload, status_code = require_role("factory_supervisor")

    if error_response_payload:
        return error_response_payload, status_code

    status_filter = (request.args.get("status") or "").strip()
    category_filter = (request.args.get("category") or "").strip()
    date_from = (request.args.get("date_from") or "").strip()
    date_to = (request.args.get("date_to") or "").strip()
    output_format = (request.args.get("format") or "json").strip().lower()

    filters = ["1=1"]
    params = []

    if status_filter:
        filters.append("COALESCE(ir.status, i.status, ir.result_summary) = ?")
        params.append(status_filter)

    if category_filter:
        filters.append("COALESCE(ir.category, i.category, ir.category) = ?")
        params.append(category_filter)

    if date_from:
        filters.append("ir.created_at >= ?")
        params.append(date_from)

    if date_to:
        filters.append("ir.created_at <= ?")
        params.append(date_to)

    where_clause = f" WHERE {' AND '.join(filters)}"

    sql = f"""
    SELECT
        ir.id,
        ir.inspection_id,
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
        ir.result_summary,
        ir.created_at
    FROM inspection_results ir
    LEFT JOIN users u ON ir.user_id = u.id
    LEFT JOIN inspections i ON ir.inspection_id = i.id
    {where_clause}
    ORDER BY ir.created_at DESC
    """

    conn = get_db_connection()
    try:
        rows = conn.execute(sql, params).fetchall()
    except sqlite3.Error:
        conn.close()
        return error_response("database error", 500)
    finally:
        conn.close()

    records = [dict(row) for row in rows]

    if output_format == "csv":
        output = io.StringIO()
        fieldnames = [
            "id",
            "inspection_id",
            "user_id",
            "username",
            "email",
            "filename",
            "category",
            "status",
            "anomaly_score",
            "defect",
            "confidence",
            "severity_score",
            "severity_level",
            "quality_decision",
            "recommended_action",
            "heatmap_url",
            "inspection_status",
            "inspection_passed",
            "result_summary",
            "created_at",
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for record in records:
            writer.writerow({k: record.get(k) for k in fieldnames})
        return Response(output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=inspection_reports.csv"})

    return success_response({"records": records})