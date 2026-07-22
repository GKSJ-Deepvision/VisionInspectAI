import os
from pathlib import Path
import torch

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Default MVTec dataset directory
DEFAULT_DATASET_DIR = Path("E:/Infosys Internship - 2 months/mvtec_anomaly_detection")

# If running elsewhere or if configured, allow environment variable override
DATASET_DIR = Path(os.getenv("MVTEC_DATASET_DIR", str(DEFAULT_DATASET_DIR)))

# Anomaly Detection Configurations
CATEGORY = os.getenv("MVTEC_CATEGORY", "bottle")  # default category

# ── Model Configurations ────────────────────────────────────────────────────
# Autoencoder expects 128x128 RGB input
IMAGE_SIZE = (128, 128)   # (Height, Width)
BATCH_SIZE = 16
LEARNING_RATE = 1e-3
NUM_EPOCHS = 15
DEVICE = "cuda" if (torch.cuda.is_available() and os.getenv("USE_CUDA", "True") == "True") else "cpu"

# Directory to save trained models
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / f"autoencoder_{CATEGORY}.pth"

# Logging / Output directories
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Hybrid Anomaly Thresholds (calibrated for 0.4 Mean MAE + 0.6 Top-1.5% Peak MAE) ──
# Calibrated on normal good images to guarantee high specificity (>95%) while accurately flagging defects.
CATEGORY_THRESHOLDS = {
    "bottle":     0.22000,
    "cable":      0.25000,
    "capsule":    0.23000,
    "carpet":     0.13000,
    "grid":       0.15000,
    "hazelnut":   0.09500,
    "leather":    0.04500,
    "metal_nut":  0.35000,
    "pill":       0.22000,
    "screw":      0.20000,
    "tile":       0.13500,
    "toothbrush": 0.22000,
    "transistor": 0.19000,
    "wood":       0.05500,
    "zipper":     0.24000,
}

# Dynamically load calibrated thresholds from thresholds.json if present
THRESHOLDS_JSON_PATH = BASE_DIR / "anomaly_detection" / "thresholds.json"
if THRESHOLDS_JSON_PATH.exists():
    try:
        import json
        with open(THRESHOLDS_JSON_PATH, "r", encoding="utf-8") as f:
            custom_thresholds = json.load(f)
            if isinstance(custom_thresholds, dict):
                CATEGORY_THRESHOLDS.update(custom_thresholds)
    except Exception as e:
        print(f"Warning loading thresholds.json: {e}")

# ── YOLO Configuration ──────────────────────────────────────────────────────
# Only use YOLO for categories where product is a discrete centered object
# Skip YOLO for textures (fills entire frame) or small/thin objects YOLO misidentifies
YOLO_SKIP_CATEGORIES = {
    "cable", "capsule", "carpet", "grid", "leather",
    "metal_nut", "pill", "tile", "toothbrush",
    "transistor", "wood", "zipper"
}

# Default threshold (fallback if category not in dict above)
ANOMALY_THRESHOLD = 0.050
