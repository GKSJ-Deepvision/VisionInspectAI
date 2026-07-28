from fastapi import APIRouter
import os

from backend.services.image_augmentation import process_category

router = APIRouter()


@router.post("/augment")
def augment_dataset():

    from backend.config import PROCESSED_DATASET_PATH

    INPUT_PATH = PROCESSED_DATASET_PATH

    if not os.path.exists(INPUT_PATH):
        return {
            "message": "Processed dataset not found."
        }

    total_images = 0

    categories = sorted(os.listdir(INPUT_PATH))

    for category in categories:

        category_path = os.path.join(INPUT_PATH, category)

        if os.path.isdir(category_path):
            total_images += process_category(category)

    return {
        "message": "Dataset augmentation completed successfully.",
        "categories_processed": len(categories),
        "augmented_images": total_images
    }