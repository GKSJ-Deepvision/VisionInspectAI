"""
VisionInspect AI - Deep Feature Extractor (WideResNet-50-2 + PatchCore)

Provides BOTH global and patch-level features for anomaly detection.
Patch-level features are the key to 95%+ accuracy - they capture LOCAL
defects that global features miss (small scratches, tiny cracks, etc).

Architecture:
  WideResNet-50-2 backbone with multi-scale extraction:
  - Layer 2: (B, 512, 28, 28) -> texture and edge patterns
  - Layer 3: (B, 1024, 14, 14) -> structural patterns
  - AvgPool: (B, 2048, 1, 1) -> high-level semantics

  Global features: concat(pool(layer2), pool(layer3), avgpool) = 3584-dim
  Patch features: concat(resize(layer2), layer3) at 14x14 = 196 patches of 1536-dim
"""

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

try:
    from torchvision import models, transforms
    HAS_TORCHVISION = True
except ImportError:
    HAS_TORCHVISION = False
    print("[WARN] torchvision not available.")


class DeepFeatureExtractor:
    """Multi-scale feature extractor with PatchCore-style patch features."""

    def __init__(self, device=None):
        if not HAS_TORCHVISION:
            raise ImportError("torchvision is required")

        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        # Load pretrained WideResNet-50-2
        try:
            weights = models.Wide_ResNet50_2_Weights.DEFAULT
            backbone = models.wide_resnet50_2(weights=weights)
        except AttributeError:
            backbone = models.wide_resnet50_2(pretrained=True)

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
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self.feature_dim = 3584        # Global feature dimension
        self.patch_dim = 1536           # Per-patch feature dimension
        self.n_patches = 196            # 14 x 14 spatial grid
        print(f"  WRN-50-2 PatchCore extractor on: {self.device} (global={self.feature_dim}, patch={self.patch_dim}x{self.n_patches})")

    def _to_tensor(self, image_input):
        """Convert any image input to a preprocessed tensor."""
        if isinstance(image_input, str):
            image = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, np.ndarray):
            image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        elif isinstance(image_input, Image.Image):
            image = image_input.convert('RGB')
        else:
            raise ValueError(f"Unsupported input type: {type(image_input)}")
        return self.transform(image).unsqueeze(0).to(self.device)

    def _forward(self, img_tensor):
        """Single forward pass returning intermediate features."""
        with torch.no_grad():
            x = self.layer_prefix(img_tensor)
            x2 = self.layer2(x)         # (B, 512, 28, 28)
            x3 = self.layer3(x2)        # (B, 1024, 14, 14)
            x4 = self.layer4(x3)        # (B, 2048, 7, 7)
            xp = self.avgpool(x4)       # (B, 2048, 1, 1)
        return x2, x3, xp

    def extract(self, image_input):
        """Extract global feature vector (3584-dim). Used for category matching."""
        img_tensor = self._to_tensor(image_input)
        x2, x3, xp = self._forward(img_tensor)

        with torch.no_grad():
            f2 = F.adaptive_avg_pool2d(x2, 1).flatten(1)   # (1, 512)
            f3 = F.adaptive_avg_pool2d(x3, 1).flatten(1)   # (1, 1024)
            fp = xp.flatten(1)                               # (1, 2048)
            features = torch.cat([f2, f3, fp], dim=1)        # (1, 3584)

        feat_vec = features.squeeze(0).cpu().numpy()
        norm = np.linalg.norm(feat_vec)
        if norm > 1e-8:
            feat_vec = feat_vec / norm
        return feat_vec

    def extract_patches(self, image_input):
        """Extract patch-level features (196 patches x 1536-dim).
        
        This is the key to PatchCore-style anomaly detection.
        Each patch corresponds to a 16x16 region of the 224x224 input image.
        Local defects that are invisible in global features become detectable
        when comparing at the patch level.
        """
        img_tensor = self._to_tensor(image_input)
        x2, x3, _ = self._forward(img_tensor)

        with torch.no_grad():
            # Resize layer2 to match layer3 spatial dims
            x2_resized = F.adaptive_avg_pool2d(x2, (14, 14))  # (1, 512, 14, 14)
            # Concatenate layer2 + layer3 for rich patch features
            patches = torch.cat([x2_resized, x3], dim=1)       # (1, 1536, 14, 14)
            # Reshape to (196, 1536)
            patches = patches.squeeze(0).permute(1, 2, 0).reshape(-1, 1536)

        return patches.cpu().numpy()

    def extract_both(self, image_input):
        """Extract BOTH global (3584-dim) and patch (196x1536) features in one pass."""
        img_tensor = self._to_tensor(image_input)
        x2, x3, xp = self._forward(img_tensor)

        with torch.no_grad():
            # Global features
            f2 = F.adaptive_avg_pool2d(x2, 1).flatten(1)
            f3 = F.adaptive_avg_pool2d(x3, 1).flatten(1)
            fp = xp.flatten(1)
            global_feat = torch.cat([f2, f3, fp], dim=1).squeeze(0).cpu().numpy()

            # Patch features
            x2_resized = F.adaptive_avg_pool2d(x2, (14, 14))
            patch_feats = torch.cat([x2_resized, x3], dim=1)
            patch_feats = patch_feats.squeeze(0).permute(1, 2, 0).reshape(-1, 1536).cpu().numpy()

        # Normalize global features
        norm = np.linalg.norm(global_feat)
        if norm > 1e-8:
            global_feat = global_feat / norm

        return global_feat, patch_feats

    def extract_batch(self, image_paths, batch_size=8):
        """Extract global features from multiple images using batching."""
        all_features = []
        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            batch_tensors = []
            for path in batch_paths:
                try:
                    image = Image.open(path).convert('RGB')
                    batch_tensors.append(self.transform(image))
                except Exception as e:
                    print(f"    Warning: Could not load {path}: {e}")
                    continue
            if not batch_tensors:
                continue
            batch = torch.stack(batch_tensors).to(self.device)
            with torch.no_grad():
                x = self.layer_prefix(batch)
                x2 = self.layer2(x)
                x3 = self.layer3(x2)
                x4 = self.layer4(x3)
                xp = self.avgpool(x4)
                f2 = F.adaptive_avg_pool2d(x2, 1).flatten(1)
                f3 = F.adaptive_avg_pool2d(x3, 1).flatten(1)
                fp = xp.flatten(1)
                features = torch.cat([f2, f3, fp], dim=1)
            features = features.cpu().numpy()
            norms = np.linalg.norm(features, axis=1, keepdims=True)
            features = features / np.maximum(norms, 1e-8)
            all_features.append(features)
        if all_features:
            return np.concatenate(all_features, axis=0)
        return np.empty((0, self.feature_dim), dtype=np.float32)

    def extract_patches_batch(self, image_paths, batch_size=8):
        """Extract patch features from multiple images. Returns list of (196, 1536) arrays."""
        all_patches = []
        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            batch_tensors = []
            valid_indices = []
            for idx, path in enumerate(batch_paths):
                try:
                    image = Image.open(path).convert('RGB')
                    batch_tensors.append(self.transform(image))
                    valid_indices.append(idx)
                except Exception:
                    continue
            if not batch_tensors:
                continue
            batch = torch.stack(batch_tensors).to(self.device)
            with torch.no_grad():
                x = self.layer_prefix(batch)
                x2 = self.layer2(x)
                x3 = self.layer3(x2)
                x2_r = F.adaptive_avg_pool2d(x2, (14, 14))
                patches = torch.cat([x2_r, x3], dim=1)  # (B, 1536, 14, 14)
                patches = patches.permute(0, 2, 3, 1).reshape(len(batch_tensors), -1, 1536)
            for j in range(len(batch_tensors)):
                all_patches.append(patches[j].cpu().numpy())
        return all_patches
