import os
import sqlite3
from pathlib import Path
from PIL import Image
import numpy as np


def run_inference(filename: str, user_id: int = None) -> dict:
    """
    Run PatchCore inference on uploaded image
    
    Args:
        filename: Name of the uploaded file
        user_id: ID of the user running inference
        
    Returns:
        Dictionary with inference results including status and anomaly score
    """
    try:
        upload_dir = os.path.join(Path(__file__).resolve().parents[1], "uploads")
        image_path = os.path.join(upload_dir, filename)
        
        if not os.path.exists(image_path):
            return {
                "filename": filename,
                "status": "error",
                "score": 0.0,
                "error": "file not found"
            }
        
        # Load and preprocess image
        image = Image.open(image_path)
        image_array = np.array(image)
        
        # Placeholder for actual PatchCore inference
        # TODO: Integrate actual PatchCore model
        anomaly_score = compute_anomaly_score(image_array)
        
        return {
            "filename": filename,
            "status": "completed",
            "score": round(anomaly_score, 4),
            "user_id": user_id
        }
    except Exception as e:
        return {
            "filename": filename,
            "status": "error",
            "score": 0.0,
            "error": str(e)
        }


def compute_anomaly_score(image_array: np.ndarray) -> float:
    """
    Compute anomaly score for image
    Placeholder for actual PatchCore scoring logic
    
    Args:
        image_array: Numpy array of the image
        
    Returns:
        Anomaly score between 0.0 and 1.0
    """
    # TODO: Replace with actual PatchCore model inference
    # For now, return a dummy score based on image statistics
    return float(np.mean(image_array) / 255.0)


def update_inspection_result(inspection_id: int, status: str, score: float, db_path: str = None):
    """
    Update inspection result with inference output
    
    Args:
        inspection_id: ID of the inspection record
        status: Status of the inspection (completed, error, etc.)
        score: Anomaly score
        db_path: Path to database
    """
    if not db_path:
        db_path = os.path.join(Path(__file__).resolve().parents[2], "instance", "backend.db")
    
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE inspection_results SET status = ?, score = ? WHERE id = ?",
            (status, score, inspection_id)
        )
        conn.commit()
    finally:
        conn.close()
