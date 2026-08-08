
import json
import matplotlib.pyplot as plt
import numpy as np
import torch

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)

import data.config as config
from models.defect_classifier import build_classifier
from utils.classifier_dataset import ClassifierDatasetBuilder


def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    with open(config.CLASSIFIER_LABELS_PATH, "r", encoding="utf-8") as f:
        class_to_index = json.load(f)

    model = build_classifier(len(class_to_index))

    checkpoint = torch.load(
        config.CLASSIFIER_MODEL_PATH,
        map_location=device,
    )

    model.load_state_dict(
        checkpoint["model"] if "model" in checkpoint else checkpoint
    )

    model.to(device)
    model.eval()

    return model, class_to_index, device


def evaluate():
    print(config.LINE)
    print("Classifier Evaluation")
    print(config.LINE)

    output_dir = config.OUTPUT_ROOT / "evaluation"
    output_dir.mkdir(parents=True, exist_ok=True)

    
    builder = ClassifierDatasetBuilder()

    _, val_loader, class_to_index, _ = builder.build()

    labels = [k for k, _ in sorted(class_to_index.items(), key=lambda x: x[1])]

    model, _, device = load_model()

    y_true = []
    y_pred = []

    with torch.no_grad():
        for images, targets in val_loader:
            images = images.to(device)
            targets = targets.to(device)

            outputs = model(images)
            preds = outputs.argmax(dim=1)

            y_true.extend(targets.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())

    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true,
        y_pred,
        average="weighted",
        zero_division=0,
    )

    report = classification_report(
        y_true,
        y_pred,
        target_names=labels,
        zero_division=0,
    )

    with open(output_dir / "classifier_metrics.txt", "w") as f:
        f.write(f"Accuracy  : {accuracy:.4f}\n")
        f.write(f"Precision : {precision:.4f}\n")
        f.write(f"Recall    : {recall:.4f}\n")
        f.write(f"F1 Score  : {f1:.4f}\n")

    with open(output_dir / "classifier_classification_report.txt", "w") as f:
        f.write(report)

    with open(output_dir / "classifier_predictions.csv", "w") as f:
        f.write("Actual,Predicted\n")
        for a, p in zip(y_true, y_pred):
            f.write(f"{labels[a]},{labels[p]}\n")

    cm = confusion_matrix(y_true, y_pred)

    fig, ax = plt.subplots(figsize=(12, 10))
    im = ax.imshow(cm)
    plt.colorbar(im)

    ax.set_xticks(np.arange(len(labels)))
    ax.set_yticks(np.arange(len(labels)))
    ax.set_xticklabels(labels, rotation=90)
    ax.set_yticklabels(labels)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Classifier Confusion Matrix")

    plt.tight_layout()
    plt.savefig(output_dir / "classifier_confusion_matrix.png", dpi=300)
    plt.close()

    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")


if __name__ == "__main__":
    evaluate()
