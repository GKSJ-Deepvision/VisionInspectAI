"""
VisionInspect AI - Deep Feature Extractor (Multi-Scale)
"""

import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image

try:
    from torchvision import models, transforms
    HAS_TORCHVISION = True
except ImportError:
    HAS_TORCHVISION = False
    print("[WARN] torchvision not available. Deep feature extraction disabled.")


class DeepFeatureExtractor:
    """Multi-scale feature extractor using pretrained ResNet-18."""

    def __init__(self, device=None):
        if not HAS_TORCHVISION:
            raise ImportError("torchvision is required for deep feature extraction")

        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        # Load pretrained ResNet-18
        try:
            weights = models.ResNet18_Weights.DEFAULT
            backbone = models.resnet18(weights=weights)
        except AttributeError:
            backbone = models.resnet18(pretrained=True)

        backbone.eval()

        self.layer_prefix = nn.Sequential(
            backbone.conv1, backbone.bn1, backbone.relu, backbone.maxpool,
            backbone.layer1,
        ).to(self.device).eval()

        self.layer2 = backbone.layer2.to(self.device).eval()
        self.layer3 = backbone.layer3.to(self.device).eval()
        self.layer4 = backbone.layer4.to(self.device).eval()
        self.avgpool = backbone.avgpool.to(self.device).eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        # Layer 2 (128) + Layer 3 (256) + AvgPool (512) = 896
        self.feature_dim = 896
        print(f" Multi-scale feature extractor initialized on device: {self.device} (dim={self.feature_dim})")

    def _extract_multiscale(self, img_tensor):
        with torch.no_grad():
            x = self.layer_prefix(img_tensor)   # Layer 1
            x2 = self.layer2(x)                  # Layer 2: (B, 128, 28, 28)
            x3 = self.layer3(x2)                 # Layer 3: (B, 256, 14, 14)
            x4 = self.layer4(x3)                 # Layer 4: (B, 512, 7, 7)
            xp = self.avgpool(x4)                # Avgpool: (B, 512, 1, 1)

            f2 = torch.nn.functional.adaptive_avg_pool2d(x2, 1).squeeze(-1).squeeze(-1)  # (B, 128)
            f3 = torch.nn.functional.adaptive_avg_pool2d(x3, 1).squeeze(-1).squeeze(-1)  # (B, 256)
            fp = xp.squeeze(-1).squeeze(-1)                                              # (B, 512)

            features = torch.cat([f2, f3, fp], dim=1)  # (B, 896)

        return features.cpu().numpy()

    def extract(self, image_input):
        if isinstance(image_input, str):
            image = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, np.ndarray):
            image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        elif isinstance(image_input, Image.Image):
            image = image_input.convert('RGB')
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        features = self._extract_multiscale(img_tensor)
        feat_vec = features.squeeze(0)

        norm = np.linalg.norm(feat_vec)
        if norm > 1e-8:
            feat_vec = feat_vec / norm

        self.feature_dim = len(feat_vec)
        return feat_vec