import os

from backend.config import DATASET_PATH


def load_dataset_categories():
    """
    Returns all dataset categories present inside Dataset/.
    """

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset folder not found at: {DATASET_PATH}"
        )

    categories = sorted([
        folder
        for folder in os.listdir(DATASET_PATH)
        if os.path.isdir(os.path.join(DATASET_PATH, folder))
    ])

    return categories


def count_dataset_images():
    """
    Counts all images present in the dataset.
    """

    total_images = 0

    valid_extensions = (
        ".png",
        ".jpg",
        ".jpeg",
        ".bmp",
        ".tif",
        ".tiff",
        ".webp"
    )

    for root, _, files in os.walk(DATASET_PATH):

        total_images += len([
            file
            for file in files
            if file.lower().endswith(valid_extensions)
        ])

    return total_images