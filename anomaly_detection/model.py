import os
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models

from anomaly_detection import config


class ResNetFeatureExtractor(nn.Module):
    """
    Multi-scale Feature Extractor using pretrained ResNet18 or ResNet50 backbone.
    Extracts intermediate feature maps from specified layer blocks (e.g. layer1, layer2, layer3).
    """
    def __init__(self, backbone: str = "resnet18", layer_names: list = None):
        super().__init__()
        self.backbone_name = backbone
        self.layer_names = layer_names or ["layer1", "layer2", "layer3"]

        if backbone == "resnet18":
            weights = models.ResNet18_Weights.DEFAULT
            self.model = models.resnet18(weights=weights)
        elif backbone == "resnet50":
            weights = models.ResNet50_Weights.DEFAULT
            self.model = models.resnet50(weights=weights)
        else:
            raise ValueError(f"Unsupported backbone: {backbone}")

        # Freeze backbone parameters
        for param in self.model.parameters():
            param.requires_grad = False
        self.model.eval()

        self.extracted_features = {}
        self._register_hooks()

    def _register_hooks(self):
        def get_hook(name):
            def hook(module, input, output):
                self.extracted_features[name] = output
            return hook

        for name, module in self.model.named_children():
            if name in self.layer_names:
                module.register_forward_hook(get_hook(name))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Extracts and aligns multi-scale feature maps into a single concatenated tensor.
        Returns tensor of shape (B, Total_Channels, H_L1, W_L1).
        """
        self.extracted_features.clear()
        _ = self.model(x)

        feature_maps = [self.extracted_features[name] for name in self.layer_names]
        target_size = feature_maps[0].shape[-2:]  # H, W of layer1

        resized_features = []
        for fmap in feature_maps:
            if fmap.shape[-2:] != target_size:
                fmap = F.interpolate(fmap, size=target_size, mode="bilinear", align_corners=False)
            resized_features.append(fmap)

        # Concatenate along channel dimension
        return torch.cat(resized_features, dim=1)


class PaDiM(nn.Module):
    """
    Patch Distribution Modeling (PaDiM) for Industrial Anomaly Detection.

    Framework:
        1. Feature Extraction: Extracts multi-scale feature maps from pre-trained ResNet backbone.
        2. Channel Subsampling: Randomly selects `d` channels for memory efficiency and speed.
        3. Gaussian Modeling: Fits spatial multivariate Gaussian distributions N(μ, Σ) on GOOD training samples.
        4. Anomaly Scoring: Computes per-pixel Mahalanobis distance on test images.
        5. Smoothing: Applies 2D Gaussian filter to yield high-resolution anomaly heatmaps.
    """
    def __init__(
        self,
        backbone: str = "resnet18",
        layer_names: list = None,
        d_dim: int = 100,
        sigma: float = 4.0,
        epsilon: float = 0.01,
        device: str = None
    ):
        super().__init__()
        self.device = torch.device(device or config.DEVICE)
        self.d_dim = d_dim
        self.sigma = sigma
        self.epsilon = epsilon

        self.feature_extractor = ResNetFeatureExtractor(
            backbone=backbone,
            layer_names=layer_names or ["layer1", "layer2", "layer3"]
        ).to(self.device)

        self.selected_idx = None
        self.mean = None                # Shape: (d_dim, H', W')
        self.inv_covariance = None     # Shape: (H', W', d_dim, d_dim)
        self.threshold = float(config.ANOMALY_THRESHOLD)
        self.gaussian_kernel = self._create_gaussian_kernel(sigma=self.sigma).to(self.device)

    def _create_gaussian_kernel(self, kernel_size: int = 21, sigma: float = 4.0) -> torch.Tensor:
        coords = torch.arange(kernel_size, dtype=torch.float32) - kernel_size // 2
        g = torch.exp(-(coords ** 2) / (2 * sigma ** 2))
        kernel_2d = g[:, None] * g[None, :]
        kernel_2d = kernel_2d / kernel_2d.sum()
        return kernel_2d.unsqueeze(0).unsqueeze(0)

    def _subsample_channels(self, total_channels: int):
        if self.selected_idx is None:
            # Deterministic seed for reproducible channel selection
            rng = np.random.RandomState(1024)
            self.selected_idx = torch.tensor(
                rng.choice(total_channels, self.d_dim, replace=False),
                dtype=torch.long,
                device=self.device
            )

    @torch.no_grad()
    def fit(self, dataloader) -> None:
        """
        Fits spatial multivariate Gaussian distributions N(μ, Σ) on normal (GOOD) training samples.
        Computes mean vector and regularized inverse covariance matrix at each grid position (i, j).
        """
        self.feature_extractor.eval()
        feature_list = []

        print(f"[PaDiM] Extracting features from normal training images on {self.device}...")
        for imgs, _, _, _ in dataloader:
            imgs = imgs.to(self.device, non_blocking=True)
            feats = self.feature_extractor(imgs)  # (B, Total_Channels, H', W')

            self._subsample_channels(feats.shape[1])
            feats = torch.index_select(feats, 1, self.selected_idx)  # (B, d_dim, H', W')
            feature_list.append(feats.cpu())

        # Concatenate all training features along batch dimension: (N, d_dim, H', W')
        all_feats = torch.cat(feature_list, dim=0)
        N, C, H, W = all_feats.shape

        print(f"[PaDiM] Fitting Gaussian distribution over N={N} normal samples (Grid: {H}x{W}, Channels: {C})...")

        # 1. Compute Spatial Mean Vector μ: (C, H, W)
        self.mean = torch.mean(all_feats, dim=0).to(self.device)

        # 2. Reshape features for spatial covariance computation: (N, C, H*W) -> (H*W, C, N)
        feats_flat = all_feats.view(N, C, H * W).permute(2, 1, 0)  # (HW, C, N)
        mean_flat = self.mean.view(C, H * W).permute(1, 0).unsqueeze(2)  # (HW, C, 1)

        # Center features around mean
        centered = feats_flat - mean_flat  # (HW, C, N)

        # Compute Covariance Matrix Σ at each location: (HW, C, C)
        cov = torch.bmm(centered, centered.permute(0, 2, 1)) / (N - 1)

        # Add regularization term εI for numerical stability
        identity = torch.eye(C).unsqueeze(0).expand(H * W, C, C)
        reg_cov = cov + self.epsilon * identity

        # Compute Inverse Covariance Matrix Σ⁻¹ at each location
        inv_cov = torch.linalg.inv(reg_cov)  # (HW, C, C)
        self.inv_covariance = inv_cov.view(H, W, C, C).to(self.device)

        print("[PaDiM] Gaussian distribution modeling completed successfully.")

    @torch.no_grad()
    def predict_anomaly_map(self, input_tensor: torch.Tensor) -> torch.Tensor:
        """
        Calculates per-pixel Mahalanobis distance anomaly scores and applies Gaussian smoothing.

        Args:
            input_tensor (Tensor): Input image tensor of shape (B, 3, H_orig, W_orig).

        Returns:
            anomaly_map (Tensor): Smoothed anomaly score map of shape (B, 1, H_orig, W_orig).
        """
        self.feature_extractor.eval()
        input_tensor = input_tensor.to(self.device, non_blocking=True)

        feats = self.feature_extractor(input_tensor)
        self._subsample_channels(feats.shape[1])
        feats = torch.index_select(feats, 1, self.selected_idx)  # (B, C, H', W')

        B, C, H_grid, W_grid = feats.shape

        # Initialize fallback baseline statistics if model is un-fitted
        if self.mean is None or self.inv_covariance is None:
            self.mean = torch.zeros(C, H_grid, W_grid, device=self.device)
            identity = torch.eye(C, device=self.device).unsqueeze(0).unsqueeze(0).expand(H_grid, W_grid, C, C)
            self.inv_covariance = identity

        # Difference vector δ = x - μ : (B, C, H', W')
        delta = feats - self.mean.unsqueeze(0)

        # Compute Mahalanobis distance M(i,j) = sqrt((x - μ)^T Σ⁻¹ (x - μ))
        # delta: (B, C, H', W'), inv_covariance: (H', W', C, C)
        # Using einsum for fast vectorized computation
        dist_sq = torch.einsum('bchw,hwcd,bdhw->bhw', delta, self.inv_covariance, delta)
        dist = torch.sqrt(torch.clamp(dist_sq, min=0.0)).unsqueeze(1)  # (B, 1, H', W')


        # Bilinear interpolation back to input image spatial dimensions (H_orig, W_orig)
        dist_upsampled = F.interpolate(
            dist, size=input_tensor.shape[-2:], mode="bilinear", align_corners=False
        )

        # Apply 2D Gaussian smoothing to reduce high-frequency noise
        padding = self.gaussian_kernel.shape[-1] // 2
        anomaly_map = F.conv2d(dist_upsampled, self.gaussian_kernel, padding=padding)

        return anomaly_map

    def save(self, filepath: [str, Path]) -> None:
        """Saves fitted PaDiM statistics to disk."""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        torch.save({
            "mean": self.mean.cpu() if self.mean is not None else None,
            "inv_covariance": self.inv_covariance.cpu() if self.inv_covariance is not None else None,
            "selected_idx": self.selected_idx.cpu() if self.selected_idx is not None else None,
            "threshold": self.threshold,
            "d_dim": self.d_dim,
            "sigma": self.sigma,
            "epsilon": self.epsilon
        }, filepath)
        print(f"[PaDiM] Model saved to: {filepath}")

    def load(self, filepath: [str, Path]) -> bool:
        """Loads fitted PaDiM statistics from disk."""
        filepath = Path(filepath)
        if not filepath.exists():
            print(f"[PaDiM] Warning: Weights file not found at {filepath}")
            return False

        try:
            data = torch.load(filepath, map_location=self.device)
            self.mean = data["mean"].to(self.device)
            self.inv_covariance = data["inv_covariance"].to(self.device)
            self.selected_idx = data["selected_idx"].to(self.device)
            self.threshold = data.get("threshold", float(config.ANOMALY_THRESHOLD))
            self.d_dim = data.get("d_dim", self.d_dim)
            self.sigma = data.get("sigma", self.sigma)
            self.epsilon = data.get("epsilon", self.epsilon)
            self.gaussian_kernel = self._create_gaussian_kernel(sigma=self.sigma).to(self.device)
            print(f"[PaDiM] Loaded fitted model statistics from: {filepath.name}")
            return True
        except Exception as e:
            print(f"[PaDiM] Error loading model from {filepath}: {e}")
            return False


# Legacy Autoencoder class provided for backward compatibility if referenced elsewhere
class AnomalyAutoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, 4, stride=2, padding=1), nn.BatchNorm2d(32), nn.LeakyReLU(0.2),
            nn.Conv2d(32, 64, 4, stride=2, padding=1), nn.BatchNorm2d(64), nn.LeakyReLU(0.2),
            nn.Conv2d(64, 128, 4, stride=2, padding=1), nn.BatchNorm2d(128), nn.LeakyReLU(0.2),
            nn.Conv2d(128, 256, 4, stride=2, padding=1), nn.BatchNorm2d(256), nn.LeakyReLU(0.2)
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.ConvTranspose2d(32, 3, 4, stride=2, padding=1), nn.Sigmoid()
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

    def compute_anomaly_map(self, x, use_ssim=True):
        recon = self.forward(x)
        diff = torch.abs(x - recon)
        anomaly_map = diff.mean(dim=1, keepdim=True)
        score = anomaly_map.mean()
        return recon, anomaly_map, score


