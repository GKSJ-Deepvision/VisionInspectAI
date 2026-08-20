

DEFECT_TYPE_SCORE_PLACEHOLDER = 60  # no classifier yet - PatchCore is unsupervised and can't classify defect type (crack/scratch/dent); fixed mid-range value until a supervised classifier is added on top of the anomaly output


def calculate_severity(pred_score: float, defect_area_pct: float = 0.0, dist_from_center: float = 0.5) -> dict:
    # defect_area_pct now comes from a statistical outlier threshold (see
    # predict.py's _map_stats), which naturally yields smaller percentages
    # than a min-max fraction would - a genuinely large defect might only
    # measure ~10-15% "area" this way. x8 keeps a real large defect landing
    # in the 80-100 range while a small scratch (~1% area) stays low.
    size_score = min(defect_area_pct * 8, 100)
    location_score = max(0.0, (1 - dist_from_center / 0.7) * 100)
    confidence_score = pred_score * 100

    severity_score = (
        size_score * 0.30
        + location_score * 0.25
        + DEFECT_TYPE_SCORE_PLACEHOLDER * 0.25
        + confidence_score * 0.20
    )

    if severity_score >= 80:
        level, action = "Critical", "Reject product and trigger quality inspection workflow"
    elif severity_score >= 60:
        level, action = "High", "Repair or rework recommended"
    elif severity_score >= 40:
        level, action = "Medium", "Inspection review required"
    else:
        level, action = "Low", "Product generally acceptable"

    return {
        "severity_score": round(severity_score, 1),
        "severity_level": level,
        "recommended_action": action,
        "component_scores": {
            "size": round(size_score, 1),
            "location": round(location_score, 1),
            "defect_type": DEFECT_TYPE_SCORE_PLACEHOLDER,
            "confidence": round(confidence_score, 1),
        },
    }
