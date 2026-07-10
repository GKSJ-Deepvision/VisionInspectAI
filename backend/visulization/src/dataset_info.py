from pathlib import Path
from src.utils import count_images

def display_dataset_info(dataset_path):
    """
    Display the number of train, test, and ground truth images
    for each category in the dataset.
    """
    dataset = Path(dataset_path)
    for category in dataset.iterdir():
        if category.is_dir():

            print("=" * 50)
            print(category.name.upper())

            train = count_images(category / "train")
            test = count_images(category / "test")
            ground_truth = count_images(category / "ground_truth")
            print(f"Train Images       : {train}")
            print(f"Test Images        : {test}")
            print(f"Ground Truth Masks : {ground_truth}")