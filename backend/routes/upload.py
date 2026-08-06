import os
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from .auth import get_current_user

upload_bp = Blueprint("upload", __name__)


def allowed_file(filename):
    allowed_extensions = current_app.config.get(
        "ALLOWED_EXTENSIONS",
        {"jpg", "jpeg", "png", "bmp", "tif", "tiff", "webp"},
    )
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in allowed_extensions
    )


@upload_bp.route("", methods=["POST"])
def upload_file():
    user = get_current_user()

    if not user:
        return jsonify({"error": "unauthorized"}), 401

    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({"error": "file is required"}), 400

    if not allowed_file(uploaded_file.filename):
        return jsonify({"error": "Unsupported image format"}), 400

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

    return jsonify(
        {
            "message": "uploaded",
            "filename": filename,
            "path": save_path,
            "user_id": user["id"],
        }
    ), 201