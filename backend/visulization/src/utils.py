from pathlib import Path

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".bmp")


def count_images(folder: Path) -> int:
    """Count image files in a folder and its subfolders."""
    if not folder.exists():
        return 0

    return sum(
        1
        for file in folder.rglob("*")
        if file.suffix.lower() in IMAGE_EXTENSIONS
    )