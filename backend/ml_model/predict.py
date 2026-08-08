import os
import torch
from PIL import Image
from torchvision import transforms


from ml_model.model import DefectModel

# Class names
classes = [
    "good",
    "broken_large",
    "broken_small",
    "contamination"
]

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "saved_model.pth")

model = DefectModel()

model.load_state_dict(
    torch.load(model_path, map_location=torch.device("cpu"))
)

model.eval()

# Image transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def predict_defect(image_path):

    image = Image.open(image_path).convert("RGB")

    image = transform(image)

    image = image.unsqueeze(0)

    with torch.no_grad():

        output = model(image)

        probabilities = torch.softmax(output, dim=1)

        confidence, predicted = torch.max(probabilities, 1)

    prediction = classes[predicted.item()]

    confidence = round(confidence.item() * 100, 2)

    if prediction == "good":
        severity = "Low"
    elif prediction == "broken_small":
        severity = "Medium"
    elif prediction == "contamination":
        severity = "High"
    else:
        severity = "Critical"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "severity": severity
    }