import os
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

from sklearn.utils.class_weight import compute_class_weight


# ======================================
# Paths
# ======================================

BASE_DIR = "../prepared_dataset"

TRAIN_DIR = os.path.join(BASE_DIR, "train")
VAL_DIR = os.path.join(BASE_DIR, "validation")
TEST_DIR = os.path.join(BASE_DIR, "test")

MODEL_PATH = "best_model.keras"


# ======================================
# Parameters
# ======================================

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

STAGE1_EPOCHS = 10
STAGE2_EPOCHS = 30


# ======================================
# Data Augmentation
# ======================================

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,

    rotation_range=10,
    zoom_range=0.1,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,

    fill_mode="nearest"
)

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)


# ======================================
# Load Dataset
# ======================================

train_data = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=True
)

val_data = test_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)

test_data = test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)


print("\n==============================")
print("Class Mapping:")
print(train_data.class_indices)
print("==============================")


# ======================================
# Class Weights
# ======================================

classes = np.unique(train_data.classes)

class_weights_array = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=train_data.classes
)

class_weights = dict(
    enumerate(class_weights_array)
)

print("\nClass Weights:")
print(class_weights)


# ======================================
# MobileNetV2 Base Model
# ======================================

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)


# ======================================
# STAGE 1 - FEATURE EXTRACTION
# ======================================

print("\n==============================")
print("STAGE 1 - FEATURE EXTRACTION")
print("==============================")


base_model.trainable = False


x = base_model.output

x = GlobalAveragePooling2D()(x)

x = Dropout(0.3)(x)

x = Dense(
    128,
    activation="relu"
)(x)

x = Dropout(0.2)(x)

output = Dense(
    1,
    activation="sigmoid"
)(x)


model = Model(
    inputs=base_model.input,
    outputs=output
)


model.compile(
    optimizer=Adam(
        learning_rate=1e-3
    ),

    loss="binary_crossentropy",

    metrics=[
        "accuracy"
    ]
)


# ======================================
# Stage 1 Callbacks
# ======================================

stage1_callbacks = [

    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=4,
        restore_best_weights=True,
        verbose=1
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )

]


# ======================================
# Stage 1 Training
# ======================================

print("\nTraining Stage 1...\n")


history1 = model.fit(

    train_data,

    validation_data=val_data,

    epochs=STAGE1_EPOCHS,

    class_weight=class_weights,

    callbacks=stage1_callbacks,

    verbose=1
)


# ======================================
# STAGE 2 - FINE TUNING
# ======================================

print("\n==============================")
print("STAGE 2 - FINE TUNING")
print("==============================")


base_model.trainable = True


# Freeze all except last 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False


# Keep BatchNormalization layers frozen
for layer in base_model.layers:

    if isinstance(
        layer,
        tf.keras.layers.BatchNormalization
    ):
        layer.trainable = False


print("\nTrainable Base Model Layers:")


trainable_count = 0


for layer in base_model.layers:

    if layer.trainable:

        trainable_count += 1


print(
    f"Trainable Base Layers : {trainable_count}"
)


# ======================================
# Rebuild Model for Fine-Tuning
# ======================================

inputs = tf.keras.Input(
    shape=(224, 224, 3)
)


x = base_model(
    inputs,
    training=False
)


x = GlobalAveragePooling2D()(x)

x = Dropout(0.3)(x)

x = Dense(
    128,
    activation="relu"
)(x)

x = Dropout(0.2)(x)


outputs = Dense(
    1,
    activation="sigmoid"
)(x)


model = Model(
    inputs,
    outputs
)


# ======================================
# Compile Fine-Tuning Model
# ======================================

model.compile(

    optimizer=Adam(
        learning_rate=1e-5
    ),

    loss="binary_crossentropy",

    metrics=[
        "accuracy"
    ]
)


# ======================================
# Stage 2 Callbacks
# ======================================

stage2_callbacks = [

    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=7,
        restore_best_weights=True,
        verbose=1
    ),

    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        mode="max",
        verbose=1
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1
    )

]


# ======================================
# Stage 2 Training
# ======================================

print("\nTraining Stage 2...\n")


history2 = model.fit(

    train_data,

    validation_data=val_data,

    epochs=STAGE2_EPOCHS,

    class_weight=class_weights,

    callbacks=stage2_callbacks,

    verbose=1
)


# ======================================
# Load Best Model
# ======================================

print("\n==============================")
print("Loading Best Model")
print("==============================")


model = tf.keras.models.load_model(
    MODEL_PATH
)


# ======================================
# Original Test Evaluation
# ======================================

print("\n==============================")
print("TEST EVALUATION")
print("==============================")


test_loss, test_acc = model.evaluate(
    test_data,
    verbose=1
)


print("\n==============================")
print(
    f"Original Test Accuracy : "
    f"{test_acc * 100:.2f}%"
)

print(
    f"Test Loss              : "
    f"{test_loss:.4f}"
)

print("==============================")


# ======================================
# THRESHOLD TUNING
# ======================================

print("\n==============================")
print("THRESHOLD TUNING")
print("==============================")


# Reset validation generator
val_data.reset()


# Validation predictions
val_predictions = model.predict(
    val_data,
    verbose=1
).ravel()


val_true = val_data.classes


best_threshold = 0.50
best_val_accuracy = 0.0


# Try thresholds from 0.30 to 0.70
for threshold in np.arange(
    0.30,
    0.71,
    0.01
):

    val_pred = (
        val_predictions >= threshold
    ).astype(int)


    accuracy = np.mean(
        val_pred == val_true
    )


    if accuracy > best_val_accuracy:

        best_val_accuracy = accuracy

        best_threshold = threshold


print("\n==============================")

print(
    f"Best Threshold : "
    f"{best_threshold:.2f}"
)

print(
    f"Best Validation Accuracy : "
    f"{best_val_accuracy * 100:.2f}%"
)

print("==============================")


# ======================================
# TEST USING BEST THRESHOLD
# ======================================

test_data.reset()


test_predictions = model.predict(
    test_data,
    verbose=1
).ravel()


test_true = test_data.classes


test_pred = (
    test_predictions >= best_threshold
).astype(int)


tuned_test_accuracy = np.mean(
    test_pred == test_true
)


print("\n==============================")
print("FINAL ACCURACY COMPARISON")
print("==============================")


print(
    f"Original Test Accuracy : "
    f"{test_acc * 100:.2f}%"
)


print(
    f"Tuned Test Accuracy    : "
    f"{tuned_test_accuracy * 100:.2f}%"
)


print(
    f"Best Threshold         : "
    f"{best_threshold:.2f}"
)


print("==============================")


# ======================================
# Combine Training History
# ======================================

train_accuracy = (
    history1.history["accuracy"]
    + history2.history["accuracy"]
)

val_accuracy = (
    history1.history["val_accuracy"]
    + history2.history["val_accuracy"]
)

train_loss = (
    history1.history["loss"]
    + history2.history["loss"]
)

val_loss = (
    history1.history["val_loss"]
    + history2.history["val_loss"]
)


# ======================================
# Accuracy Graph
# ======================================

plt.figure(figsize=(8, 5))


plt.plot(
    train_accuracy,
    label="Train Accuracy"
)


plt.plot(
    val_accuracy,
    label="Validation Accuracy"
)


plt.title(
    "Training vs Validation Accuracy"
)


plt.xlabel("Epoch")


plt.ylabel("Accuracy")


plt.legend()


plt.grid(True)


plt.savefig(
    "accuracy.png",
    dpi=300
)


plt.close()


# ======================================
# Loss Graph
# ======================================

plt.figure(figsize=(8, 5))


plt.plot(
    train_loss,
    label="Train Loss"
)


plt.plot(
    val_loss,
    label="Validation Loss"
)


plt.title(
    "Training vs Validation Loss"
)


plt.xlabel("Epoch")


plt.ylabel("Loss")


plt.legend()


plt.grid(True)


plt.savefig(
    "loss.png",
    dpi=300
)


plt.close()


# ======================================
# Final Message
# ======================================

print("\n========================================")
print("Training Completed Successfully!")
print("Best Model Saved :", MODEL_PATH)
print("Accuracy Graph   : accuracy.png")
print("Loss Graph       : loss.png")

print(
    f"Original Test Accuracy : "
    f"{test_acc * 100:.2f}%"
)

print(
    f"Tuned Test Accuracy    : "
    f"{tuned_test_accuracy * 100:.2f}%"
)

print(
    f"Best Threshold         : "
    f"{best_threshold:.2f}"
)

print("========================================")