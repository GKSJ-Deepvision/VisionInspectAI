from pathlib import Path

# Project Paths


AI_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = AI_ROOT.parent

DATASET_ROOT = AI_ROOT / "dataset"
PROCESSED_DATASET_ROOT = AI_ROOT / "processed_dataset"

OUTPUT_ROOT = AI_ROOT / "outputs"

MODELS_DIR = OUTPUT_ROOT / "models"
PREDICTIONS_DIR = OUTPUT_ROOT / "predictions"
EVALUATION_DIR = OUTPUT_ROOT / "evaluation"

# Dataset Configuration

IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
}

IMAGE_SIZE = (256, 256)

CATEGORIES = [
    "bottle",
    "cable",
    "capsule",
    "carpet",
    "grid",
    "hazelnut",
    "leather",
    "metal_nut",
    "pill",
    "screw",
    "tile",
    "toothbrush",
    "transistor",
    "wood",
    "zipper",
]

# ==============================================================================
# Model Configuration
# ==============================================================================

MODEL_NAME = "PatchCore"
RANDOM_SEED = 42

BACKBONE = "wide_resnet50_2"

FEATURE_LAYERS = [
    "layer2",
    "layer3",
]

CORESET_SAMPLING_RATIO = 0.1
NUM_NEIGHBORS = 9
PRETRAINED = True

# ==============================================================================
# Training Configuration
# ==============================================================================

TRAIN_BATCH_SIZE = 64
EVAL_BATCH_SIZE = 64
NUM_WORKERS = 6
MAX_EPOCHS = 1

# ==============================================================================
# Utility Functions
# ==============================================================================

def get_checkpoint_path(category: str):
    return (
        OUTPUT_ROOT
        / "Patchcore"
        / "MVTecAD"
        / category
        / "v0"
        / "weights"
        / "lightning"
        / "model.ckpt"
    )
LINE = "=" * 80
SUBLINE = "-" * 80

PROCESSED_DATASET_ROOT.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)
EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
# ==============================================================================
# Defect Classification Configuration
# ==============================================================================

CLASSIFIER_IMAGE_SIZE = (224, 224)
CLASSIFIER_BATCH_SIZE = 32
CLASSIFIER_EPOCHS = 20
CLASSIFIER_LEARNING_RATE = 1e-4

CLASSIFIER_MODEL_NAME = "efficientnet_b0"

CLASSIFIER_MODEL_PATH = MODELS_DIR / "defect_classifier_best.pth"
CLASSIFIER_LAST_MODEL_PATH = MODELS_DIR / "defect_classifier_last.pth"

CLASSIFIER_LABELS_PATH = MODELS_DIR / "defect_labels.json"

TRAIN_SPLIT = 0.8
VALIDATION_SPLIT = 0.2
CLASSIFIER_DROPOUT = 0.30

FREEZE_BACKBONE = False

WEIGHT_DECAY = 1e-4

EARLY_STOPPING_PATIENCE = 5

LR_SCHEDULER_PATIENCE = 2