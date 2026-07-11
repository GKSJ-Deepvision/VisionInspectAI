import random

def predict_defect(image_path):

    defects = [
        "good",
        "broken_large",
        "broken_small",
        "contamination"
    ]

    prediction = random.choice(defects)

    confidence = random.randint(80, 99)

    if prediction == "good":
        severity = "Low"

    elif prediction == "broken_small":
        severity = "Medium"

    elif prediction == "contamination":
        severity = "High"

    else:
        severity = "Critical"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "severity": severity
    }