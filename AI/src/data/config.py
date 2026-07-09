from pathlib import Path

# Project Paths

# VisionInspect-AI/ai
AI_ROOT = Path(__file__).resolve().parents[2]

# VisionInspect-AI
PROJECT_ROOT = AI_ROOT.parent

# Dataset
DATASET_ROOT = AI_ROOT / "dataset"
PROCESSED_DATASET_ROOT = AI_ROOT / "processed_dataset"

# Output Directories
OUTPUT_ROOT = AI_ROOT / "outputs"

MODELS_DIR = OUTPUT_ROOT / "models"
PREDICTIONS_DIR = OUTPUT_ROOT / "predictions"

# Dataset Configuration
IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
}

# Image Configuration
IMAGE_SIZE = (256, 256)

# Model Configuration
MODEL_NAME = "PatchCore"
RANDOM_SEED = 42

# PatchCore Configuration

BACKBONE = "wide_resnet50_2"

FEATURE_LAYERS = [
    "layer2",
    "layer3",
]
CORESET_SAMPLING_RATIO = 0.1
NUM_NEIGHBORS = 9
PRETRAINED = True

# Training Configuration

TRAIN_CATEGORY = "bottle"
TRAIN_BATCH_SIZE = 64
EVAL_BATCH_SIZE = 64
NUM_WORKERS = 6
MAX_EPOCHS = 1

# Model Paths
MODEL_OUTPUT_DIR = OUTPUT_ROOT / "models"
CHECKPOINT_PATH = (
    OUTPUT_ROOT
    / "Patchcore"
    / "MVTecAD"
    / TRAIN_CATEGORY
    / "latest"
    / "weights"
    / "lightning"
    / "model.ckpt"
)

# Console Formatting
LINE = "=" * 80
SUBLINE = "-" * 80

# Create Required Directories
PROCESSED_DATASET_ROOT.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)
