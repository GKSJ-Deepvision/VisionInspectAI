from pathlib import Path

from anomalib.engine import Engine

import data.config as config
from models.patchcore import get_model
from models.classifier_predictor import ClassifierPredictor

classifier = ClassifierPredictor()


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

    engine = Engine(
        default_root_dir=config.OUTPUT_ROOT
    )

    predictions = engine.predict(
        model=get_model(),
        ckpt_path=checkpoint,
        data_path=image_path,
        return_predictions=True,
    )

    results = []

    for prediction in predictions:

        image_name = Path(prediction.image_path[0]).name

        anomaly_score = float(prediction.pred_score[0])
        label = bool(prediction.pred_label[0])

        result = {
            "image_name": image_name,
            "category": category,
            "status": "Defective" if label else "Normal",
            "label": label,
            "anomaly_score": round(anomaly_score, 4),

            "anomaly_map": prediction.anomaly_map,
            "prediction_mask": prediction.pred_mask,
            "image_path": prediction.image_path[0],
        }

        if label:

            classifier_result = classifier.predict(
                prediction.image_path[0]
            )

            result.update(classifier_result)

        results.append(result)

    return results


def display_results(results):

    for result in results:

        print()
        print("VISIONINSPECT AI")
        print("\nImage:-")
        print(f"Image Name      : {result['image_name']}")

        print("\nPatchCore:-")
      
        print(f"Category        : {result['category']}")
        print(f"Status          : {result['status']}")
        print(f"Anomaly Score   : {result['anomaly_score']}")

        if result["label"]:

            print("\nClassifier:-")
            print(f"Category        : {result['category']}")
            print(f"Defect          : {result['defect']}")
            print(
                f"Confidence      : "
                f"{result['confidence'] * 100:.2f}%"
            )

        print()


def main():

    print(config.LINE)
    print("PatchCore Prediction")
    print(config.LINE)

    print("\nAvailable Categories:")

    for category in config.CATEGORIES:
        print(f" - {category}")

    category = input(
        "\nEnter category: "
    ).strip().lower()

    while True:

        image_path = input(
            "\nEnter image path ('q' to quit): "
        ).strip()

        if image_path.lower() == "q":
            break

        try:

            results = predict(
                image_path=image_path,
                category=category,
            )

            display_results(results)

        except Exception as e:
            print(f"\nError: {e}")


if __name__ == "__main__":
    main()