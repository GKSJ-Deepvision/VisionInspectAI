from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np
from flask import current_app

NORMAL_DISPLAY_GATE = 0.55


def _get_heatmap_output_dir() -> Path:
    folder = current_app.config.get("HEATMAP_FOLDER")

    if not folder:
        from config import HEATMAP_FOLDER as folder

    output_dir = Path(folder)
    output_dir.mkdir(parents=True, exist_ok=True)

    return output_dir


def generate_heatmap(
    image_path: str,
    anomaly_map: np.ndarray,
    status: str,
    anomaly_score: float,
) -> str:

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to load original image.")

    h, w = image.shape[:2]

    filename = f"{uuid4().hex}_{Path(image_path).stem}.png"
    output_path = _get_heatmap_output_dir() / filename


    if status.lower() == "normal" or anomaly_score < NORMAL_DISPLAY_GATE:
        cv2.imwrite(str(output_path), image)
        return str(output_path)

 
    anomaly_map = anomaly_map.astype(np.float32)
    anomaly_map = cv2.GaussianBlur(anomaly_map, (31, 31), 10)

    low = np.percentile(anomaly_map, 2)
    high = np.percentile(anomaly_map, 99.5)

    anomaly_map = np.clip(anomaly_map, low, high)
    anomaly_map = (anomaly_map - low) / (high - low + 1e-8)
    anomaly_map = np.clip(anomaly_map, 0, 1)

    anomaly_map = anomaly_map ** 1.35
    anomaly_map[anomaly_map < 0.45] = 0  # drop weak/background activation
    anomaly_map = cv2.GaussianBlur(anomaly_map, (21, 21), 4)

    anomaly_map = cv2.resize(anomaly_map, (w, h), interpolation=cv2.INTER_LINEAR)
    anomaly_map = np.clip(anomaly_map, 0, 1)

    
    confidence = float(np.clip(anomaly_score, 0.0, 1.0))
    anomaly_map *= confidence

    anomaly_uint8 = (anomaly_map * 255).astype(np.uint8)
    heatmap = cv2.applyColorMap(anomaly_uint8, cv2.COLORMAP_TURBO)

    
    alpha = (anomaly_map[..., None] * 0.55).astype(np.float32)
    overlay = (image.astype(np.float32) * (1 - alpha) + heatmap.astype(np.float32) * alpha)
    overlay = overlay.astype(np.uint8)

    cv2.imwrite(str(output_path), overlay)

    return str(output_path)
