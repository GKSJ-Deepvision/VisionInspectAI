import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# ======================================
# Paths
# ======================================

BASE_DIR = "../prepared_dataset"

TEST_DIR = os.path.join(BASE_DIR, "test")

MODEL_PATH = "best_model.keras"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32


# ======================================
# Load Test Dataset
# ======================================

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

test_data = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)


# ======================================
# Class Mapping
# ======================================

print("\n==============================")
print("CLASS MAPPING")
print("==============================")

print(test_data.class_indices)

print("==============================")


# ======================================
# Load Model
# ======================================

print("\nLoading trained model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Model Loaded Successfully!")


# ======================================
# Generate Predictions
# ======================================

print("\nGenerating predictions...")

test_data.reset()

predictions = model.predict(
    test_data,
    verbose=1
).ravel()

true_classes = test_data.classes

class_names = list(
    test_data.class_indices.keys()
)


# ======================================
# Keras Default Evaluation
# Threshold = 0.50
# ======================================

test_data.reset()

loss, keras_accuracy = model.evaluate(
    test_data,
    verbose=1
)

print("\n==============================")
print("MODEL EVALUATION")
print("==============================")

print(
    f"Test Loss     : {loss:.4f}"
)

print(
    f"Test Accuracy : {keras_accuracy * 100:.2f}%"
)

print("==============================")


# ======================================
# Function for Evaluation
# ======================================

def evaluate_threshold(
    threshold,
    predictions,
    true_classes,
    class_names,
    save_prefix
):

    predicted_classes = (
        predictions >= threshold
    ).astype(int)


    accuracy = accuracy_score(
        true_classes,
        predicted_classes
    )


    # Class 0 = Defective
    defective_precision = precision_score(
        true_classes,
        predicted_classes,
        pos_label=0,
        zero_division=0
    )


    defective_recall = recall_score(
        true_classes,
        predicted_classes,
        pos_label=0,
        zero_division=0
    )


    defective_f1 = f1_score(
        true_classes,
        predicted_classes,
        pos_label=0,
        zero_division=0
    )


    # Class 1 = No_Defect
    no_defect_precision = precision_score(
        true_classes,
        predicted_classes,
        pos_label=1,
        zero_division=0
    )


    no_defect_recall = recall_score(
        true_classes,
        predicted_classes,
        pos_label=1,
        zero_division=0
    )


    no_defect_f1 = f1_score(
        true_classes,
        predicted_classes,
        pos_label=1,
        zero_division=0
    )


    # ==================================
    # Print Results
    # ==================================

    print("\n========================================")
    print(f"THRESHOLD = {threshold:.2f}")
    print("========================================")

    print(
        f"Overall Accuracy : "
        f"{accuracy * 100:.2f}%"
    )

    print("\nDefective:")

    print(
        f"  Precision : "
        f"{defective_precision * 100:.2f}%"
    )

    print(
        f"  Recall    : "
        f"{defective_recall * 100:.2f}%"
    )

    print(
        f"  F1-Score  : "
        f"{defective_f1 * 100:.2f}%"
    )


    print("\nNo_Defect:")

    print(
        f"  Precision : "
        f"{no_defect_precision * 100:.2f}%"
    )

    print(
        f"  Recall    : "
        f"{no_defect_recall * 100:.2f}%"
    )

    print(
        f"  F1-Score  : "
        f"{no_defect_f1 * 100:.2f}%"
    )


    # ==================================
    # Classification Report
    # ==================================

    report = classification_report(

        true_classes,

        predicted_classes,

        target_names=class_names,

        digits=4,

        zero_division=0
    )

    print("\nClassification Report:")
    print(report)


    # ==================================
    # Confusion Matrix
    # ==================================

    cm = confusion_matrix(
        true_classes,
        predicted_classes
    )


    print("Confusion Matrix:")
    print(cm)


    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=class_names
    )


    fig, ax = plt.subplots(
        figsize=(6, 6)
    )

    disp.plot(ax=ax)

    plt.title(
        f"Confusion Matrix "
        f"(Threshold = {threshold:.2f})"
    )

    plt.savefig(
        f"{save_prefix}_confusion_matrix.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


    # ==================================
    # Save Report
    # ==================================

    with open(
        f"{save_prefix}_report.txt",
        "w"
    ) as f:

        f.write(
            f"Threshold : {threshold:.2f}\n\n"
        )

        f.write(
            f"Overall Accuracy : "
            f"{accuracy * 100:.2f}%\n\n"
        )

        f.write(
            "Defective:\n"
        )

        f.write(
            f"Precision : "
            f"{defective_precision * 100:.2f}%\n"
        )

        f.write(
            f"Recall : "
            f"{defective_recall * 100:.2f}%\n"
        )

        f.write(
            f"F1-Score : "
            f"{defective_f1 * 100:.2f}%\n\n"
        )

        f.write(
            "No_Defect:\n"
        )

        f.write(
            f"Precision : "
            f"{no_defect_precision * 100:.2f}%\n"
        )

        f.write(
            f"Recall : "
            f"{no_defect_recall * 100:.2f}%\n"
        )

        f.write(
            f"F1-Score : "
            f"{no_defect_f1 * 100:.2f}%\n\n"
        )

        f.write(
            "Classification Report:\n"
        )

        f.write(report)

        f.write(
            "\nConfusion Matrix:\n"
        )

        f.write(str(cm))


    return {
        "accuracy": accuracy,
        "defective_precision": defective_precision,
        "defective_recall": defective_recall,
        "defective_f1": defective_f1,
        "no_defect_precision": no_defect_precision,
        "no_defect_recall": no_defect_recall,
        "no_defect_f1": no_defect_f1
    }


# ======================================
# Evaluate Threshold 0.50
# ======================================

results_050 = evaluate_threshold(

    threshold=0.50,

    predictions=predictions,

    true_classes=true_classes,

    class_names=class_names,

    save_prefix="threshold_050"
)


# ======================================
# Evaluate Threshold 0.30
# ======================================

results_030 = evaluate_threshold(

    threshold=0.30,

    predictions=predictions,

    true_classes=true_classes,

    class_names=class_names,

    save_prefix="threshold_030"
)


# ======================================
# Final Comparison
# ======================================

print("\n========================================")
print("FINAL COMPARISON")
print("========================================")

print("\nThreshold 0.50")

print(
    f"Accuracy          : "
    f"{results_050['accuracy'] * 100:.2f}%"
)

print(
    f"Defective Recall  : "
    f"{results_050['defective_recall'] * 100:.2f}%"
)

print(
    f"Defective F1      : "
    f"{results_050['defective_f1'] * 100:.2f}%"
)


print("\nThreshold 0.30")

print(
    f"Accuracy          : "
    f"{results_030['accuracy'] * 100:.2f}%"
)

print(
    f"Defective Recall  : "
    f"{results_030['defective_recall'] * 100:.2f}%"
)

print(
    f"Defective F1      : "
    f"{results_030['defective_f1'] * 100:.2f}%"
)


print("\n========================================")
print("Evaluation Completed Successfully!")
print("========================================")