from pathlib import Path
from PIL import Image

import torch
import torch.nn as nn
from torchvision import models, transforms

# -----------------------
# Configuration
# -----------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "best_model.pth"

CLASS_NAMES = ["DEFECT", "GOOD"]

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------
# Load Model
# -----------------------

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)

model.load_state_dict(
    torch.load(MODEL_PATH, map_location=device)
)

model.to(device)
model.eval()

# -----------------------
# Image Transform
# -----------------------

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# -----------------------
# Prediction Function
# -----------------------

def predict_image(image_path):

    image = Image.open(image_path).convert("RGB")

    image = transform(image)

    image = image.unsqueeze(0)

    image = image.to(device)

    with torch.no_grad():

        output = model(image)

        probabilities = torch.softmax(output, dim=1)

        confidence, predicted = torch.max(probabilities, 1)

    return {
        "prediction": CLASS_NAMES[predicted.item()],
        "confidence": round(confidence.item() * 100, 2)
    }