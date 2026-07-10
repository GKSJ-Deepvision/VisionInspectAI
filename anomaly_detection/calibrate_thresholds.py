import os
import sys
from pathlib import Path
import numpy as np
import torch

# Add root folder to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.dataset import get_dataloaders
from anomaly_detection.model import AnomalyAutoencoder

def calibrate_all():
    dataset_dir = Path(config.DATASET_DIR)
    if not dataset_dir.exists():
        print(f"Error: Dataset directory not found at {dataset_dir}")
        return

    categories = [d.name for d in dataset_dir.iterdir() if d.is_dir() and d.name != ".git"]
    device = torch.device(config.DEVICE)
    
    print("="*60)
    print("       ROBUST ANOMALY THRESHOLD CALIBRATION (3-SIGMA)       ")
    print("="*60)
    
    thresholds_dict = {}
    
    for category in categories:
        model_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
        if not model_path.exists():
            print(f"[-] No model found for '{category}' at {model_path}. Skipping.")
            continue
            
        # Load model
        model = AnomalyAutoencoder().to(device)
        try:
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.eval()
        except Exception as e:
            print(f"[-] Error loading model for '{category}': {e}")
            continue
            
        # Load test dataloader
        try:
            _, test_loader = get_dataloaders(category=category, batch_size=16)
        except Exception as e:
            print(f"[-] Error loading data for '{category}': {e}")
            continue
            
        normal_scores = []
        anomaly_scores = []
        
        with torch.no_grad():
            for imgs, labels, _, _ in test_loader:
                imgs = imgs.to(device)
                _, _, scores = model.compute_anomaly_map(imgs)
                scores = scores.cpu().numpy()
                labels = labels.numpy()
                
                for score, label in zip(scores, labels):
                    if label == 0:
                        normal_scores.append(score)
                    else:
                        anomaly_scores.append(score)
                        
        if len(normal_scores) > 0:
            mean_normal = np.mean(normal_scores)
            std_normal = np.std(normal_scores)
            
            # 3-Sigma threshold calculation: mean + 3 * std
            # Adds a safety margin of at least 25% of the mean to prevent false fails
            suggested_threshold = mean_normal + max(3.0 * std_normal, 0.25 * mean_normal)
            
            # Ensure the threshold is below average anomaly scores if possible, but above normal
            if len(anomaly_scores) > 0:
                mean_anomaly = np.mean(anomaly_scores)
                # If threshold is higher than average anomaly score, adjust it to midway to avoid missing defects
                if suggested_threshold > mean_anomaly:
                    suggested_threshold = (mean_normal + mean_anomaly) / 2
            
            thresholds_dict[category] = float(suggested_threshold)
            
            print(f"[+] Category '{category}':")
            print(f"    - Good samples: {len(normal_scores)}, Defect samples: {len(anomaly_scores)}")
            print(f"    - Good Mean: {mean_normal:.6f}, Good Std: {std_normal:.6f}")
            if len(anomaly_scores) > 0:
                print(f"    - Defect Mean: {mean_anomaly:.6f}")
            print(f"    - Calibrated Threshold: {suggested_threshold:.6f}")
        else:
            print(f"[-] No normal test samples for category '{category}' to calibrate.")
            
    print("\n" + "="*60)
    print("       CALIBRATED THRESHOLDS DICTIONARY FOR api.py:       ")
    print("="*60)
    print("THRESHOLDS = {")
    for cat, val in sorted(thresholds_dict.items()):
        print(f'    "{cat}": {val:.6f},')
    print("}")
    print("="*60)

if __name__ == "__main__":
    calibrate_all()
