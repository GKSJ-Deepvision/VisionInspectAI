import os
import sys
from pathlib import Path
import numpy as np
import torch
from PIL import Image

# Add project root to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.inference import predict_defect
from anomaly_detection.classifier import CATEGORY_DEFECT_CLASSES

def verify_all_15():
    dataset_dir = Path(config.DATASET_DIR)
    categories = sorted(list(CATEGORY_DEFECT_CLASSES.keys()))
    
    print("=" * 80)
    print("      MASTER VERIFICATION SUITE FOR ALL 15 PRODUCT CATEGORIES      ")
    print("=" * 80)
    
    results_summary = []
    
    for category in categories:
        cat_dir = dataset_dir / category
        if not cat_dir.exists():
            print(f"[-] Category '{category}' dataset path not found at {cat_dir}")
            continue
            
        test_dir = cat_dir / "test"
        if not test_dir.exists():
            print(f"[-] Test dir for '{category}' not found.")
            continue
            
        # 1. Find a Good test sample
        good_dir = test_dir / "good"
        good_img_path = None
        if good_dir.exists():
            good_files = list(good_dir.glob("*.png")) + list(good_dir.glob("*.jpg"))
            if good_files:
                good_img_path = str(good_files[0])
                
        # 2. Find a Defective test sample
        defect_dirs = [d for d in test_dir.iterdir() if d.is_dir() and d.name != "good"]
        defect_img_path = None
        defect_type_name = None
        if defect_dirs:
            defect_files = list(defect_dirs[0].glob("*.png")) + list(defect_dirs[0].glob("*.jpg"))
            if defect_files:
                defect_img_path = str(defect_files[0])
                defect_type_name = defect_dirs[0].name
                
        # Test Good Sample
        good_pass = False
        good_score = 0.0
        good_thresh = 0.0
        if good_img_path:
            res = predict_defect(good_img_path, category=category, enable_yolo=True)
            good_pass = (res["defect_result"] == "PASS")
            good_score = res["anomaly_score"]
            good_thresh = res["threshold"]

        # Test Defective Sample
        defect_reject = False
        defect_score = 0.0
        pred_class = ""
        if defect_img_path:
            res = predict_defect(defect_img_path, category=category, enable_yolo=True)
            defect_reject = (res["defect_result"] == "REJECT")
            defect_score = res["anomaly_score"]
            pred_class = res["defect_class"]

        status = "✅ PERFECT" if (good_pass and defect_reject) else ("⚠️ CHECK" if (good_pass or defect_reject) else "❌ FAIL")
        
        results_summary.append({
            "category": category,
            "good_score": good_score,
            "good_status": "PASS" if good_pass else "FAIL",
            "defect_type": defect_type_name,
            "defect_score": defect_score,
            "defect_status": "REJECT" if defect_reject else "PASS",
            "pred_class": pred_class,
            "threshold": good_thresh,
            "overall": status
        })
        
        print(f"[{status}] Category: {category:12s} | Thresh: {good_thresh:.4f} | Good Score: {good_score:.4f} ({'PASS' if good_pass else 'FAIL'}) | Defect Score: {defect_score:.4f} ({'REJECT' if defect_reject else 'PASS'}) | Pred Class: {pred_class}")

    print("\n" + "=" * 80)
    print("                    MASTER ALL 15 CATEGORIES SUMMARY                       ")
    print("=" * 80)
    print(f"{'Category':14s} | {'Thresh':8s} | {'Good Test':10s} | {'Defect Test':12s} | {'Predicted Defect':18s} | Status")
    print("-" * 80)
    for r in results_summary:
        print(f"{r['category']:14s} | {r['threshold']:8.4f} | {r['good_status']:10s} | {r['defect_status']:12s} | {r['pred_class']:18s} | {r['overall']}")
    print("=" * 80)

if __name__ == "__main__":
    verify_all_15()
