import os
 
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
 
try:
    from .config import (
        ALLOWED_EXTENSIONS,
        DATABASE_PATH,
        HEATMAP_FOLDER,
        MAX_CONTENT_LENGTH,
        SECRET_KEY,
        UPLOAD_FOLDER,
    )
    from .database_utils import init_db
    from .routes.analytics import analytics_bp, reports as analytics_reports, export_reports as analytics_export
    from .routes.auth import auth_bp
    from .routes.history import history_bp
    from .routes.inspection import inspection_bp
    from .routes.upload import upload_bp
except ImportError:  # pragma: no cover - pytest imports app as a top-level module
    from config import (
        ALLOWED_EXTENSIONS,
        DATABASE_PATH,
        HEATMAP_FOLDER,
        MAX_CONTENT_LENGTH,
        SECRET_KEY,
        UPLOAD_FOLDER,
    )
    from database_utils import init_db
    from routes.analytics import analytics_bp, reports as analytics_reports, export_reports as analytics_export
    from routes.auth import auth_bp
    from routes.history import history_bp
    from routes.inspection import inspection_bp
    from routes.upload import upload_bp
 
 
def create_app(test_config=None):
    app = Flask(__name__)
 
    app.config.from_mapping(
        SECRET_KEY=SECRET_KEY,
        UPLOAD_FOLDER=UPLOAD_FOLDER,
        DATABASE_PATH=DATABASE_PATH,
        HEATMAP_FOLDER=os.path.join(
        Path(__file__).resolve().parent,
        "outputs",
        "heatmaps",
        ),
        MAX_CONTENT_LENGTH=MAX_CONTENT_LENGTH,
        ALLOWED_EXTENSIONS=ALLOWED_EXTENSIONS,
        JSON_SORT_KEYS=False,
    )
 
    if test_config:
        app.config.update(test_config)
 
    app.config["DATABASE_PATH"] = os.path.abspath(app.config["DATABASE_PATH"])
 
    CORS(app)
 
    os.makedirs(os.path.dirname(app.config["DATABASE_PATH"]), exist_ok=True)
    os.makedirs(app.config["HEATMAP_FOLDER"], exist_ok=True)
    os.makedirs(HEATMAP_FOLDER, exist_ok=True)
 
    init_db(app.config["DATABASE_PATH"])
 
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(inspection_bp, url_prefix="/api/inspection")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(history_bp, url_prefix="/api/history")
 
    try:
        from .routes.dataset import dataset_bp
 
        app.register_blueprint(dataset_bp, url_prefix="/api/dataset")
    except ImportError:
        pass
 
    @app.route("/")
    def health_check():
        return jsonify(
            {
                "status": "ok",
                "application": "VisionInspect-AI",
                "version": "1.0.0",
                "message": "Backend is running successfully.",
            }
        )
 
    @app.route("/outputs/heatmaps/<path:filename>")
    def serve_heatmap(filename):
        return send_from_directory(
        app.config["HEATMAP_FOLDER"],
        filename,
        )
 
    @app.route("/api/reports", methods=["GET"])
    def reports_route():
        return analytics_reports()
 
    @app.route("/api/reports/export", methods=["GET"])
    def reports_export_route():
        return analytics_export()
 
    return app
 
 
app = create_app()
 
 
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)