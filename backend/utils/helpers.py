import os
from pathlib import Path
from datetime import datetime


def ensure_directory(path: str | Path) -> Path:
    """Create directory if it doesn't exist"""
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.utcnow().isoformat()


def clean_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    filename = os.path.basename(filename)
    # Remove any non-alphanumeric characters except dots, hyphens, underscores
    safe_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-')
    return ''.join(c if c in safe_chars else '_' for c in filename)


def format_file_size(bytes_size: int) -> str:
    """Convert bytes to human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"
