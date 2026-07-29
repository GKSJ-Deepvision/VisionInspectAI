import os
import cv2
import numpy as np

# Dataset generated after preprocessing
from backend.config import (
    PROCESSED_DATASET_PATH,
    AUGMENTED_DATASET_PATH
)

INPUT_PATH = PROCESSED_DATASET_PATH
OUTPUT_PATH = AUGMENTED_DATASET_PATH

os.makedirs(OUTPUT_PATH, exist_ok=True)

def horizontal_flip(image):
    """
    Flip image horizontally.
    """
    return cv2.flip(image, 1)


def rotate_image(image, angle=10):
    """
    Rotate image slightly.
    """

    height, width = image.shape[:2]

    center = (width // 2, height // 2)

    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)

    return cv2.warpAffine(image, matrix, (width, height))


def adjust_brightness(image, alpha=1.1, beta=15):
    """
    Increase brightness slightly.
    """

    return cv2.convertScaleAbs(image, alpha=alpha, beta=beta)


def adjust_contrast(image, alpha=1.25):
    """
    Improve image contrast.
    """

    return cv2.convertScaleAbs(image, alpha=alpha, beta=0)

def save_image(image, output_path):
    """
    Save augmented image.
    """

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    cv2.imwrite(output_path, image)

def augment_single_image(image_path, output_folder):
    """
    Generate augmented versions of one image.
    """

    image = cv2.imread(image_path)

    if image is None:
        print(f"Skipping {image_path}")
        return 0

    filename = os.path.splitext(os.path.basename(image_path))[0]

    count = 0

    # Horizontal Flip
    save_image(
        horizontal_flip(image),
        os.path.join(output_folder, f"{filename}_flip.png")
    )
    count += 1

    # Rotate +10°
    save_image(
        rotate_image(image, 10),
        os.path.join(output_folder, f"{filename}_rot10.png")
    )
    count += 1

    # Rotate -10°
    save_image(
        rotate_image(image, -10),
        os.path.join(output_folder, f"{filename}_rot_minus10.png")
    )
    count += 1

    # Brightness
    save_image(
        adjust_brightness(image),
        os.path.join(output_folder, f"{filename}_bright.png")
    )
    count += 1

    # Contrast
    save_image(
        adjust_contrast(image),
        os.path.join(output_folder, f"{filename}_contrast.png")
    )
    count += 1

    return count

def process_folder(input_folder, output_folder):
    """
    Process all images inside one folder.
    """

    total = 0

    os.makedirs(output_folder, exist_ok=True)

    for filename in os.listdir(input_folder):

        file_path = os.path.join(input_folder, filename)

        if not os.path.isfile(file_path):
            continue

        total += augment_single_image(
            file_path,
            output_folder
        )

    return total

def process_category(category_name):
    """
    Process one complete MVTec category.
    """

    category_input = os.path.join(INPUT_PATH, category_name)

    category_output = os.path.join(OUTPUT_PATH, category_name)

    total = 0

    print(f"\nProcessing Category: {category_name}")

    for split in ["train", "test"]:

        split_input = os.path.join(category_input, split)

        split_output = os.path.join(category_output, split)

        if not os.path.exists(split_input):
            continue

        for root, _, _ in os.walk(split_input):

            relative_path = os.path.relpath(root, split_input)

            output_root = os.path.join(split_output, relative_path)

            total += process_folder(root, output_root)

    print(f"Generated {total} augmented images.")

    return total

if __name__ == "__main__":

    print("=" * 60)
    print("VisionInspect AI - Image Augmentation Started")
    print("=" * 60)

    grand_total = 0

    categories = sorted(os.listdir(INPUT_PATH))

    for category in categories:

        category_path = os.path.join(INPUT_PATH, category)

        if os.path.isdir(category_path):
            grand_total += process_category(category)

    print("\n" + "=" * 60)
    print("Image Augmentation Completed Successfully!")
    print(f"Total Images Generated : {grand_total}")
    print("=" * 60)