from pathlib import Path

from flask import Blueprint, jsonify, send_file

try:
    from ..database_utils import (
        get_db_connection,
        get_inspection_by_id,
    )
    from ..services.report_service import report_service
except ImportError:
    from database_utils import (
        get_db_connection,
        get_inspection_by_id,
    )
    from services.report_service import report_service


reports_bp = Blueprint(
    "reports",
    __name__,
)


@reports_bp.route(
    "/generate/<int:inspection_id>",
    methods=["POST"],
)
def generate_report(inspection_id):

    inspection = get_inspection_by_id(
        inspection_id
    )

    if inspection is None:

        return jsonify({

            "success": False,

            "message":
            "Inspection not found."

        }), 404

    try:

        report = report_service.generate_report(
            inspection
        )

        conn = get_db_connection()

        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO reports
            (
                inspection_id,
                report_id,
                filename,
                pdf_path
            )
            VALUES
            (?, ?, ?, ?)
            """,
            (
                inspection_id,
                report["report_id"],
                report["filename"],
                report["pdf_path"],
            ),
        )

        cur.execute(
            """
            UPDATE inspection_results
            SET
                report_generated = 1,
                report_path = ?
            WHERE inspection_id = ?
            """,
            (
                report["pdf_path"],
                inspection_id,
            ),
        )

        conn.commit()

        conn.close()

        return jsonify({

            "success": True,

            "report_id":
                report["report_id"],

            "filename":
                report["filename"],

            "download_url":
                report["download_url"],

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e),

        }), 500


@reports_bp.route(
    "/download/<filename>",
    methods=["GET"],
)
def download_report(filename):

    reports_folder = (
        Path(__file__)
        .resolve()
        .parents[1]
        / "static"
        / "reports"
    )

    pdf = reports_folder / filename

    if not pdf.exists():

        return jsonify({

            "success": False,

            "message":
            "Report not found."

        }), 404

    return send_file(

        pdf,

        as_attachment=True,

        download_name=filename,

        mimetype="application/pdf",

    )