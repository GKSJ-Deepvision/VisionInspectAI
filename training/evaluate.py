import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    accuracy_score
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
    rescale=1./255
)

test_data = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)


# ======================================
# Load Model
# ======================================

print("\nLoading trained model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model Loaded Successfully!\n")


# ======================================
# Evaluate Model
# ======================================

loss, accuracy = model.evaluate(test_data, verbose=1)

print("\n==============================")
print(f"Test Loss     : {loss:.4f}")
print(f"Test Accuracy : {accuracy*100:.2f}%")
print("==============================")


# ======================================
# Predictions
# ======================================

predictions = model.predict(test_data)

predicted_classes = (predictions > 0.5).astype(int).flatten()

true_classes = test_data.classes

class_names = list(test_data.class_indices.keys())


# ======================================
# Classification Report
# ======================================

report = classification_report(
    true_classes,
    predicted_classes,
    target_names=class_names
)

print("\nClassification Report\n")
print(report)

with open("classification_report.txt", "w") as f:
    f.write(report)


# ======================================
# Confusion Matrix
# ======================================

cm = confusion_matrix(
    true_classes,
    predicted_classes
)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=class_names
)

fig, ax = plt.subplots(figsize=(6,6))
disp.plot(ax=ax)

plt.title("Confusion Matrix")

plt.savefig("confusion_matrix.png", dpi=300)

plt.close()


print("\nConfusion Matrix Saved : confusion_matrix.png")
print("Classification Report Saved : classification_report.txt")

print("\nEvaluation Completed Successfully!")