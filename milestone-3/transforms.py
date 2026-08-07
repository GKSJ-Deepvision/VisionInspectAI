import logging
import torchvision.transforms as T
from torchvision.transforms import Compose

# Setup logger for the transforms module
logger = logging.getLogger("visioninspect-ai.transforms")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# ---------------------------------------------------------
# Define the transformations
# ---------------------------------------------------------

# Training transformation pipeline: Includes data augmentation to prevent overfitting.
train_transform: Compose = T.Compose([
    T.Resize((224, 224)),
    T.RandomHorizontalFlip(p=0.5),
    T.RandomRotation(degrees=15),
    T.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
        hue=0.1
    ),
    T.ToTensor(),
    T.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Test/Validation transformation pipeline: Only resizes and normalizes images.
test_transform: Compose = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------

def get_train_transform() -> Compose:
    """
    Returns the training transformation pipeline.
    
    Includes resizing, random horizontal flip, random rotation, color jitter,
    tensor conversion, and ImageNet normalization.

    Returns:
        Compose: The training transforms pipeline.
    """
    logger.debug("Retrieving training transforms pipeline.")
    return train_transform


def get_test_transform() -> Compose:
    """
    Returns the test/validation transformation pipeline.
    
    Includes resizing, tensor conversion, and ImageNet normalization.

    Returns:
        Compose: The test/validation transforms pipeline.
    """
    logger.debug("Retrieving test transforms pipeline.")
    return test_transform
