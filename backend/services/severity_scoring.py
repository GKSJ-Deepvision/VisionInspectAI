import numpy as np


AREA_WEIGHT = 0.30
LOCATION_WEIGHT = 0.25
TYPE_WEIGHT = 0.25
CONFIDENCE_WEIGHT = 0.20


DEFECT_TYPE_SCORES = {
    "broken": 100,
    "crack": 90,
    "hole": 85,
    "contamination": 75,
    "scratch": 60,
    "color": 45,
}


def _normalize(value: float) -> float:
    return max(0.0, min(100.0, value))


def _calculate_area_score(mask: np.ndarray) -> float:
    defect_pixels = np.count_nonzero(mask)
    total_pixels = mask.size

    if total_pixels == 0:
        return 0.0

    coverage = (defect_pixels / total_pixels) * 100

    return round(_normalize(coverage), 2)


def _calculate_location_score(mask: np.ndarray) -> float:
    points = np.argwhere(mask > 0)

    if len(points) == 0:
        return 0.0

    center_y, center_x = np.mean(points, axis=0)

    height, width = mask.shape

    image_center = np.array([height / 2, width / 2])

    distance = np.linalg.norm(
        np.array([center_y, center_x]) - image_center
    )

    max_distance = np.linalg.norm(image_center)

    score = (distance / max_distance) * 100

    return round(_normalize(score), 2)


def _calculate_type_score(defect_type: str | None) -> float:
    if not defect_type:
        return 0.0

    return DEFECT_TYPE_SCORES.get(
        defect_type.lower(),
        50.0,
    )


def _calculate_confidence_score(confidence: float | None) -> float:
    if confidence is None:
        return 0.0

    return round(_normalize(confidence * 100), 2)


def _get_severity_level(score: float) -> str:
    if score >= 80:
        return "Critical"

    if score >= 60:
        return "High"

    if score >= 40:
        return "Medium"

    return "Low"


def calculate_severity(
    prediction_mask: np.ndarray,
    defect_type: str | None = None,
    confidence: float | None = None,
) -> dict:

    area_score = _calculate_area_score(
        prediction_mask
    )

    location_score = _calculate_location_score(
        prediction_mask
    )

    type_score = _calculate_type_score(
        defect_type
    )

    confidence_score = _calculate_confidence_score(
        confidence
    )

    severity_score = (
        area_score * AREA_WEIGHT
        + location_score * LOCATION_WEIGHT
        + type_score * TYPE_WEIGHT
        + confidence_score * CONFIDENCE_WEIGHT
    )

    severity_score = round(severity_score, 2)

    return {
        "severity_score": severity_score,
        "severity_level": _get_severity_level(
            severity_score
        ),
        "area_score": area_score,
        "location_score": location_score,
        "type_score": type_score,
        "confidence_score": confidence_score,
    }