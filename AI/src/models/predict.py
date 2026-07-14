
from pathlib import Path
from anomalib.engine import Engine
import data.config as config
from models.patchcore import get_model

def predict(image_path):
    image_path = Path(image_path).resolve()

    if not image_path.exists():
        raise FileNotFoundError(f"Path not found:\n{image_path}")

    engine = Engine(
    default_root_dir=config.OUTPUT_ROOT)


    predictions = engine.predict(
        model=get_model(),
        ckpt_path=config.CHECKPOINT_PATH,
        data_path=image_path,
        return_predictions=True,
    )

    results = []

    for prediction in predictions:
        image_name = Path(prediction.image_path[0]).name
        anomaly_score = float(prediction.pred_score[0])
        label = bool(prediction.pred_label[0])
        results.append(
            {
                "image_name": image_name,
                "category": config.TRAIN_CATEGORY,
                "status": "Defective" if label else "Normal",
                "label": label,
                "anomaly_score": round(anomaly_score, 4),
                "anomaly_map": prediction.anomaly_map,
                "prediction_mask": prediction.pred_mask,
            }
        )

    return results

def display_results(results):
    print()
    for result in results:

        print(f"Image          : {result['image_name']}")
        print(f"Category       : {result['category']}")
        print(f"Status         : {result['status']}")
        print(f"Anomaly Score  : {result['anomaly_score']}")
        print()

def main():

    image_path = input(
        "Enter image or folder path: "
    ).strip()

    results = predict(image_path)

    display_results(results)

if __name__ == "__main__":
    main()