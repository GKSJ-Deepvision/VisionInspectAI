from pathlib import Path

import cv2
from src.preprocessing import preprocess_image
from src.visualization import show_image

def get_defect_types(dataset_path, category):
    """
    Return all defect types available for a category.
    """
    test_folder = Path(dataset_path) / category / "test"

    if not test_folder.exists():
        raise FileNotFoundError(f"{test_folder} not found.")

    return [
        folder.name
        for folder in sorted(test_folder.iterdir())
        if folder.is_dir()
    ]

def display_defect_types(dataset_path, category):
    """
    Display all defect types available for a category.
    """
    print(f"\n{category.upper()} DEFECT TYPES")
    print("-" * 30)

    for defect in get_defect_types(dataset_path, category):
        print(defect)

def show_sample_image(dataset_path, category, defect_type="good"):
    """
    Display one sample test image.
    """
    image_folder = (
        Path(dataset_path)
        / category
        / "test"
        / defect_type
    )
    image_files = sorted(image_folder.glob("*.png"))

    if not image_files:
        print(f"No images found in {image_folder}")
        return

    image = preprocess_image(image_files[0])

    show_image(image, f"{category} - {defect_type}")

def show_ground_truth(dataset_path, category, defect_type):
    """
    Display one ground truth mask for a defect.
    """
    mask_folder = (
        Path(dataset_path)
        / category
        / "ground_truth"
        / defect_type
    )
    mask_files = sorted(mask_folder.glob("*.png"))

    if not mask_files:
        print(f"No ground truth found for '{defect_type}'")
        return

    mask = cv2.imread(str(mask_files[0]), cv2.IMREAD_GRAYSCALE)

    show_image(mask, f"{category} - Ground Truth ({defect_type})")

def get_image_shape(dataset_path, category):
    """
    Return the original image shape.
    """
    image_folder = (
        Path(dataset_path)
        / category
        / "train"
        / "good"
    )
    image_files = sorted(image_folder.glob("*.png"))

    if not image_files:
        return None

    image = cv2.imread(str(image_files[0]))

    return image.shape