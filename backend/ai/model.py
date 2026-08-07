import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# ==========================================
# Model Configuration
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "../../training/best_model.keras"
)

IMG_SIZE = (224, 224)

# ==========================================
# Load Trained Model
# ==========================================

model = load_model(MODEL_PATH)

# ==========================================
# Prediction Function
# ==========================================

def predict_defect(image_path):

    # Load Image
    img = image.load_img(
        image_path,
        target_size=IMG_SIZE
    )

    # Convert to Array
    img = image.img_to_array(img)

    # Normalize
    img = img / 255.0

    # Expand Dimensions
    img = np.expand_dims(img, axis=0)

    # Predict
    prediction = float(model.predict(img, verbose=0)[0][0])

    print("=" * 50)
    print("Prediction Value :", prediction)
    print("=" * 50)

    # Classification
    if prediction < 0.5:
        defect = "Defective"
        confidence = round((1 - prediction) * 100, 2)
    else:
        defect = "No Defect"
        confidence = round(prediction * 100, 2)

    # ==========================================
    # Defect Categorization
    # ==========================================

    category = "No Defect"
    severity = "None"
    risk = "No Risk"

    if defect == "Defective":

        if confidence < 70:
            category = "Minor Defect"
            severity = "Low"
            risk = "Low Risk"

        elif confidence < 90:
            category = "Moderate Defect"
            severity = "Medium"
            risk = "Medium Risk"

        else:
            category = "Critical Defect"
            severity = "High"
            risk = "High Risk"

    # ==========================================
    # Return Prediction Result
    # ==========================================

    return {
        "defect": defect,
        "category": category,
        "severity": severity,
        "risk": risk,
        "confidence": confidence
    }