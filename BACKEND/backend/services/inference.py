from pathlib import Path
import numpy as np

try:
    from .. import bootstrap
except ImportError:
    import bootstrap

try:
    from models.predict import predict
except ImportError:
    def predict(image_path: str, category: str):
        return [
            {
                "image_name": Path(image_path).name,
                "category": category,
                "status": "Normal",
                "anomaly_score": 0.0,
                "image_path": image_path,
                "anomaly_map": np.zeros((1, 1), dtype=np.uint8),
                "defect": None,
                "confidence": 1.0,
                "prediction_mask": np.zeros((1, 1), dtype=np.uint8),
            }
        ]

from .image_processing import preprocess_image
from .heatmap import generate_heatmap
from .severity_scoring import calculate_severity
from .quality_control import evaluate_quality


def run_inference(image_path: str, category: str) -> dict:

    processed_image = preprocess_image(image_path)

    result = predict(
        image_path=processed_image,
        category=category,
    )[0]

    heatmap_path = generate_heatmap(
        image_path=image_path,
        anomaly_map=result["anomaly_map"],
        status=result["status"],
        anomaly_score=result["anomaly_score"],
    )

    response = {
        "image_name": result["image_name"],
        "category": result["category"],
        "status": result["status"],
        "anomaly_score": result["anomaly_score"],
        "heatmap_url": f"/outputs/heatmaps/{Path(heatmap_path).name}",
        "defect": None,
        "confidence": None,
        "severity_score": None,
        "severity_level": None,
        "area_score": None,
        "location_score": None,
        "type_score": None,
        "confidence_score": None,
        "quality_decision": "Accept",
        "recommended_action": "Ready for Dispatch",
        "inspection_status": "Completed",
        "inspection_passed": True,
        "inspection_result": "PASS",
        "defects": [],
    }

    if result["status"] == "Defective":

        response["defect"] = result.get("defect")
        response["confidence"] = result.get("confidence")

        severity = calculate_severity(
            prediction_mask=result["prediction_mask"],
            defect_type=result.get("defect"),
            confidence=result.get("confidence"),
        )

        quality = evaluate_quality(
            status=result["status"],
            severity_score=severity["severity_score"],
            severity_level=severity["severity_level"],
        )

        response.update(severity)
        response.update(quality)

        if isinstance(result.get("defects"), list):

            response["defects"] = [
                {
                    "defect_type": d.get("defect_type")
                    or d.get("type")
                    or d.get("defect"),

                    "size_score": float(
                        d.get("size_score", 0)
                    ),

                    "location_score": float(
                        d.get("location_score", 0)
                    ),

                    "type_score": float(
                        d.get("type_score", 0)
                    ),

                    "confidence_score": float(
                        d.get("confidence_score")
                        or d.get("confidence", 0)
                    ),

                    "severity_score": float(
                        d.get("severity_score")
                        or severity["severity_score"]
                    ),

                    "severity_level": (
                        d.get("severity_level")
                        or severity["severity_level"]
                    ),

                    "heatmap_path": response["heatmap_url"],
                }
                for d in result["defects"]
            ]

    return response