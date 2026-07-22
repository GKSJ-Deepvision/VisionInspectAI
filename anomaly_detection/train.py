import os
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

from . import config
from .dataset import get_dataloaders
from .model import AnomalyAutoencoder, SSIML1Loss

# Enable cuDNN autotuner for max GPU performance on fixed 128x128 input tensors
if torch.cuda.is_available():
    torch.backends.cudnn.benchmark = True


def train_model(
    category=None,
    num_epochs=None,
    patience=7,
    use_amp=True
):
    """
    Trains the Convolutional Anomaly Autoencoder for a specific MVTec AD category.

    Key Features:
        - AdamW optimizer with weight decay regularization
        - Linear Warmup + Cosine Annealing learning rate schedule
        - PyTorch Automatic Mixed Precision (AMP) for 2x GPU throughput
        - Early Stopping based on validation reconstruction error
        - Automatic best checkpoint saving
    """
    category = (category or config.CATEGORY).lower()
    num_epochs = num_epochs or config.NUM_EPOCHS
    device = torch.device(config.DEVICE)

    print(f"\n{'='*70}")
    print(f"  TRAINING ANOMALY AUTOENCODER: '{category.upper()}' ({num_epochs} Epochs)")
    print(f"  Device: {device} | Image Size: {config.IMAGE_SIZE} | Batch Size: {config.BATCH_SIZE}")
    print(f"  AMP Speedup: {use_amp and device.type == 'cuda'} | Early Stop Patience: {patience}")
    print(f"{'='*70}")

    try:
        train_loader, test_loader = get_dataloaders(category=category, batch_size=config.BATCH_SIZE)
    except FileNotFoundError as e:
        print(f"Error loading dataset for category '{category}': {e}")
        return None

    # Instantiate Autoencoder model
    model = AnomalyAutoencoder().to(device)

    # Hybrid SSIM + L1 loss for reconstruction fidelity
    criterion = SSIML1Loss(alpha=0.4)

    # AdamW optimizer with weight decay for better regularization
    optimizer = optim.AdamW(model.parameters(), lr=config.LEARNING_RATE, weight_decay=1e-4)

    # Cosine Annealing with Warmup scheduler
    warmup_epochs = min(3, max(1, num_epochs // 5))
    cosine_scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=max(1, num_epochs - warmup_epochs), eta_min=1e-5
    )

    # Automatic Mixed Precision Scaler
    scaler = torch.cuda.amp.GradScaler(enabled=(use_amp and device.type == 'cuda'))

    best_val_loss = float('inf')
    patience_counter = 0
    model_save_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
    config.MODEL_DIR.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, num_epochs + 1):
        # 1. Training Phase
        model.train()
        running_train_loss = 0.0

        # Learning rate warmup logic
        if epoch <= warmup_epochs:
            lr_scale = min(1.0, float(epoch) / float(warmup_epochs))
            for param_group in optimizer.param_groups:
                param_group['lr'] = config.LEARNING_RATE * lr_scale

        for imgs, _, _, _ in train_loader:
            imgs = imgs.to(device, non_blocking=True)

            optimizer.zero_grad()

            with torch.cuda.amp.autocast(enabled=(use_amp and device.type == 'cuda')):
                outputs = model(imgs)
                loss = criterion(outputs, imgs)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_train_loss += loss.item() * imgs.size(0)

        epoch_train_loss = running_train_loss / len(train_loader.dataset)

        if epoch > warmup_epochs:
            cosine_scheduler.step()

        # 2. Validation / Calibration Phase
        model.eval()
        running_val_loss = 0.0
        val_samples = 0

        with torch.no_grad():
            for imgs, labels, _, _ in test_loader:
                # Evaluate only on normal 'good' images for baseline validation error
                good_mask = (labels == 0)
                if not good_mask.any():
                    continue

                good_imgs = imgs[good_mask].to(device, non_blocking=True)
                val_samples += good_imgs.size(0)

                with torch.cuda.amp.autocast(enabled=(use_amp and device.type == 'cuda')):
                    outputs = model(good_imgs)
                    v_loss = criterion(outputs, good_imgs)

                running_val_loss += v_loss.item() * good_imgs.size(0)

        epoch_val_loss = (running_val_loss / val_samples) if val_samples > 0 else epoch_train_loss

        # 3. Early Stopping & Best Checkpoint Logic
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            patience_counter = 0
            torch.save(model.state_dict(), model_save_path)
            saved_indicator = " [SAVED]"
        else:
            patience_counter += 1
            saved_indicator = ""

        if epoch % 5 == 0 or epoch == 1 or epoch == num_epochs or saved_indicator:
            lr_curr = optimizer.param_groups[0]['lr']
            print(
                f"  Epoch [{epoch:3d}/{num_epochs}] Train Loss: {epoch_train_loss:.6f} | "
                f"Val Loss: {epoch_val_loss:.6f} | Best Val: {best_val_loss:.6f} | "
                f"LR: {lr_curr:.6f}{saved_indicator}"
            )

        if patience_counter >= patience and epoch > warmup_epochs + 5:
            print(f"\n  [Early Stopping] No validation loss improvement for {patience} epochs. Stopping at epoch {epoch}.")
            break

    print(f"\nTraining completed for '{category}'. Best checkpoint saved to: {model_save_path}")

    # Load best checkpoint and summarize performance
    if model_save_path.exists():
        model.load_state_dict(torch.load(model_save_path, map_location=device))

    calibrate_trained_autoencoder(model, test_loader, device)

    return model


def calibrate_trained_autoencoder(model, test_loader, device):
    """
    Evaluates reconstruction MAE error distribution on normal test images vs anomalous test images.
    """
    model.eval()
    normal_scores = []
    anomaly_scores = []

    with torch.no_grad():
        for imgs, labels, _, _ in test_loader:
            imgs = imgs.to(device, non_blocking=True)
            outputs = model(imgs)

            # Per-image Mean Absolute Error
            diff = torch.abs(imgs - outputs).mean(dim=[1, 2, 3])

            for score, label in zip(diff, labels):
                if label.item() == 0:
                    normal_scores.append(score.item())
                else:
                    anomaly_scores.append(score.item())

    print("\n--- Autoencoder Final Reconstruction Error Summary ---")
    if normal_scores:
        avg_norm = np.mean(normal_scores)
        max_norm = np.max(normal_scores)
        print(f"  Normal (Good):   mean={avg_norm:.5f}, max={max_norm:.5f} (Count: {len(normal_scores)})")
    if anomaly_scores:
        avg_anom = np.mean(anomaly_scores)
        min_anom = np.min(anomaly_scores)
        print(f"  Anomaly (Defect): mean={avg_anom:.5f}, min={min_anom:.5f} (Count: {len(anomaly_scores)})")


if __name__ == "__main__":
    train_model()
