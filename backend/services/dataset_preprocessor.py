import os
import cv2
import numpy as np

# Dataset location
from backend.config import (
    DATASET_PATH,
    PROCESSED_DATASET_PATH
)

OUTPUT_PATH = PROCESSED_DATASET_PATH
os.makedirs(OUTPUT_PATH, exist_ok=True)

def preprocess_image(image):
    """
    Preprocess one image.
    """

    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Remove small noise
    image = cv2.GaussianBlur(image, (3, 3), 0)

    # Convert to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)

    l, a, b = cv2.split(lab)

    # Contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l = clahe.apply(l)

    lab = cv2.merge((l, a, b))

    image = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

    # Sharpen
    kernel = np.array([
        [0,-1,0],
        [-1,5,-1],
        [0,-1,0]
    ])

    image = cv2.filter2D(image, -1, kernel)

    return image

def process_folder(input_folder, output_folder):
    """
    Process every image inside one folder.
    """

    os.makedirs(output_folder, exist_ok=True)

    processed_count = 0

    for filename in os.listdir(input_folder):

        file_path = os.path.join(input_folder, filename)

        if not os.path.isfile(file_path):
            continue

        # Read image
        image = cv2.imread(file_path)

        if image is None:
            print(f"Skipping {file_path}")
            continue

        # Preprocess image
        processed_image = preprocess_image(image)

        # Save processed image
        output_path = os.path.join(output_folder, filename)

        cv2.imwrite(output_path, cv2.cvtColor(processed_image, cv2.COLOR_RGB2BGR))

        processed_count += 1

    return processed_count

def process_category(category_name):

    category_path = os.path.join(DATASET_PATH, category_name)

    output_category = os.path.join(OUTPUT_PATH, category_name)

    total_processed = 0

    print(f"\nProcessing Category: {category_name}")

    for split in ["train", "test"]:

        split_path = os.path.join(category_path, split)

        output_split = os.path.join(output_category, split)

        if not os.path.exists(split_path):
            continue

        for root, dirs, files in os.walk(split_path):

            relative_path = os.path.relpath(root, split_path)

            output_root = os.path.join(output_split, relative_path)

            count = process_folder(root, output_root)

            total_processed += count

    print(f"Processed {total_processed} images.")

    return total_processed

def process_dataset():
    """
    Process the complete MVTec AD dataset.
    """

    print("=" * 60)
    print("VisionInspect AI - Dataset Preprocessing Started")
    print("=" * 60)

    total_images = 0

    # Get all category folders
    categories = sorted(os.listdir(DATASET_PATH))

    for category in categories:

        category_path = os.path.join(DATASET_PATH, category)

        # Skip files like license.txt and readme.txt
        if not os.path.isdir(category_path):
            continue

        count = process_category(category)

        total_images += count

    print("\n" + "=" * 60)
    print("Dataset Preprocessing Completed Successfully!")
    print(f"Total Images Processed : {total_images}")
    print("=" * 60)

if __name__ == "__main__":
    process_dataset()