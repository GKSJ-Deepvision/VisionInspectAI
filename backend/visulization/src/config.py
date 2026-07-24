from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# Dataset
DATASET_PATH = PROJECT_ROOT / "dataset"

# Output folder
OUTPUT_DIR = PROJECT_ROOT / "backend" / "inspection_plots"

# Image preprocessing
IMAGE_SIZE = (256, 256)
USE_CLAHE = True
USE_DENOISING = False

# Visualization
FIGURE_DPI = 300

# Edge Detection
CANNY_LOW_THRESHOLD = 100
CANNY_HIGH_THRESHOLD = 200

# LBP
LBP_RADIUS = 1
LBP_POINTS = 8

# Color Histogram
HISTOGRAM_BINS = 32