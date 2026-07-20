import os
from pathlib import Path
import torch

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Default MVTec dataset directory
# We check if the dataset folder exists in the internship folder first.
DEFAULT_DATASET_DIR = Path("E:/Infosys Internship - 2 months/mvtec_anomaly_detection")

# If running elsewhere or if configured, allow environment variable override
DATASET_DIR = Path(os.getenv("MVTEC_DATASET_DIR", str(DEFAULT_DATASET_DIR)))

# Anomaly Detection Configurations
CATEGORY = os.getenv("MVTEC_CATEGORY", "bottle")  # default category

# Model Configurations
IMAGE_SIZE = (128, 128)  # Height, Width (downscaled from original for faster local training)
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

# Default threshold for anomaly score (to be calibrated during training validation)
ANOMALY_THRESHOLD = 0.05

# Calibrated 3-Sigma SSIM Hybrid Thresholds across all 15 MVTec AD Categories
CATEGORY_THRESHOLDS = {
    "bottle": 0.195095,
    "cable": 0.192328,
    "capsule": 0.111777,
    "carpet": 0.117227,
    "grid": 0.072851,
    "hazelnut": 0.129920,
    "leather": 0.124406,
    "metal_nut": 0.200536,
    "pill": 0.125741,
    "screw": 0.103276,
    "tile": 0.169546,
    "toothbrush": 0.245510,
    "transistor": 0.137502,
    "wood": 0.166859,
    "zipper": 0.188865
}
