from pathlib import Path

import pandas as pd

from anomalib.engine import Engine

import data.config as config
from data.datamodule import get_datamodule
from models.patchcore import get_model
from utils.metrics import calculate_metrics


def evaluate_category(category):

    checkpoint = config.get_checkpoint_path(category)

    if not checkpoint.exists():
        print(f"Checkpoint not found : {category}")
        return None

    datamodule = get_datamodule(category)

    model = get_model()

    engine = Engine(
        default_root_dir=config.OUTPUT_ROOT
    )

    predictions = engine.predict(
        model=model,
        datamodule=datamodule,
        ckpt_path=checkpoint,
        return_predictions=True,
    )

    y_true = []
    y_pred = []
    y_score = []

    for batch in predictions:

        labels = batch.gt_label.cpu().numpy()
        preds = batch.pred_label.cpu().numpy()
        scores = batch.pred_score.cpu().numpy()

        y_true.extend(labels.tolist())
        y_pred.extend(preds.tolist())
        y_score.extend(scores.tolist())

    metrics = calculate_metrics(
        y_true,
        y_pred,
        y_score,
    )

    total = len(y_true)

    normal = sum(label == 0 for label in y_true)
    defective = sum(label == 1 for label in y_true)

    row = {
        "Category": category,
        "Total Images": total,
        "Normal Images": normal,
        "Defective Images": defective,
        "Accuracy": round(metrics["Accuracy"], 4),
        "Precision": round(metrics["Precision"], 4),
        "Recall": round(metrics["Recall"], 4),
        "F1 Score": round(metrics["F1 Score"], 4),
        "ROC AUC": round(metrics["ROC AUC"], 4),
    }

    print()
    print(config.LINE)
    print(category.upper())
    print(config.LINE)

    for key in row:

        if key != "Category":
            print(f"{key:<20}: {row[key]}")

    print()

    print("Confusion Matrix")

    print(metrics["Confusion Matrix"])

    return row

def main():

    print(config.LINE)
    print("VisionInspect AI Evaluation")
    print(config.LINE)

    results = []

    csv_path = config.EVALUATION_DIR / "evaluation_results.csv"
    summary_path = config.EVALUATION_DIR / "evaluation_summary.txt"

    for category in config.CATEGORIES:

        try:

            row = evaluate_category(category)

            if row is None:
                continue

            results.append(row)

            df = pd.DataFrame(results)
            df.to_csv(
                csv_path,
                index=False,
            )

            with open(summary_path, "w") as f:

                f.write("VisionInspect AI Evaluation Summary\n\n")

                f.write(df.to_string(index=False))

                f.write("\n\n")

                f.write("Average Metrics\n")
                f.write("-" * 50 + "\n")

                numeric = df.select_dtypes(include="number")

                for column in numeric.columns:

                    f.write(
                        f"{column:<20}: "
                        f"{numeric[column].mean():.4f}\n"
                    )

            print(f"\n✓ Results saved after '{category}'")

        except Exception as e:

            print()
            print(config.LINE)
            print(f"Evaluation failed for '{category}'")
            print(e)
            print(config.LINE)

    print()
    print(config.LINE)
    print("Evaluation Completed")
    print(config.LINE)

    print(f"\nCSV Saved     : {csv_path}")
    print(f"Summary Saved : {summary_path}")

if __name__ == "__main__":
    main()