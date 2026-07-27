import numpy as np

# Map of known MVTec defect types to standard severity scores [0, 100]
DEFECT_TYPE_MAP = {
    # High severity
    "crack": 95,
    "broken": 95,
    "missing": 90,
    "cut": 90,
    "hole": 95,
    "short": 95,
    "damaged": 85,
    # Medium severity
    "contamination": 70,
    "foreign_body": 75,
    "glue": 60,
    "bent": 65,
    "deformed": 70,
    "solder": 60,
    # Low severity
    "scratch": 40,
    "fold": 30,
    "wrinkle": 30,
    "stain": 35,
    "color": 30,
    "thread": 25,
    "good": 0
}

def calculate_severity_score(
    anomaly_map: np.ndarray,
    anomaly_score: float,
    threshold: float,
    defect_type: str = None
):
    """
    Computes a manufacturing defect severity score using the specification formula:
    Severity = (Size * 30%) + (Location * 25%) + (Defect Type * 25%) + (Confidence * 20%)

    Args:
        anomaly_map (np.ndarray): 2D reconstruction error map (H x W).
        anomaly_score (float): Calculated scalar anomaly score.
        threshold (float): Active anomaly threshold for this product category.
        defect_type (str): Optional string describing the defect type.

    Returns:
        report (dict): Contains the final severity score, level, and individual component details.
    """
    H, W = anomaly_map.shape

    # 1. Defect Size Score (30%)
    # Count pixels that significantly deviate from normal (e.g. error > 0.5 * threshold)
    defect_pixel_threshold = 0.5 * threshold
    defect_pixel_count = np.sum(anomaly_map > defect_pixel_threshold)
    pixel_ratio = defect_pixel_count / (H * W)
    
    # Scale: a defect covering 15% or more of the surface gets a Size score of 100
    size_score = min(100.0, (pixel_ratio / 0.15) * 100.0)

    # 2. Defect Location Score (25%)
    # Weight defects higher if they occur closer to the center of the frame (functional zone)
    # We find the centroid of the most anomalous pixels (top 2%)
    top_pixels_threshold = np.percentile(anomaly_map, 98)
    y_coords, x_coords = np.where(anomaly_map >= top_pixels_threshold)
    
    if len(x_coords) > 0 and len(y_coords) > 0:
        centroid_x = np.mean(x_coords)
        centroid_y = np.mean(y_coords)
        
        center_x, center_y = W / 2.0, H / 2.0
        max_dist = np.sqrt(center_x**2 + center_y**2)
        dist_from_center = np.sqrt((centroid_x - center_x)**2 + (centroid_y - center_y)**2)
        
        # Closer to center = higher score
        location_score = max(0.0, 100.0 - (dist_from_center / max_dist) * 100.0)
    else:
        location_score = 50.0 # fallback default

    # 3. Defect Type Score (25%)
    # Lookup type score from mapping. If not provided or unknown, infer from morphology.
    type_score = 50.0 # default baseline
    inferred_type = "unknown"
    
    if defect_type and defect_type.lower() in DEFECT_TYPE_MAP:
        inferred_type = defect_type.lower()
        type_score = DEFECT_TYPE_MAP[inferred_type]
    elif anomaly_score > threshold:
        # Morphological Inference (Scratch vs Spot vs Contamination)
        # Binarize anomaly map using Otsu's or fixed threshold to find components
        bin_map = (anomaly_map > defect_pixel_threshold).astype(np.uint8) * 255
        try:
            import cv2
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(bin_map)
            
            if num_labels > 1: # Index 0 is background
                # Find largest component index (excluding background)
                largest_comp_idx = np.argmax(stats[1:, cv2.CC_STAT_AREA]) + 1
                w = stats[largest_comp_idx, cv2.CC_STAT_WIDTH]
                h = stats[largest_comp_idx, cv2.CC_STAT_HEIGHT]
                aspect_ratio = max(w / max(1, h), h / max(1, w))
                
                if aspect_ratio > 3.0:
                    inferred_type = "scratch"
                    type_score = DEFECT_TYPE_MAP["scratch"]
                elif stats[largest_comp_idx, cv2.CC_STAT_AREA] > (H * W * 0.05):
                    inferred_type = "large_crack"
                    type_score = DEFECT_TYPE_MAP["crack"]
                else:
                    inferred_type = "spot_contamination"
                    type_score = DEFECT_TYPE_MAP["contamination"]
        except Exception:
            pass

    # For normal/good samples, type score should be 0
    if anomaly_score <= threshold:
        type_score = 0.0
        inferred_type = "good"

    # 4. Detection Confidence Score (20%)
    # Measures the distance above threshold. If below, confidence in normal class.
    if anomaly_score > threshold:
        # How far above threshold? e.g. score / threshold
        margin = anomaly_score / threshold
        # Confidence score ranges from 80% to 100% when exceeding threshold
        confidence_score = min(100.0, 80.0 + (margin - 1.0) * 40.0)
    else:
        # Confidence in 'normal' status (how far below threshold)
        margin = anomaly_score / threshold
        confidence_score = min(100.0, (1.0 - margin) * 100.0)

    # 5. Calculate Weighted Severity Score
    # Formula: Size*0.30 + Location*0.25 + Type*0.25 + Confidence*0.20
    severity_score = (
        (size_score * 0.30) +
        (location_score * 0.25) +
        (type_score * 0.25) +
        (confidence_score * 0.20)
    )

    # Force severity score to 0 if the model predicts no anomaly
    if anomaly_score <= threshold:
        severity_score = severity_score * 0.1 # keep it very low (0 - 10) for normal cosmetics

    # Map to Severity Level
    if severity_score >= 80.0:
        level = "Critical"
        action = "Reject Product and Trigger Quality Inspection Workflow"
    elif severity_score >= 60.0:
        level = "High"
        action = "Significant quality issue - Rework or repair recommended"
    elif severity_score >= 40.0:
        level = "Medium"
        action = "Moderate concern - Requires QA team manual review"
    else:
        level = "Low"
        action = "Pass - Product is generally acceptable"

    return {
        "severity_score": round(severity_score, 2),
        "severity_level": level,
        "recommended_action": action,
        "inferred_defect_type": inferred_type,
        "breakdown": {
            "size_score": round(size_score, 2),
            "location_score": round(location_score, 2),
            "type_score": round(type_score, 2),
            "confidence_score": round(confidence_score, 2)
        }
    }
