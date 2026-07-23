def score_severity(anomaly_score: float) -> dict:
    """
    Convert anomaly score to severity level
    
    Args:
        anomaly_score: Anomaly detection score (0.0 to 1.0)
        
    Returns:
        Dictionary with severity level and normalized score
    """
    # Clamp score to 0-1 range
    normalized_score = max(0.0, min(1.0, anomaly_score))
    
    # Determine severity level
    if normalized_score < 0.3:
        severity = "normal"
    elif normalized_score < 0.6:
        severity = "minor"
    elif normalized_score < 0.8:
        severity = "moderate"
    else:
        severity = "critical"
    
    return {
        "raw_score": round(anomaly_score, 4),
        "normalized_score": round(normalized_score, 3),
        "severity": severity,
        "confidence": round(normalized_score, 3)
    }


def get_severity_details(severity_level: str) -> dict:
    """Get details and recommendations for a severity level"""
    severity_info = {
        "normal": {
            "description": "No anomalies detected",
            "recommendation": "Item passes quality check",
            "action": "accept"
        },
        "minor": {
            "description": "Minor anomalies detected",
            "recommendation": "Review recommended",
            "action": "review"
        },
        "moderate": {
            "description": "Moderate anomalies detected",
            "recommendation": "Manual inspection required",
            "action": "inspect"
        },
        "critical": {
            "description": "Critical anomalies detected",
            "recommendation": "Item should be rejected",
            "action": "reject"
        }
    }
    
    return severity_info.get(severity_level, severity_info["normal"])
