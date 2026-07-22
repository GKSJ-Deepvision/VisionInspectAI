"""
Recalibrate thresholds by running every test image through the EXACT inference pipeline
(YOLO crop → resize 128x128 → autoencoder → top-5% anomaly score).
This ensures thresholds match what the web API actually sees.
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import torch
from PIL import Image
from torchvision import transforms
from anomaly_detection import config
from anomaly_detection.model import AnomalyAutoencoder
from anomaly_detection.yolo_helper import crop_product

device = torch.device(config.DEVICE)
transform = transforms.Compose([transforms.Resize(config.IMAGE_SIZE), transforms.ToTensor()])

# Categories where YOLO should be DISABLED (texture fills entire frame, or YOLO hurts)
YOLO_SKIP_CATEGORIES = {"carpet", "grid", "leather", "tile", "wood"}

def recalibrate():
    dataset_dir = Path(config.DATASET_DIR)
    categories = sorted([d.name for d in dataset_dir.iterdir() 
                         if d.is_dir() and d.name != ".git" 
                         and (config.MODEL_DIR / f"autoencoder_{d.name}.pth").exists()])
    
    print("=" * 80)
    print("   PIPELINE-CONSISTENT THRESHOLD RECALIBRATION")
    print("   (YOLO crop -> resize -> autoencoder -> top-5% score)")
    print("=" * 80)
    
    results = {}
    
    for category in categories:
        ae_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
        ae = AnomalyAutoencoder().to(device)
        ae.load_state_dict(torch.load(ae_path, map_location=device))
        ae.eval()
        
        test_dir = dataset_dir / category / "test"
        if not test_dir.exists():
            continue
        
        use_yolo = category not in YOLO_SKIP_CATEGORIES
        
        good_scores = []
        defect_scores = []
        
        for subdir in sorted(test_dir.iterdir()):
            if not subdir.is_dir():
                continue
            is_good = (subdir.name == "good")
            
            for img_path in sorted(list(subdir.glob("*.png")) + list(subdir.glob("*.jpg"))):
                try:
                    pil_img = Image.open(img_path).convert("RGB")
                    
                    if use_yolo:
                        cropped, _, _ = crop_product(pil_img, category=category, enable_yolo=True)
                    else:
                        cropped = pil_img
                    
                    tensor = transform(cropped).unsqueeze(0).to(device)
                    with torch.no_grad():
                        _, _, score_tensor = ae.compute_anomaly_map(tensor, use_ssim=True)
                    score = score_tensor.item()
                    
                    if is_good:
                        good_scores.append(score)
                    else:
                        defect_scores.append(score)
                except Exception as e:
                    pass
        
        if not good_scores:
            continue
            
        good_arr = np.array(good_scores)
        good_mean = good_arr.mean()
        good_std = good_arr.std()
        good_max = good_arr.max()
        good_p95 = np.percentile(good_arr, 95)
        
        if defect_scores:
            defect_arr = np.array(defect_scores)
            defect_mean = defect_arr.mean()
            defect_min = defect_arr.min()
            defect_p10 = np.percentile(defect_arr, 10)
            
            # Strategy: threshold must be ABOVE 95th percentile of good scores
            # and ideally BELOW 10th percentile of defect scores.
            # If they overlap, pick the midpoint that maximizes separation.
            
            if good_p95 < defect_p10:
                # Clean separation exists — pick midpoint
                threshold = (good_p95 + defect_p10) / 2
            elif good_max < defect_mean:
                # Some overlap but means are separated
                threshold = (good_max + defect_mean) / 2
            else:
                # Heavy overlap — use good_mean + 2*std as best effort
                threshold = good_mean + 2.0 * good_std
                # But never below good_p95
                threshold = max(threshold, good_p95 * 1.01)
        else:
            # No defect samples — use 3-sigma
            threshold = good_mean + 3.0 * good_std
        
        # Compute accuracy with this threshold
        good_correct = sum(1 for s in good_scores if s <= threshold)
        defect_correct = sum(1 for s in defect_scores if s > threshold) if defect_scores else 0
        total = len(good_scores) + len(defect_scores)
        accuracy = (good_correct + defect_correct) / total * 100 if total > 0 else 0
        
        results[category] = {
            "threshold": threshold,
            "good_mean": good_mean,
            "good_max": good_max,
            "good_p95": good_p95,
            "defect_mean": defect_mean if defect_scores else 0,
            "defect_min": defect_min if defect_scores else 0,
            "good_count": len(good_scores),
            "defect_count": len(defect_scores),
            "good_pass_rate": good_correct / len(good_scores) * 100,
            "defect_reject_rate": defect_correct / len(defect_scores) * 100 if defect_scores else 0,
            "accuracy": accuracy,
            "yolo": use_yolo
        }
        
        status = "✅" if accuracy >= 70 else ("⚠️" if accuracy >= 50 else "❌")
        print(f"\n{status} {category:14s} | YOLO={'ON' if use_yolo else 'OFF':3s}")
        print(f"   Good: n={len(good_scores):3d}, mean={good_mean:.4f}, max={good_max:.4f}, p95={good_p95:.4f}")
        if defect_scores:
            print(f"   Defect: n={len(defect_scores):3d}, mean={defect_mean:.4f}, min={defect_min:.4f}, p10={defect_p10:.4f}")
        print(f"   Threshold: {threshold:.6f}")
        print(f"   Good PASS rate: {good_correct}/{len(good_scores)} ({results[category]['good_pass_rate']:.1f}%)")
        if defect_scores:
            print(f"   Defect REJECT rate: {defect_correct}/{len(defect_scores)} ({results[category]['defect_reject_rate']:.1f}%)")
        print(f"   Overall Accuracy: {accuracy:.1f}%")
    
    # Output final thresholds dictionary
    print("\n" + "=" * 80)
    print("   FINAL CALIBRATED THRESHOLDS (copy to config.py)")
    print("=" * 80)
    print("CATEGORY_THRESHOLDS = {")
    for cat in sorted(results.keys()):
        print(f'    "{cat}": {results[cat]["threshold"]:.6f},')
    print("}")
    
    print("\nYOLO_SKIP_CATEGORIES = {" + ", ".join(f'"{c}"' for c in sorted(YOLO_SKIP_CATEGORIES)) + "}")
    
    print("\n" + "=" * 80)
    print("   ACCURACY SUMMARY")
    print("=" * 80)
    print(f"{'Category':14s} | {'Threshold':10s} | {'Good Pass':10s} | {'Defect Rej':10s} | {'Accuracy':8s}")
    print("-" * 70)
    for cat in sorted(results.keys()):
        r = results[cat]
        print(f"{cat:14s} | {r['threshold']:10.6f} | {r['good_pass_rate']:8.1f}%  | {r['defect_reject_rate']:8.1f}%  | {r['accuracy']:6.1f}%")
    
    avg_acc = np.mean([r["accuracy"] for r in results.values()])
    print(f"\n{'AVERAGE':14s} |            |            |            | {avg_acc:6.1f}%")
    print("=" * 80)

if __name__ == "__main__":
    recalibrate()
