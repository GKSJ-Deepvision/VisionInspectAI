from prediction import predict_defect
from severity import calculate_severity

def generate_report(image_name):

    # Get prediction result
    prediction = predict_defect(image_name)

    # Get severity details
    severity = calculate_severity(prediction["anomaly_score"])

    # Create inspection report
    report = {
        "Image Name": prediction["image_name"],
        "Prediction": prediction["prediction"],
        "Severity Score": severity["severity_score"],
        "Severity Level": severity["severity_level"],
        "Status": "Rejected" if prediction["prediction"] == "Defective" else "Accepted"
    }

    return report