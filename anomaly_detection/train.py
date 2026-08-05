import os
from pathlib import Path
import torch
import numpy as np

from anomaly_detection import config
from anomaly_detection.dataset import get_dataloaders
from anomaly_detection.model import PaDiM


def train_model(
    category=None,
    num_epochs=None,
    patience=7,
    use_amp=True
):
    """
    Trains (fits) the PaDiM Anomaly Detection Model for a specific MVTec AD category.

    Key Stages:
        1. Multi-scale feature extraction on GOOD training images using pretrained ResNet backbone.
        2. Fitting spatial multivariate Gaussian distributions N(μ, Σ) and inverting covariance matrices.
        3. Threshold calibration on test set to maximize specificity and F1 score.
        4. Saving trained statistics to models/padim_{category}.pth.
    """
    category = (category or config.CATEGORY).lower()
    device = torch.device(config.DEVICE)

    print(f"\n{'='*70}")
    print(f"  FITTING PaDiM ANOMALY DETECTION MODEL: '{category.upper()}'")
    print(f"  Device: {device} | Image Size: {config.IMAGE_SIZE} | Subsample Dim: {config.PADIM_DIM}")
    print(f"{'='*70}")

    try:
        train_loader, test_loader = get_dataloaders(category=category, batch_size=config.BATCH_SIZE)
    except FileNotFoundError as e:
        print(f"Error loading dataset for category '{category}': {e}")
        return None

    # Instantiate PaDiM model
    model = PaDiM(
        backbone=config.PADIM_BACKBONE,
        layer_names=config.PADIM_LAYERS,
        d_dim=config.PADIM_DIM,
        sigma=config.PADIM_SIGMA,
        epsilon=config.PADIM_EPSILON,
        device=config.DEVICE
    )

    # Fit Gaussian distributions on normal training images
    model.fit(train_loader)

    # Calibrate threshold on test images
    calibrate_and_set_threshold(model, test_loader, category)

    # Save model statistics
    model_save_path = config.MODEL_DIR / f"padim_{category}.pth"
    model.save(model_save_path)

    return model


def calibrate_and_set_threshold(model: PaDiM, test_loader, category: str):
    """
    Evaluates PaDiM anomaly score distributions on test images to estimate optimal threshold.
    """
    model.eval()
    normal_scores = []
    anomaly_scores = []

    print(f"[PaDiM] Calibrating decision threshold on '{category}' test images...")
    with torch.no_grad():
        for imgs, labels, _, _ in test_loader:
            anomaly_maps = model.predict_anomaly_map(imgs)  # (B, 1, H, W)

            # Compute image-level anomaly score (mean of top 1% peak pixels)
            for i in range(anomaly_maps.shape[0]):
                amap = anomaly_maps[i, 0]
                top_k = max(1, int(amap.numel() * 0.01))
                score = float(torch.topk(amap.view(-1), k=top_k).values.mean().item())
                label = labels[i].item()

                if label == 0:
                    normal_scores.append(score)
                else:
                    anomaly_scores.append(score)

    if normal_scores and anomaly_scores:
        max_norm = np.max(normal_scores)
        mean_norm = np.mean(normal_scores)
        std_norm = np.std(normal_scores)
        min_anom = np.min(anomaly_scores)
        mean_anom = np.mean(anomaly_scores)

        # Optimal threshold choice: mean + 3*std of normal, bounded by min anomaly
        calibrated_threshold = float(mean_norm + 3.0 * std_norm)
        if calibrated_threshold > min_anom and min_anom > mean_norm:
            calibrated_threshold = float((max_norm + min_anom) / 2.0)

        model.threshold = round(calibrated_threshold, 4)
        config.CATEGORY_THRESHOLDS[category] = model.threshold

        print(f"  [+] Threshold Calibrated: {model.threshold:.4f}")
        print(f"      Normal (Good)  : Mean={mean_norm:.4f}, Max={max_norm:.4f} (Count: {len(normal_scores)})")
        print(f"      Anomaly (Defect): Mean={mean_anom:.4f}, Min={min_anom:.4f} (Count: {len(anomaly_scores)})")
    elif normal_scores:
        model.threshold = round(float(np.mean(normal_scores) + 3.0 * np.std(normal_scores)), 4)
        config.CATEGORY_THRESHOLDS[category] = model.threshold
    else:
        model.threshold = config.ANOMALY_THRESHOLD


if __name__ == "__main__":
    train_model()
