"""Quick calibration for problem categories with YOLO disabled."""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np, torch
from PIL import Image
from torchvision import transforms
from anomaly_detection import config
from anomaly_detection.model import AnomalyAutoencoder

device = torch.device(config.DEVICE)
transform = transforms.Compose([transforms.Resize(config.IMAGE_SIZE), transforms.ToTensor()])

def calibrate_no_yolo(category):
    ae = AnomalyAutoencoder().to(device)
    ae.load_state_dict(torch.load(config.MODEL_DIR / f"autoencoder_{category}.pth", map_location=device))
    ae.eval()
    
    test_dir = Path(config.DATASET_DIR) / category / "test"
    good_scores, defect_scores = [], []
    
    for subdir in sorted(test_dir.iterdir()):
        if not subdir.is_dir(): continue
        is_good = subdir.name == "good"
        for img in sorted(list(subdir.glob("*.png")) + list(subdir.glob("*.jpg"))):
            try:
                pil = Image.open(img).convert("RGB")
                t = transform(pil).unsqueeze(0).to(device)
                with torch.no_grad():
                    _, _, s = ae.compute_anomaly_map(t, use_ssim=True)
                (good_scores if is_good else defect_scores).append(s.item())
            except: pass
    
    g = np.array(good_scores)
    d = np.array(defect_scores)
    
    # Try multiple threshold strategies
    print(f"\n{'='*60}")
    print(f"  {category.upper()} (NO YOLO) | good: n={len(g)}, defect: n={len(d)}")
    print(f"  Good:   min={g.min():.4f} mean={g.mean():.4f} max={g.max():.4f} std={g.std():.4f}")
    print(f"  Defect: min={d.min():.4f} mean={d.mean():.4f} max={d.max():.4f}")
    
    # Find optimal threshold by maximizing balanced accuracy
    best_thresh, best_bacc = 0, 0
    for percentile in range(10, 100):
        thresh = np.percentile(np.concatenate([g, d]), percentile)
        gp = np.sum(g <= thresh) / len(g)
        dr = np.sum(d > thresh) / len(d)
        bacc = (gp + dr) / 2
        if bacc > best_bacc:
            best_bacc = bacc
            best_thresh = thresh
    
    gp = np.sum(g <= best_thresh) / len(g) * 100
    dr = np.sum(d > best_thresh) / len(d) * 100
    print(f"  OPTIMAL: thresh={best_thresh:.6f} | good_pass={gp:.1f}% | defect_rej={dr:.1f}% | bacc={best_bacc*100:.1f}%")
    return best_thresh

for cat in ["metal_nut", "toothbrush", "transistor", "zipper", "cable", "capsule", "pill"]:
    try:
        calibrate_no_yolo(cat)
    except Exception as e:
        print(f"ERROR {cat}: {e}")
