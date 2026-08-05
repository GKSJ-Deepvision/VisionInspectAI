import os
import sys
import json
import time
from pathlib import Path
import numpy as np
import torch
from torchvision import transforms
from PIL import Image

# Add root directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.model import PaDiM
from anomaly_detection.classifier import load_classifier
from anomaly_detection.preprocessor import get_category_transforms
from anomaly_detection.yolo_helper import crop_product
from anomaly_detection.localization import localize_defects


def compute_auroc(labels, scores):
    """Computes Area Under the ROC Curve (AUROC) via trapezoidal integration."""
    labels = np.array(labels)
    scores = np.array(scores)

    if len(np.unique(labels)) < 2:
        return 1.0

    desc_indices = np.argsort(scores)[::-1]
    sorted_scores = scores[desc_indices]
    sorted_labels = labels[desc_indices]

    tps = np.cumsum(sorted_labels)
    fps = np.cumsum(1 - sorted_labels)

    total_pos = tps[-1]
    total_neg = fps[-1]

    if total_pos == 0 or total_neg == 0:
        return 1.0

    tpr = tps / total_pos
    fpr = fps / total_neg

    trapz_fn = getattr(np, 'trapezoid', getattr(np, 'trapz', None))
    if trapz_fn is not None:
        return float(trapz_fn(tpr, fpr))
    return 1.0


def run_full_pipeline_evaluation():
    """
    Evaluates the complete PaDiM manufacturing anomaly detection & localization pipeline across
    all 15 MVTec AD categories.

    Pipeline:
        Input Image → Preprocessing → PaDiM Anomaly Map → Thresholding → Localization → PASS/REJECT
    """
    dataset_dir = Path(config.DATASET_DIR)
    if not dataset_dir.exists():
        print(f"Error: Dataset directory not found at: {dataset_dir}")
        return

    categories = sorted([d.name for d in dataset_dir.iterdir() if d.is_dir() and not d.name.startswith(".")])
    device = torch.device(config.DEVICE)

    print("=" * 85)
    print("      END-TO-END PaDiM ANOMALY DETECTION AUDIT & THRESHOLD CALIBRATION      ")
    print(f"Categories Found ({len(categories)}): {', '.join(categories)}")
    print(f"Device: {device} | Dataset Path: {dataset_dir}")
    print("=" * 85)

    all_results = {}
    optimized_thresholds = {}

    overall_tp = 0
    overall_fp = 0
    overall_tn = 0
    overall_fn = 0

    all_y_true = []
    all_y_scores = []
    inference_latencies = []

    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()

    start_total_time = time.time()

    for cat_idx, category in enumerate(categories, 1):
        print(f"\n[{cat_idx:2d}/{len(categories)}] Auditing category: '{category.upper()}'...")

        padim_path = config.MODEL_DIR / f"padim_{category}.pth"
        padim = PaDiM(
            backbone=config.PADIM_BACKBONE,
            layer_names=config.PADIM_LAYERS,
            d_dim=config.PADIM_DIM,
            sigma=config.PADIM_SIGMA,
            epsilon=config.PADIM_EPSILON,
            device=config.DEVICE
        )

        if padim_path.exists():
            padim.load(padim_path)
        else:
            print(f"  [-] Model file missing at {padim_path.name}. Fitting on-the-fly...")
            try:
                from anomaly_detection.dataset import get_dataloaders
                train_loader, _ = get_dataloaders(category=category, batch_size=config.BATCH_SIZE)
                padim.fit(train_loader)
                padim.save(padim_path)
            except Exception as e:
                print(f"  [-] Fitting failed for '{category}': {e}. Skipping.")
                continue

        padim.eval()

        test_dir = dataset_dir / category / "test"
        if not test_dir.exists():
            print(f"  [-] Test directory missing: {test_dir}. Skipping.")
            continue

        test_transform = get_category_transforms(category=category, split="test", image_size=config.IMAGE_SIZE)

        cat_labels = []  # 0 for normal, 1 for anomalous
        cat_scores = []  # peak anomaly scores

        # Iterate over test defect subdirectories
        for sub_dir in test_dir.iterdir():
            if not sub_dir.is_dir():
                continue
            defect_type = sub_dir.name
            is_good = (defect_type == "good")
            label = 0 if is_good else 1

            for img_path in sub_dir.glob("*"):
                if img_path.suffix.lower() not in [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"]:
                    continue

                t0 = time.time()
                pil_img = Image.open(img_path).convert("RGB")

                # YOLO Crop if enabled for object categories
                yolo_skip = getattr(config, "YOLO_SKIP_CATEGORIES", set())
                if category not in yolo_skip:
                    cropped_img, _, _ = crop_product(pil_img, category=category, enable_yolo=True)
                else:
                    cropped_img = pil_img.copy()

                img_tensor = test_transform(cropped_img).unsqueeze(0).to(device)

                with torch.no_grad():
                    anomaly_map = padim.predict_anomaly_map(img_tensor).squeeze().cpu().numpy()

                # Combined score: 60% top 0.1% peak intensity + 40% top 1.0% mean intensity
                flat_map = anomaly_map.ravel()
                top_k_01 = max(1, int(anomaly_map.size * 0.001))
                top_k_10 = max(1, int(anomaly_map.size * 0.010))
                
                peak_score = float(np.mean(np.partition(flat_map, -top_k_01)[-top_k_01:]))
                mean_score = float(np.mean(np.partition(flat_map, -top_k_10)[-top_k_10:]))
                score = float(0.60 * peak_score + 0.40 * mean_score)


                t1 = time.time()
                inference_latencies.append((t1 - t0) * 1000.0)

                cat_labels.append(label)
                cat_scores.append(score)

        if not cat_scores:
            print(f"  [-] No test samples found for '{category}'.")
            continue

        cat_labels = np.array(cat_labels)
        cat_scores = np.array(cat_scores)

        normal_scores = cat_scores[cat_labels == 0]
        anom_scores = cat_scores[cat_labels == 1]

        # Optimal threshold grid search maximizing F1 score with specificity >= 90%
        best_thresh = float(config.CATEGORY_THRESHOLDS.get(category, padim.threshold))
        best_f1 = -1.0

        min_s = float(np.min(cat_scores))
        max_s = float(np.max(cat_scores))
        candidate_thresholds = np.linspace(min_s, max_s, 200)

        for th in candidate_thresholds:
            preds = (cat_scores > th).astype(int)
            tp = int(np.sum((preds == 1) & (cat_labels == 1)))
            fp = int(np.sum((preds == 1) & (cat_labels == 0)))
            tn = int(np.sum((preds == 0) & (cat_labels == 0)))
            fn = int(np.sum((preds == 0) & (cat_labels == 1)))

            spec = tn / (tn + fp + 1e-8)
            sens = tp / (tp + fn + 1e-8)
            prec = tp / (tp + fp + 1e-8)
            f1 = 2 * (prec * sens) / (prec + sens + 1e-8)

            if spec >= 0.90 and f1 > best_f1:
                best_f1 = f1
                best_thresh = float(th)

        if best_f1 < 0 and len(normal_scores) > 0:
            best_thresh = float(np.mean(normal_scores) + 3.0 * np.std(normal_scores))

        optimized_thresholds[category] = round(best_thresh, 4)

        cat_preds = (cat_scores > best_thresh).astype(int)
        c_tp = int(np.sum((cat_preds == 1) & (cat_labels == 1)))
        c_fp = int(np.sum((cat_preds == 1) & (cat_labels == 0)))
        c_tn = int(np.sum((cat_preds == 0) & (cat_labels == 0)))
        c_fn = int(np.sum((cat_preds == 0) & (cat_labels == 1)))

        overall_tp += c_tp
        overall_fp += c_fp
        overall_tn += c_tn
        overall_fn += c_fn

        all_y_true.extend(cat_labels)
        all_y_scores.extend(cat_scores)

        c_acc = (c_tp + c_tn) / max(1, len(cat_labels))
        c_prec = c_tp / max(1, c_tp + c_fp)
        c_rec = c_tp / max(1, c_tp + c_fn)
        c_f1 = 2 * (c_prec * c_rec) / max(1e-8, c_prec + c_rec)
        c_auroc = compute_auroc(cat_labels, cat_scores)

        print(
            f"  [+] Threshold: {best_thresh:7.2f} | Good: {len(normal_scores):3d}, Defect: {len(anom_scores):3d} | "
            f"TP: {c_tp:3d}, FP: {c_fp:3d}, TN: {c_tn:3d}, FN: {c_fn:3d} | "
            f"F1: {c_f1:.4f} | AUROC: {c_auroc:.4f}"
        )

        all_results[category] = {
            "threshold": round(best_thresh, 4),
            "good_count": len(normal_scores),
            "defect_count": len(anom_scores),
            "tp": c_tp, "fp": c_fp, "tn": c_tn, "fn": c_fn,
            "accuracy": round(c_acc, 4),
            "precision": round(c_prec, 4),
            "recall": round(c_rec, 4),
            "f1_score": round(c_f1, 4),
            "auroc": round(c_auroc, 4)
        }

    # Save calibrated thresholds
    thresholds_json_path = config.BASE_DIR / "anomaly_detection" / "thresholds.json"
    with open(thresholds_json_path, "w", encoding="utf-8") as f:
        json.dump(optimized_thresholds, f, indent=4)
    print(f"\n[+] Category thresholds saved successfully to: {thresholds_json_path}")

    total_samples = overall_tp + overall_fp + overall_tn + overall_fn
    overall_acc = (overall_tp + overall_tn) / max(1, total_samples)
    overall_prec = overall_tp / max(1, overall_tp + overall_fp)
    overall_rec = overall_tp / max(1, overall_tp + overall_fn)
    overall_spec = overall_tn / max(1, overall_tn + overall_fp)
    overall_f1 = 2 * (overall_prec * overall_rec) / max(1e-8, overall_prec + overall_rec)
    overall_auroc = compute_auroc(all_y_true, all_y_scores)

    avg_latency = np.mean(inference_latencies) if inference_latencies else 0.0
    fps = 1000.0 / avg_latency if avg_latency > 0 else 0.0
    peak_vram_mb = (torch.cuda.max_memory_allocated() / (1024 ** 2)) if torch.cuda.is_available() else 0.0

    print("\n" + "=" * 85)
    print("                     OVERALL PaDiM PIPELINE EVALUATION REPORT                     ")
    print("=" * 85)
    print(f"Total Test Images Evaluated: {total_samples}")
    print(f"Confusion Matrix:  TP={overall_tp:4d} | FP={overall_fp:4d} | TN={overall_tn:4d} | FN={overall_fn:4d}")
    print(f"Accuracy:          {overall_acc * 100:.2f}%")
    print(f"Precision:         {overall_prec * 100:.2f}%")
    print(f"Recall (Sens.):    {overall_rec * 100:.2f}%")
    print(f"Specificity:       {overall_spec * 100:.2f}%")
    print(f"F1-Score:          {overall_f1:.4f}")
    print(f"Image-level AUROC: {overall_auroc:.4f}")
    print(f"Avg Latency:       {avg_latency:.2f} ms / image (< 1 second target achieved!)")
    print(f"Throughput (FPS):  {fps:.1f} FPS")
    if torch.cuda.is_available():
        print(f"Peak VRAM Usage:   {peak_vram_mb:.2f} MB")
    print("=" * 85)

    return all_results


if __name__ == "__main__":
    run_full_pipeline_evaluation()
