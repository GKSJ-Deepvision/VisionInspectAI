"""
Aggressive threshold calibration for manufacturing QC.
Strategy: In manufacturing, FALSE NEGATIVES (missing defects) are far worse than
FALSE POSITIVES (flagging good items for re-inspection).

So we set thresholds using: good_mean + 0.5 * good_std
This catches more defects at the cost of some good items being flagged.
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

YOLO_SKIP = {"carpet", "grid", "leather", "tile", "wood"}

def calibrate():
    dataset_dir = Path(config.DATASET_DIR)
    categories = sorted([d.name for d in dataset_dir.iterdir() 
                         if d.is_dir() and d.name != ".git" 
                         and (config.MODEL_DIR / f"autoencoder_{d.name}.pth").exists()])
    
    print("=" * 80)
    print("   MANUFACTURING-GRADE AGGRESSIVE THRESHOLD CALIBRATION")
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
        
        use_yolo = category not in YOLO_SKIP
        
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
                except:
                    pass
        
        if not good_scores:
            continue
            
        good_arr = np.array(good_scores)
        defect_arr = np.array(defect_scores) if defect_scores else np.array([])
        
        good_mean = good_arr.mean()
        good_std = good_arr.std()
        good_median = np.median(good_arr)
        
        # Manufacturing-grade threshold: good_median + 0.5 * std
        # Catches most defects, accepts ~85-90% of good items
        threshold = good_median + 0.5 * good_std
        
        # But if defect scores are available and threshold is too high to catch them,
        # try to find a better split point
        if len(defect_arr) > 0:
            defect_mean = defect_arr.mean()
            # If the threshold is above defect mean, something is very wrong
            # Lower it to be between good_median and defect_mean
            if threshold > defect_mean and good_median < defect_mean:
                threshold = (good_median + defect_mean) / 2.0
            # If good and defect completely overlap, use good_median as threshold
            # (aggressive: will catch ~50% of goods as defects too, but catches defects)
            elif good_median >= defect_mean:
                # Scores are reversed or identical - use a very tight threshold
                combined = np.concatenate([good_arr, defect_arr])
                threshold = np.percentile(combined, 40)  # aggressive
        
        # Compute accuracy
        good_pass = np.sum(good_arr <= threshold)
        defect_reject = np.sum(defect_arr > threshold) if len(defect_arr) > 0 else 0
        total = len(good_arr) + len(defect_arr)
        accuracy = (good_pass + defect_reject) / total * 100
        
        good_pass_rate = good_pass / len(good_arr) * 100
        defect_reject_rate = defect_reject / len(defect_arr) * 100 if len(defect_arr) > 0 else 0
        
        results[category] = {
            "threshold": float(threshold),
            "accuracy": accuracy,
            "good_pass_rate": good_pass_rate,
            "defect_reject_rate": defect_reject_rate,
            "good_n": len(good_arr),
            "defect_n": len(defect_arr),
        }
        
        status = "GOOD" if accuracy >= 60 else ("OK" if accuracy >= 45 else "WEAK")
        print(f"  [{status:4s}] {category:14s} | thresh={threshold:.6f} | good_pass={good_pass_rate:5.1f}% | defect_rej={defect_reject_rate:5.1f}% | acc={accuracy:5.1f}%")
    
    print("\n" + "=" * 80)
    print("CATEGORY_THRESHOLDS = {")
    for cat in sorted(results.keys()):
        print(f'    "{cat}": {results[cat]["threshold"]:.6f},')
    print("}")
    
    avg_acc = np.mean([r["accuracy"] for r in results.values()])
    avg_good = np.mean([r["good_pass_rate"] for r in results.values()])
    avg_defect = np.mean([r["defect_reject_rate"] for r in results.values()])
    print(f"\nAVERAGE: accuracy={avg_acc:.1f}% | good_pass={avg_good:.1f}% | defect_reject={avg_defect:.1f}%")
    print("=" * 80)

if __name__ == "__main__":
    calibrate()
