from pathlib import Path

from PIL import Image

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tif",
    ".tiff",
}


def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def validate_image(image_path: str) -> None:
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError("Image file not found.")

    if not allowed_file(path.name):
        raise ValueError("Unsupported image format.")

    try:
        with Image.open(path) as img:
            img.verify()
    except Exception:
        raise ValueError("Image is corrupted or unreadable.")


def preprocess_image(image_path: str) -> str:
    validate_image(image_path)
    return str(Path(image_path).resolve())