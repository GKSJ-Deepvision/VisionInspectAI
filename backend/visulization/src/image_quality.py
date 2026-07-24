import cv2
import numpy as np

def calculate_brightness(image):
    """
    Calculate average image brightness.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    return float(np.mean(gray))

def calculate_contrast(image):
    """
    Calculate image contrast using
    the standard deviation of intensity.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    return float(np.std(gray))

def calculate_blur_score(image):
    """
    Estimate image sharpness using
    Variance of Laplacian.
    Higher value = sharper image.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    return float(
        cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()
    )

def estimate_noise(image):
    """
    Estimate image noise level.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    blur = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )

    noise = gray.astype(
        np.float32
    ) - blur.astype(
        np.float32
    )

    return float(
        np.std(noise)
    )

def generate_quality_report(image):
    """
    Generate a complete image quality report.
    """
    return {
        "brightness":
            calculate_brightness(image),

        "contrast":
            calculate_contrast(image),

        "blur_score":
            calculate_blur_score(image),

        "noise_level":
            estimate_noise(image)
    }