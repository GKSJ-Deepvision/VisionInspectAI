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
# PaDiM uses ResNet18 pretrained backbone (224x224 RGB input)
IMAGE_SIZE = (224, 224)   # (Height, Width)
BATCH_SIZE = 16
DEVICE = "cuda" if (torch.cuda.is_available() and os.getenv("USE_CUDA", "True") == "True") else "cpu"

# PaDiM Architecture Settings
PADIM_BACKBONE = "resnet18"
PADIM_LAYERS = ["layer1", "layer2", "layer3"]
PADIM_DIM = 100           # Subsampled feature channels for memory efficiency
PADIM_SIGMA = 4.0          # Gaussian smoothing sigma for per-pixel anomaly maps
PADIM_EPSILON = 0.01       # Covariance matrix regularization constant

# Directory to save trained models
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / f"padim_{CATEGORY}.pth"

# Logging / Output directories
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Hybrid Anomaly Thresholds ──
CATEGORY_THRESHOLDS = {
    "bottle":     15.0,
    "cable":      18.0,
    "capsule":    16.0,
    "carpet":     12.0,
    "grid":       14.0,
    "hazelnut":   15.0,
    "leather":    12.0,
    "metal_nut":  16.0,
    "pill":       15.0,
    "screw":      14.0,
    "tile":       13.0,
    "toothbrush": 16.0,
    "transistor": 15.0,
    "wood":       12.0,
    "zipper":     15.0,
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
YOLO_SKIP_CATEGORIES = {
    "cable", "capsule", "carpet", "grid", "leather",
    "metal_nut", "pill", "tile", "toothbrush",
    "transistor", "wood", "zipper"
}

# Default threshold (fallback)
ANOMALY_THRESHOLD = 15.0

