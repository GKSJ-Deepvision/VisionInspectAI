from pathlib import Path

import torch
from anomalib.engine import Engine

import data.config as config
import sys


from models.patchcore import get_model
from models.classifier_predictor import ClassifierPredictor


classifier = ClassifierPredictor()

_ENGINE = Engine(
    default_root_dir=config.OUTPUT_ROOT,
)

_MODEL = get_model()


@torch.no_grad()
def predict(image_path, category):

    image_path = Path(image_path).resolve()

    if not image_path.exists():
        raise FileNotFoundError(
            f"Path not found:\n{image_path}"
        )

    checkpoint = config.get_checkpoint_path(category)

    if not checkpoint.exists():
        raise FileNotFoundError(
            f"Checkpoint not found:\n{checkpoint}"
        )

    predictions = _ENGINE.predict(
        model=_MODEL,
        ckpt_path=checkpoint,
        data_path=image_path,
        return_predictions=True,
    )

    print("Predictions:", predictions)
    print("Prediction count:", len(predictions))

    results = []

    for prediction in predictions:

        print("\n========== AI DEBUG ==========")
        print("Image:", prediction.image_path[0])
        print("Checkpoint:", checkpoint)
        print("Score:", float(prediction.pred_score[0]))
        print("Label:", bool(prediction.pred_label[0]))
        print("==============================\n")

        image_name = Path(
            prediction.image_path[0]
        ).name

        anomaly_score = float(
            prediction.pred_score[0]
        )

        label = bool(
            prediction.pred_label[0]
        )

        anomaly_map = (
            prediction.anomaly_map
            .detach()
            .cpu()
            .numpy()
            .squeeze()
        )

        prediction_mask = (
            prediction.pred_mask
            .detach()
            .cpu()
            .numpy()
            .squeeze()
        )

        result = {

            "image_name": image_name,

            "category": category,

            "status": (
                "Defective"
                if label
                else "Normal"
            ),

            "label": label,

            "anomaly_score": round(
                anomaly_score,
                4,
            ),

            "anomaly_map": anomaly_map,

            "prediction_mask": prediction_mask,

            "image_path": prediction.image_path[0],

        }

        if label:

            classifier_result = classifier.predict(
                prediction.image_path[0]
            )

            result.update(
                classifier_result
            )

        results.append(result)

    return results