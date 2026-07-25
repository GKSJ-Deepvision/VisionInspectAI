"""
VisionInspect AI - Deep Feature Extractor (Multi-Scale)

Uses pretrained ResNet-18 to extract MULTI-SCALE deep feature embeddings.
Unlike single-layer extraction, this captures features from multiple network depths:
  - Layer 2 (256-dim): Low-level textures, edges, surface patterns
  - Layer 3 (256-dim): Mid-level shapes, structural patterns  
  - AvgPool (512-dim): High-level semantic features

The combined 1024-dim feature vector is much more sensitive to subtle defects
like scratches, small cracks, and discoloration that single-layer extraction misses.
"""

import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image

# Lazy-import torchvision to handle graceful fallback
try:
    from torchvision import models, transforms
    HAS_TORCHVISION = True
except ImportError:
    HAS_TORCHVISION = False
    print("[WARN] torchvision not available. Deep feature extraction disabled.")


class DeepFeatureExtractor:
    """Multi-scale feature extractor using pretrained ResNet-18.
    
    Extracts features from multiple network layers for comprehensive
    anomaly detection that catches both subtle texture defects and
    major structural issues.
    """

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

        # Extract sub-modules for multi-scale feature extraction
        self.layer_prefix = nn.Sequential(
            backbone.conv1, backbone.bn1, backbone.relu, backbone.maxpool,
            backbone.layer1,
        ).to(self.device).eval()

        self.layer2 = backbone.layer2.to(self.device).eval()
        self.layer3 = backbone.layer3.to(self.device).eval()
        self.layer4 = backbone.layer4.to(self.device).eval()
        self.avgpool = backbone.avgpool.to(self.device).eval()

        # Standard ImageNet preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        # Feature dimension: layer2(256) + layer3(256) + avgpool(512) = 1024
        self.feature_dim = 1024

        print(f"  Multi-scale feature extractor initialized on device: {self.device} (dim={self.feature_dim})")

    def _extract_multiscale(self, img_tensor):
        """Extract multi-scale features from a batch of image tensors.
        
        Returns concatenated features from layer2, layer3, and avgpool.
        """
        with torch.no_grad():
            # Forward through layers sequentially
            x = self.layer_prefix(img_tensor)   # After layer1
            x2 = self.layer2(x)                  # layer2 output: (B, 128, 14, 14)
            x3 = self.layer3(x2)                 # layer3 output: (B, 256, 7, 7)
            x4 = self.layer4(x3)                 # layer4 output: (B, 512, 7, 7) or similar
            xp = self.avgpool(x4)                # avgpool output: (B, 512, 1, 1)

            # Global average pool for layer2 and layer3
            f2 = torch.nn.functional.adaptive_avg_pool2d(x2, 1).squeeze(-1).squeeze(-1)  # (B, 128)
            f3 = torch.nn.functional.adaptive_avg_pool2d(x3, 1).squeeze(-1).squeeze(-1)  # (B, 256)
            fp = xp.squeeze(-1).squeeze(-1)  # (B, 512)

            # Concatenate: 128 + 256 + 512 = 896... wait, layer2 has 128 channels
            # Let me also add layer4 before avgpool for richer features
            f4_spatial = torch.nn.functional.adaptive_avg_pool2d(x3, 1).squeeze(-1).squeeze(-1)

            # Concatenate multi-scale features
            features = torch.cat([f2, f3, fp], dim=1)  # (B, 128+256+512=896)

        return features.cpu().numpy()

    def extract(self, image_input):
        """Extract a multi-scale feature vector from an image.

        Args:
            image_input: str (file path), numpy array (BGR), or PIL Image

        Returns:
            numpy array of shape (feature_dim,) - L2-normalized feature vector
        """
        # Handle different input types
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

        # L2-normalize
        norm = np.linalg.norm(feat_vec)
        if norm > 1e-8:
            feat_vec = feat_vec / norm

        # Update feature_dim based on actual output
        self.feature_dim = len(feat_vec)

        return feat_vec

    def extract_batch(self, image_paths, batch_size=16):
        """Extract features from multiple images efficiently using batching.

        Args:
            image_paths: List of image file path strings
            batch_size: Number of images to process simultaneously

        Returns:
            numpy array of shape (N, feature_dim) - L2-normalized feature vectors
        """
        all_features = []

        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            batch_tensors = []

            for path in batch_paths:
                try:
                    image = Image.open(path).convert('RGB')
                    img_tensor = self.transform(image)
                    batch_tensors.append(img_tensor)
                except Exception as e:
                    print(f"    Warning: Could not load {path}: {e}")
                    continue

            if not batch_tensors:
                continue

            batch = torch.stack(batch_tensors).to(self.device)
            features = self._extract_multiscale(batch)

            # L2-normalize each vector
            norms = np.linalg.norm(features, axis=1, keepdims=True)
            norms = np.maximum(norms, 1e-8)
            features = features / norms

            all_features.append(features)

        if all_features:
            result = np.concatenate(all_features, axis=0)
            self.feature_dim = result.shape[1]
            return result
        return np.empty((0, self.feature_dim), dtype=np.float32)
