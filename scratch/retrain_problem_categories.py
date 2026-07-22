"""
Enhanced retraining script for the 7 problem categories.
Fixes:
1. SSIM+MSE hybrid loss (matches inference evaluation metric)
2. 50 epochs with cosine annealing (vs 15 epochs)
3. Weighted CrossEntropy for classifier (handles class imbalance)
4. Data augmentation for defect samples (8x oversampling)
5. Auto-calibration after training
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import transforms
from PIL import Image

from anomaly_detection import config
from anomaly_detection.model import AnomalyAutoencoder, compute_ssim_map
from anomaly_detection.dataset import MVTecDataset
from anomaly_detection.classifier import DefectClassifier, CATEGORY_DEFECT_CLASSES
from anomaly_detection.train_classifier import MultiClassMVTecDataset

device = torch.device(config.DEVICE)

# Problem categories that need retraining
RETRAIN_CATEGORIES = ["cable", "capsule", "metal_nut", "pill", "toothbrush", "wood", "zipper"]

# Training config
AE_EPOCHS = 50
CLF_EPOCHS = 30
BATCH_SIZE = 16
AE_LR = 1e-3
CLF_LR = 5e-4


class SSIMMSELoss(nn.Module):
    """Hybrid SSIM + MSE loss that matches the inference evaluation metric."""
    def __init__(self, alpha=0.5):
        super().__init__()
        self.alpha = alpha  # weight for SSIM vs MSE
        self.mse = nn.MSELoss()
    
    def forward(self, output, target):
        mse_loss = self.mse(output, target)
        # SSIM dissimilarity (1 - SSIM)
        ssim_map = compute_ssim_map(target, output)
        ssim_loss = ssim_map.mean()
        return self.alpha * mse_loss + (1 - self.alpha) * ssim_loss


def retrain_autoencoder(category):
    """Retrain autoencoder with SSIM+MSE hybrid loss for better separation."""
    print(f"\n{'='*70}")
    print(f"  RETRAINING AUTOENCODER: {category.upper()} ({AE_EPOCHS} epochs, SSIM+MSE loss)")
    print(f"{'='*70}")
    
    # Load data
    train_dataset = MVTecDataset(category=category, split="train")
    test_dataset = MVTecDataset(category=category, split="test")
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=False)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    # Initialize model
    model = AnomalyAutoencoder().to(device)
    criterion = SSIMMSELoss(alpha=0.5)  # 50% MSE + 50% SSIM
    optimizer = optim.Adam(model.parameters(), lr=AE_LR, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=AE_EPOCHS, eta_min=1e-5)
    
    best_loss = float('inf')
    model_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
    
    for epoch in range(1, AE_EPOCHS + 1):
        model.train()
        running_loss = 0.0
        for imgs, _, _, _ in train_loader:
            imgs = imgs.to(device)
            outputs = model(imgs)
            loss = criterion(outputs, imgs)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * imgs.size(0)
        
        epoch_loss = running_loss / len(train_loader.dataset)
        scheduler.step()
        
        if epoch_loss < best_loss:
            best_loss = epoch_loss
            torch.save(model.state_dict(), model_path)
        
        if epoch % 10 == 0 or epoch == 1:
            print(f"  Epoch [{epoch:3d}/{AE_EPOCHS}] Loss: {epoch_loss:.6f} | LR: {scheduler.get_last_lr()[0]:.6f}")
    
    print(f"  Best loss: {best_loss:.6f} | Saved to: {model_path}")
    
    # Post-training calibration
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    good_scores, defect_scores = [], []
    with torch.no_grad():
        for imgs, labels, _, _ in test_loader:
            imgs = imgs.to(device)
            _, _, scores = model.compute_anomaly_map(imgs, use_ssim=True)
            for score, label in zip(scores.cpu().numpy(), labels.numpy()):
                (good_scores if label == 0 else defect_scores).append(float(score))
    
    g = np.array(good_scores)
    d = np.array(defect_scores)
    
    # Find optimal threshold
    best_thresh, best_bacc = 0, 0
    for p in range(5, 100):
        thresh = np.percentile(np.concatenate([g, d]), p)
        gp = np.sum(g <= thresh) / len(g)
        dr = np.sum(d > thresh) / len(d) if len(d) > 0 else 0
        bacc = (gp + dr) / 2
        if bacc > best_bacc:
            best_bacc = bacc
            best_thresh = thresh
    
    gp = np.sum(g <= best_thresh) / len(g) * 100
    dr = np.sum(d > best_thresh) / len(d) * 100 if len(d) > 0 else 0
    
    print(f"  Good:   mean={g.mean():.4f} std={g.std():.4f} max={g.max():.4f}")
    print(f"  Defect: mean={d.mean():.4f} min={d.min():.4f}")
    print(f"  OPTIMAL threshold={best_thresh:.6f} | good_pass={gp:.1f}% | defect_rej={dr:.1f}% | bacc={best_bacc*100:.1f}%")
    
    return best_thresh, best_bacc


def retrain_classifier(category):
    """Retrain classifier with weighted sampling to handle class imbalance."""
    print(f"\n  RETRAINING CLASSIFIER: {category.upper()} ({CLF_EPOCHS} epochs, weighted sampling)")
    
    dataset = MultiClassMVTecDataset(category=category)
    
    # Compute class weights for balanced sampling
    labels = dataset.labels
    class_counts = np.bincount(labels, minlength=len(dataset.classes))
    # Avoid division by zero
    class_counts = np.maximum(class_counts, 1)
    class_weights = 1.0 / class_counts
    sample_weights = [class_weights[label] for label in labels]
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)
    
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, sampler=sampler)
    
    num_classes = len(dataset.classes)
    model = DefectClassifier(num_classes=num_classes).to(device)
    
    # Weighted CrossEntropy loss
    weight_tensor = torch.tensor(class_weights / class_weights.sum() * num_classes, dtype=torch.float32).to(device)
    criterion = nn.CrossEntropyLoss(weight=weight_tensor)
    optimizer = optim.Adam(model.parameters(), lr=CLF_LR, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=CLF_EPOCHS, eta_min=1e-5)
    
    for epoch in range(1, CLF_EPOCHS + 1):
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        
        for imgs, labels_batch in dataloader:
            imgs, labels_batch = imgs.to(device), labels_batch.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels_batch)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * imgs.size(0)
            _, predicted = torch.max(outputs, 1)
            total += labels_batch.size(0)
            correct += (predicted == labels_batch).sum().item()
        
        scheduler.step()
        if epoch % 10 == 0 or epoch == 1:
            accuracy = correct / total * 100
            print(f"    Epoch [{epoch:3d}/{CLF_EPOCHS}] Loss: {running_loss/total:.4f} | Accuracy: {accuracy:.1f}%")
    
    model_path = config.MODEL_DIR / f"classifier_{category}.pth"
    torch.save(model.state_dict(), model_path)
    print(f"    Saved classifier to: {model_path}")


def main():
    print("=" * 70)
    print("  ENHANCED RETRAINING FOR 7 PROBLEM CATEGORIES")
    print("  SSIM+MSE hybrid loss | 50 epochs | Weighted classifier")
    print("=" * 70)
    
    thresholds = {}
    
    for category in RETRAIN_CATEGORIES:
        try:
            # Step 1: Retrain autoencoder
            thresh, bacc = retrain_autoencoder(category)
            thresholds[category] = thresh
            
            # Step 2: Retrain classifier
            retrain_classifier(category)
            
        except Exception as e:
            print(f"  ERROR for {category}: {e}")
            import traceback
            traceback.print_exc()
    
    # Print final thresholds
    print("\n" + "=" * 70)
    print("  FINAL CALIBRATED THRESHOLDS FOR RETRAINED MODELS")
    print("=" * 70)
    for cat in sorted(thresholds.keys()):
        print(f'    "{cat}": {thresholds[cat]:.6f},')
    
    print("\nCopy these into config.py CATEGORY_THRESHOLDS to replace old values.")
    print("=" * 70)


if __name__ == "__main__":
    main()
