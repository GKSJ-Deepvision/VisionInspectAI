from pathlib import Path
import os
import cv2

from config import (
    DATASET_ROOT,
    PROCESSED_DATASET_ROOT,
    IMAGE_EXTENSIONS,
    IMAGE_SIZE,
    COLOR_SPACE,
    LINE,
)

def validate_dataset():

    if not DATASET_ROOT.exists():
        raise FileNotFoundError(
            f"Dataset folder not found:\n{DATASET_ROOT}"
        )

    categories = [
        folder
        for folder in DATASET_ROOT.iterdir()
        if folder.is_dir()
    ]

    if not categories:
        raise ValueError("Dataset folder is empty.")

    print(LINE)
    print("Dataset validation completed successfully.")
    print(f"Categories Found : {len(categories)}")
    print(LINE)

def get_image_files(folder: Path):

    if not folder.exists():
        return []

    return sorted(
        file
        for file in folder.iterdir()
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    )

def create_output_folders(category):

    source = DATASET_ROOT / category
    destination = PROCESSED_DATASET_ROOT / category

    for root, _, _ in os.walk(source):

        root = Path(root)

        relative_path = root.relative_to(source)

        (destination / relative_path).mkdir(
            parents=True,
            exist_ok=True,
        )

    return destination
def preprocess_image(image_path, output_path):

    image = cv2.imread(str(image_path))

    if image is None:
        print(f"Skipped corrupted image : {image_path}")
        return False

    image = cv2.resize(
        image,
        IMAGE_SIZE,
        interpolation=cv2.INTER_AREA,
    )

    cv2.imwrite(
        str(output_path),
        image,
    )

    return True
def preprocess_mask(mask_path, output_path):

    mask = cv2.imread(
        str(mask_path),
        cv2.IMREAD_GRAYSCALE,
    )

    if mask is None:
        print(f"Skipped corrupted mask : {mask_path}")
        return False

    mask = cv2.resize(
        mask,
        IMAGE_SIZE,
        interpolation=cv2.INTER_NEAREST,
    )

    cv2.imwrite(
        str(output_path),
        mask,
    )

    return True
def process_category(category):

    print(f"Processing : {category}")

    source = DATASET_ROOT / category
    destination = create_output_folders(category)

    for root, _, _ in os.walk(source):

        root = Path(root)

        relative_path = root.relative_to(source)
        output_folder = destination / relative_path

        is_mask_folder = "ground_truth" in root.parts

        image_files = get_image_files(root)

        for image_path in image_files:

            output_path = output_folder / image_path.name

            if is_mask_folder:
                preprocess_mask(
                    image_path,
                    output_path,
                )
            else:
                preprocess_image(
                    image_path,
                    output_path,
                )
def main():

    validate_dataset()

    categories = sorted(
        folder.name
        for folder in DATASET_ROOT.iterdir()
        if folder.is_dir()
    )

    print("\nStarting preprocessing...\n")

    for category in categories:

        try:
            process_category(category)

        except Exception as e:
            print(f"Failed : {category}")
            print(e)

    print("\n" + LINE)
    print("Dataset preprocessing completed successfully.")
if __name__ == "__main__":
    main()