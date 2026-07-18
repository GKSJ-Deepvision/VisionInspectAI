from pathlib import Path

IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
}

def get_categories(dataset_path):
    """
    Return all available MVTec categories.
    """
    dataset_path = Path(dataset_path)

    return sorted(
        folder.name
        for folder in dataset_path.iterdir()
        if folder.is_dir()
    )

def load_images(
    dataset_path,
    category,
    split="train",
    defect_type="good"
):
    """
    Load image paths from a specific dataset split.
    """
    image_folder = (
        Path(dataset_path)
        / category
        / split
        / defect_type
    )

    if not image_folder.exists():
        raise FileNotFoundError(
            f"{image_folder} not found."
        )

    images = sorted(
        image
        for image in image_folder.iterdir()
        if image.suffix.lower() in IMAGE_EXTENSIONS
    )

    return images

def get_defect_types(
    dataset_path,
    category
):
    """
    Return all defect folders
    inside test/.
    """
    test_folder = (
        Path(dataset_path)
        / category
        / "test"
    )

    return sorted(
        folder.name
        for folder in test_folder.iterdir()
        if folder.is_dir()
    )

def load_ground_truth_masks(
    dataset_path,
    category,
    defect_type
):
    """
    Load ground-truth mask paths
    for defective images.
    """
    mask_folder = (
        Path(dataset_path)
        / category
        / "ground_truth"
        / defect_type
    )

    if not mask_folder.exists():
        return []

    masks = sorted(
        mask
        for mask in mask_folder.iterdir()
        if mask.suffix.lower() in IMAGE_EXTENSIONS
    )

    return masks

def dataset_summary(dataset_path):
    """
    Return dataset statistics for every category.
    """
    summary = {}

    for category in get_categories(dataset_path):

        train_count = len(
            load_images(
                dataset_path,
                category,
                "train",
                "good"
            )
        )

        defects = {}

        for defect in get_defect_types(
            dataset_path,
            category
        ):

            defects[defect] = len(
                load_images(
                    dataset_path,
                    category,
                    "test",
                    defect
                )
            )

        summary[category] = {
            "train_images": train_count,
            "test_images": defects
        }

    return summary