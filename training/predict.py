import os
import numpy as np
import tensorflow as tf

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# ======================================
# Configuration
# ======================================

MODEL_PATH = "best_model.keras"

IMG_SIZE = (224, 224)

CLASS_NAMES = ["Defective", "No_Defect"]


# ======================================
# Load Model
# ======================================

print("Loading Model...")

model = load_model(MODEL_PATH)

print("Model Loaded Successfully!\n")


# ======================================
# Prediction Function
# ======================================

def predict_image(image_path):

    img = image.load_img(image_path, target_size=IMG_SIZE)

    img_array = image.img_to_array(img)

    img_array = img_array / 255.0

    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array, verbose=0)[0][0]

    if prediction < 0.5:
        predicted_class = "Defective"
        confidence = (1 - prediction) * 100
    else:
        predicted_class = "No_Defect"
        confidence = prediction * 100

    return predicted_class, confidence


# ======================================
# Main
# ======================================

if __name__ == "__main__":

    image_path = input("Enter Image Path: ").strip()

    if not os.path.exists(image_path):
        print("\nImage not found!")
        exit()

    predicted_class, confidence = predict_image(image_path)

    print("\n==============================")
    print(f"Prediction : {predicted_class}")
    print(f"Confidence : {confidence:.2f}%")
    print("==============================")