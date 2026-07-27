from fastapi import APIRouter

from backend.services.dataset_loader import (
    load_dataset_categories,
    count_dataset_images,
)

router = APIRouter()


@router.get("/dataset")
def load_dataset():
    """
    Returns dataset information.
    """

    try:
        categories = load_dataset_categories()

        return {
            "total_categories": len(categories),
            "total_images": count_dataset_images(),
            "categories": categories,
        }

    except FileNotFoundError as e:
        return {
            "message": str(e),
            "categories": [],
        }