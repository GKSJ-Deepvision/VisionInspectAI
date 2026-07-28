"""
Deep diagnostic script to understand why 13/15 categories misclassify.
Tests the EXACT inference pipeline path for each category.
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from anomaly_detection import config
from anomaly_detection.model import AnomalyAutoencoder
from anomaly_detection.classifier import DefectClassifier, CATEGORY_DEFECT_CLASSES
from anomaly_detection.yolo_helper import crop_product

device = torch.device(config.DEVICE)
transform = transforms.Compose([transforms.Resize(config.IMAGE_SIZE), transforms.ToTensor()])

def test_category(category):
    dataset_dir = Path(config.DATASET_DIR)
    test_dir = dataset_dir / category / "test"
    
    # Load autoencoder
    ae_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
    ae = AnomalyAutoencoder().to(device)
    ae.load_state_dict(torch.load(ae_path, map_location=device))
    ae.eval()
    
    # Load classifier
    cls_path = config.MODEL_DIR / f"classifier_{category}.pth"
    class_list = CATEGORY_DEFECT_CLASSES.get(category, ["good", "defective"])
    clf = DefectClassifier(num_classes=len(class_list)).to(device)
    clf.load_state_dict(torch.load(cls_path, map_location=device))
    clf.eval()
    
    threshold = config.CATEGORY_THRESHOLDS.get(category, 0.125)
    
    print(f"\n{'='*70}")
    print(f"  CATEGORY: {category.upper()}  |  Threshold: {threshold:.6f}  |  Classes: {class_list}")
    print(f"{'='*70}")
    
    # Test GOOD samples (up to 3)
    good_dir = test_dir / "good"
    if good_dir.exists():
        good_files = sorted(list(good_dir.glob("*.png")) + list(good_dir.glob("*.jpg")))[:3]
        print(f"\n  --- GOOD SAMPLES ({len(good_files)}) ---")
        for gf in good_files:
            pil_img = Image.open(gf).convert("RGB")
            
            # Path A: RAW (no YOLO) - same as calibrate_thresholds.py
            tensor_raw = transform(pil_img).unsqueeze(0).to(device)
            _, _, score_raw = ae.compute_anomaly_map(tensor_raw, use_ssim=True)
            score_raw = score_raw.item()
            
            # Path B: WITH YOLO crop - same as inference.py
            cropped, bbox, yolo_status = crop_product(pil_img, category=category, enable_yolo=True)
            tensor_crop = transform(cropped).unsqueeze(0).to(device)
            _, _, score_crop = ae.compute_anomaly_map(tensor_crop, use_ssim=True)
            score_crop = score_crop.item()
            
            # Classifier on raw vs cropped
            logits_raw = clf(tensor_raw)
            probs_raw = torch.softmax(logits_raw, dim=1).squeeze(0)
            pred_raw_idx = probs_raw.argmax().item()
            pred_raw_class = class_list[pred_raw_idx] if pred_raw_idx < len(class_list) else f"idx_{pred_raw_idx}"
            pred_raw_conf = probs_raw[pred_raw_idx].item() * 100
            
            logits_crop = clf(tensor_crop)
            probs_crop = torch.softmax(logits_crop, dim=1).squeeze(0)
            pred_crop_idx = probs_crop.argmax().item()
            pred_crop_class = class_list[pred_crop_idx] if pred_crop_idx < len(class_list) else f"idx_{pred_crop_idx}"
            pred_crop_conf = probs_crop[pred_crop_idx].item() * 100
            
            verdict_raw = "PASS" if score_raw <= threshold else "FAIL"
            verdict_crop = "PASS" if score_crop <= threshold else "FAIL"
            
            print(f"  {gf.name}: RAW={score_raw:.4f}({verdict_raw}) | CROP={score_crop:.4f}({verdict_crop}) | ClfRAW={pred_raw_class}({pred_raw_conf:.1f}%) | ClfCROP={pred_crop_class}({pred_crop_conf:.1f}%) | {yolo_status[:50]}")
    
    # Test DEFECT samples (up to 2 per defect type, max 4 total)
    defect_dirs = [d for d in test_dir.iterdir() if d.is_dir() and d.name != "good"]
    print(f"\n  --- DEFECT SAMPLES ---")
    count = 0
    for dd in sorted(defect_dirs):
        defect_files = sorted(list(dd.glob("*.png")) + list(dd.glob("*.jpg")))[:2]
        for df in defect_files:
            if count >= 4:
                break
            pil_img = Image.open(df).convert("RGB")
            
            # Path A: RAW
            tensor_raw = transform(pil_img).unsqueeze(0).to(device)
            _, _, score_raw = ae.compute_anomaly_map(tensor_raw, use_ssim=True)
            score_raw = score_raw.item()
            
            # Path B: WITH YOLO
            cropped, bbox, yolo_status = crop_product(pil_img, category=category, enable_yolo=True)
            tensor_crop = transform(cropped).unsqueeze(0).to(device)
            _, _, score_crop = ae.compute_anomaly_map(tensor_crop, use_ssim=True)
            score_crop = score_crop.item()
            
            # Classifier
            logits_raw = clf(tensor_raw)
            probs_raw = torch.softmax(logits_raw, dim=1).squeeze(0)
            pred_raw_idx = probs_raw.argmax().item()
            pred_raw_class = class_list[pred_raw_idx] if pred_raw_idx < len(class_list) else f"idx_{pred_raw_idx}"
            pred_raw_conf = probs_raw[pred_raw_idx].item() * 100
            
            verdict_raw = "REJECT" if score_raw > threshold else "MISS"
            verdict_crop = "REJECT" if score_crop > threshold else "MISS"
            
            print(f"  {dd.name}/{df.name}: RAW={score_raw:.4f}({verdict_raw}) | CROP={score_crop:.4f}({verdict_crop}) | ClfRAW={pred_raw_class}({pred_raw_conf:.1f}%) | {yolo_status[:50]}")
            count += 1
        if count >= 4:
            break

if __name__ == "__main__":
    for cat in sorted(CATEGORY_DEFECT_CLASSES.keys()):
        try:
            test_category(cat)
        except Exception as e:
            print(f"[ERROR] {cat}: {e}")
