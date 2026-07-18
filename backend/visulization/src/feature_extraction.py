import cv2
import numpy as np
from skimage.feature import local_binary_pattern
from src.config import HISTOGRAM_BINS, LBP_RADIUS, LBP_POINTS

def extract_color_features(image, bins=HISTOGRAM_BINS):
    """
    Extract normalized RGB color histogram features.
    """
    features = []

    for channel in range(3):
        histogram = cv2.calcHist(
            [image],
            [channel],
            None,
            [bins],
            [0, 256]
        )

        histogram = cv2.normalize(
            histogram,
            histogram
        ).flatten()

        features.extend(histogram)

    return np.array(features)

def extract_texture_features(image, radius=LBP_POINTS, points=LBP_POINTS):
    """
    Extract Local Binary Pattern (LBP) texture features.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    lbp = local_binary_pattern(
        gray,
        points,
        radius,
        method="uniform"
    )

    histogram, _ = np.histogram(
        lbp.ravel(),
        bins=np.arange(0, points + 3),
        range=(0, points + 2)
    )

    histogram = histogram.astype(np.float32)
    histogram /= (histogram.sum() + 1e-6)

    return histogram

def extract_edge_features(image):
    """
    Calculate edge density using Canny Edge Detection.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    edges = cv2.Canny(
        gray,
        100,
        200
    )

    edge_density = np.count_nonzero(edges) / edges.size

    return edge_density

def extract_shape_features(image):
    """
    Extract contour-based shape information.
    """
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    _, binary = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    total_area = sum(
        cv2.contourArea(contour)
        for contour in contours
    )

    return {
        "contour_count": len(contours),
        "total_contour_area": float(total_area)
    }

def extract_all_features(image):
    """
    Extract all image features.
    """
    return {
        "color": extract_color_features(image),
        "texture": extract_texture_features(image),
        "edge_density": extract_edge_features(image),
        "shape": extract_shape_features(image)
    }

def display_feature_summary(image):
    """
    Display extracted feature summary.
    """
    color = extract_color_features(image)
    texture = extract_texture_features(image)
    edge = extract_edge_features(image)
    shape = extract_shape_features(image)

    print("\n========== Feature Extraction Summary ==========")
    print(f"Color Histogram Features : {len(color)}")
    print(f"Texture (LBP) Features   : {len(texture)}")
    print(f"Edge Density             : {edge:.4f}")
    print(f"Contours Detected        : {shape['contour_count']}")
    print(f"Total Contour Area       : {shape['total_contour_area']:.2f}")
    print("================================================")