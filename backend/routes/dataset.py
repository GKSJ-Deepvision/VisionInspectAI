from fastapi import APIRouter
import os

router = APIRouter()

DATASET_PATH = "dataset"


@router.get("/dataset")
def load_dataset():

    if not os.path.exists(DATASET_PATH):
        return {
            "message": "Dataset folder not found.",
            "categories": []
        }

    categories = []

    for folder in os.listdir(DATASET_PATH):
        path = os.path.join(DATASET_PATH, folder)

        if os.path.isdir(path):
            categories.append(folder)

    return {
        "total_categories": len(categories),
        "categories": categories
    }