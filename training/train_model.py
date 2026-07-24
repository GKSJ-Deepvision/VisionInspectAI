import os
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
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
EPOCHS = 35


# ======================================
# Data Augmentation
# ======================================

train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=10,
    zoom_range=0.1,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    fill_mode="nearest"
)

test_datagen = ImageDataGenerator(
    rescale=1.0 / 255
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

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_data.classes),
    y=train_data.classes
)

class_weights = dict(enumerate(class_weights))

print("\nClass Weights:")
print(class_weights)


# ======================================
# MobileNetV2 Model (Fine-Tuning)
# ======================================

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

# Fine-tuning
base_model.trainable = True

# Freeze all layers except last 30
for layer in base_model.layers[:-30]:
    layer.trainable = False


x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)

output = Dense(
    1,
    activation="sigmoid"
)(x)

model = Model(
    inputs=base_model.input,
    outputs=output
)

model.compile(
    optimizer=Adam(learning_rate=1e-5),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.summary()

print("\nTrainable Layers:")

count = 0

for layer in model.layers:
    if layer.trainable:
        count += 1

print(f"Trainable Layers : {count}")
# ======================================
# Callbacks
# ======================================

callbacks = [

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
# Training
# ======================================

print("\n==============================")
print("Training Started...")
print("==============================\n")

history = model.fit(

    train_data,

    validation_data=val_data,

    epochs=EPOCHS,

    class_weight=class_weights,

    callbacks=callbacks,

    verbose=1

)


# ======================================
# Load Best Model
# ======================================

model = tf.keras.models.load_model(MODEL_PATH)


# ======================================
# Test Evaluation
# ======================================

test_loss, test_acc = model.evaluate(
    test_data,
    verbose=1
)

print("\n==============================")
print(f"Test Accuracy : {test_acc * 100:.2f}%")
print(f"Test Loss     : {test_loss:.4f}")
print("==============================")


# ======================================
# Accuracy Graph
# ======================================

plt.figure(figsize=(8,5))

plt.plot(
    history.history["accuracy"],
    label="Train Accuracy"
)

plt.plot(
    history.history["val_accuracy"],
    label="Validation Accuracy"
)

plt.title("Training vs Validation Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)

plt.savefig("accuracy.png", dpi=300)
plt.close()


# ======================================
# Loss Graph
# ======================================

plt.figure(figsize=(8,5))

plt.plot(
    history.history["loss"],
    label="Train Loss"
)

plt.plot(
    history.history["val_loss"],
    label="Validation Loss"
)

plt.title("Training vs Validation Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.grid(True)

plt.savefig("loss.png", dpi=300)
plt.close()


# ======================================
# Final Message
# ======================================

print("\n========================================")
print("Training Completed Successfully!")
print("Best Model Saved :", MODEL_PATH)
print("Accuracy Graph   : accuracy.png")
print("Loss Graph       : loss.png")
print("========================================")