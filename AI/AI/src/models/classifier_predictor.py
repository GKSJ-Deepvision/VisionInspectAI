import json
from pathlib import Path

import torch
import torch.nn.functional as F

from PIL import Image
from torchvision import transforms

import data.config as config
from models.defect_classifier import build_classifier


class ClassifierPredictor:

    def __init__(self):

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        with open(
            config.CLASSIFIER_LABELS_PATH,
            "r",
            encoding="utf-8",
        ) as file:

            self.class_to_index = json.load(file)

        self.index_to_class = {
            value: key
            for key, value in self.class_to_index.items()
        }

        self.model = build_classifier(
            len(self.class_to_index)
        )

        checkpoint = torch.load(
            config.CLASSIFIER_MODEL_PATH,
            map_location=self.device,
        )

        if "model" in checkpoint:
            self.model.load_state_dict(
                checkpoint["model"]
            )
        else:
            self.model.load_state_dict(
                checkpoint
            )

        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose(
            [
                transforms.Resize(config.CLASSIFIER_IMAGE_SIZE),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    def predict(self, image_path):

        image = Image.open(image_path).convert("RGB")

        image = self.transform(image)

        image = image.unsqueeze(0).to(self.device)

        with torch.no_grad():

            outputs = self.model(image)

            probabilities = F.softmax(
                outputs,
                dim=1,
            )

            confidence, prediction = torch.max(
                probabilities,
                dim=1,
            )

        predicted_class = self.index_to_class[
            prediction.item()
        ]

        category, defect = predicted_class.split(
            "_",
            1,
        )

        return {
            "predicted_class": predicted_class,
            "category": category,
            "defect": defect,
            "confidence": confidence.item(),
        }