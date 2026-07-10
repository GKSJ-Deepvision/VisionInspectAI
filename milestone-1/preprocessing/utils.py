import os
import cv2

VALID_EXTENSIONS = (".png", ".jpg", ".jpeg", ".bmp")


def get_image_paths(dataset_path):
    """
    Returns all image paths except ground truth masks.
    """
    image_paths = []

    for root, dirs, files in os.walk(dataset_path):

        if "ground_truth" in root:
            continue

        for file in files:
            if file.lower().endswith(VALID_EXTENSIONS):
                image_paths.append(os.path.join(root, file))

    return sorted(image_paths)


def read_image(path):
    """
    Reads an image safely.
    """
    image = cv2.imread(path)

    if image is None:
        raise ValueError(f"Cannot read image: {path}")

    return image


def create_output_path(input_path, dataset_root, output_root):
    """
    Creates the same folder structure inside the output folder.
    """

    relative_path = os.path.relpath(input_path, dataset_root)

    output_path = os.path.join(output_root, relative_path)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    return output_path