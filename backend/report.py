from backend.services.risk_assessment import assess_risk


def generate_report(prediction):

    # Get values from prediction
    anomaly_score = prediction.get("anomaly_score", 0)

    severity_score = prediction.get(
        "severity_score",
        0
    )

    severity_level = prediction.get(
        "severity_level",
        "Unknown"
    )

    confidence = prediction.get(
        "confidence_score",
        0
    )


    # Risk assessment
    risk_assessment = assess_risk(
        severity_score
    )


    # Create inspection report
    report = {

        "Image Name": prediction.get(
            "image_name",
            "uploaded_image"
        ),

        "Prediction": prediction.get(
            "defect_result",
            "Unknown"
        ),

        "Defect Class": prediction.get(
            "defect_class",
            "Unknown"
        ),

        "Anomaly Score": anomaly_score,

        "Severity Score": severity_score,

        "Severity Level": severity_level,

        "Confidence Score": confidence,

        "Risk Level": risk_assessment.get(
            "risk_level",
            "Unknown"
        ),

        "Recommended Action": risk_assessment.get(
            "action",
            "No Action"
        ),

        "Status":
            "Rejected"
            if prediction.get("defect_result") == "REJECT"
            else "Accepted"
    }


    return report