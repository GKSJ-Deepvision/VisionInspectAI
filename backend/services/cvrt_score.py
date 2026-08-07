def calculate_cvrt(anomaly_score, severity_level, confidence):

    severity_weight = {
        "Low": 20,
        "Medium": 50,
        "High": 80
    }

    severity_score = severity_weight.get(severity_level, 0)

    cvrt = (
        anomaly_score * 0.5 +
        severity_score * 0.3 +
        confidence * 100 * 0.2
    )

    return round(min(cvrt, 100), 2)