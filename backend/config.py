import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "tif",
    "tiff",
    "webp",
}

SECRET_KEY = os.environ.get("SECRET_KEY", "visioninspect_dev_secret_key_2026")
UPLOAD_FOLDER = os.environ.get(
    "UPLOAD_FOLDER",
    str((BASE_DIR / "uploads").resolve()),
)
DATABASE_PATH = os.environ.get(
    "DATABASE_PATH",
    str((BASE_DIR / "instance" / "backend.db").resolve()),
)
HEATMAP_FOLDER = os.environ.get(
    "HEATMAP_FOLDER",
    str((BASE_DIR / "outputs" / "heatmaps").resolve()),
)
MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))
