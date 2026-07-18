from typing import Dict

def predict_defect(image_name: str) -> Dict:
    """
    Mock prediction function.
    Later this will be replaced by the trained AI model.
    """

    prediction = {
        "image_name": image_name,
        "prediction": "Defective",
        "anomaly_score": 78
    }

    return prediction