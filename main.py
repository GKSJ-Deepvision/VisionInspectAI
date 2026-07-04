from pathlib import Path

from src.dataset_info import display_dataset_info
from src.preprocessing import preprocess_image
from src.visualization import show_image

DATASET_PATH = Path("dataset")

# Define categories here (GLOBAL CONSTANT)
CATEGORIES = ["bottle", "cable", "transistor"]

def main():
    # 1. Dataset overview
    display_dataset_info(DATASET_PATH)
    # 2. Loop over categories
    for category in CATEGORIES:
        image_folder = DATASET_PATH / category / "train" / "good"

        image_files = list(image_folder.glob("*.png"))

        if not image_files:
            print(f"No images found in {image_folder}")
            continue
        image_path = image_files[0]
        # 3. Preprocess + visualize
        processed = preprocess_image(image_path)
        print(f"\nCategory: {category}")
        print(f"Shape: {processed.shape}")
        print(f"Dtype: {processed.dtype}")
        print(f"Min: {processed.min():.4f}, Max: {processed.max():.4f}")

        show_image(processed, f"{category} - Good Image")

if __name__ == "__main__":
    main()