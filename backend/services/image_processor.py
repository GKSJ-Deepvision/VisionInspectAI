import os
import cv2
import numpy as np


def preprocess_image(input_path: str, output_path: str):
    # Read image
    image = cv2.imread(input_path)

    if image is None:
        raise Exception("Unable to read image.")

    # Resize
    image = cv2.resize(image, (512, 512))

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Remove noise
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Improve contrast
    enhanced = cv2.equalizeHist(blur)

    # Save processed image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, enhanced)

    return output_path