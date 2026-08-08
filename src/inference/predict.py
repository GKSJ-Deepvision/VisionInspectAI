"""
predict.py — VisionInspect AI: PatchCore inference module

Loads a trained checkpoint for a given MVTec AD category and runs
inference on a new image, producing:
  - a binary pass/fail-style prediction (Normal / Defective)
  - a raw anomaly score
  - a saved heatmap image showing where the model thinks the defect is

This is the bridge between the trained models from Milestone 2
(15 categories, all completed) and anything downstream that needs to
call the model on a new image - a backend API, a demo script, a CLI
tool, etc. Whatever your team decides for Milestone 3, this module is
very likely part of it.

Usage (command line):
    python predict.py --category bottle --image path\to\test_image.png

Usage (as a module, e.g. from a future Flask/FastAPI endpoint):
    from predict import predict_image
    result = predict_image("bottle", "path/to/image.png")
    print(result)
"""

import argparse
import os
import sys

import torch

if not torch.cuda.is_available():
    print("[WARNING] CUDA GPU not detected - inference will run on CPU. "
          "This is fine for single images (much faster than training), "
          "just slower than GPU.")

# --------------------------------------------------------------------------
# CONFIGURATION - matches train_patchcore.py paths
# --------------------------------------------------------------------------
RESULTS_DIR = r"D:\Internship_Project\VisionInspectAI\src\results"
HEATMAP_OUTPUT_DIR = r"D:\Internship_Project\VisionInspectAI\src\predictions"

os.makedirs(HEATMAP_OUTPUT_DIR, exist_ok=True)


def _find_ckpt_under(folder: str):
    """Return the first .ckpt file found under `folder`, or None."""
    for root, _, files in os.walk(folder):
        for f in files:
            if f.endswith(".ckpt"):
                return os.path.join(root, f)
    return None


def find_checkpoint(category: str) -> str:
    """
    Locate the trained .ckpt file for a category under RESULTS_DIR.

    Deterministic resolution order (previously this walked the folder tree
    and returned whichever .ckpt os.walk() happened to reach first - NOT
    guaranteed to be the newest version, since folder traversal order isn't
    guaranteed to be sorted. That made it silently possible to validate an
    old checkpoint after retraining a category. Fixed to always prefer the
    newest run explicitly):

      1. category_dir/latest/  (anomalib's "latest run" symlink), if present
      2. the highest-numbered vN folder (v0, v1, v2, ...), by version number
      3. fallback: whatever os.walk() finds first (old behaviour, last resort)
    """
    category_dir = os.path.join(RESULTS_DIR, "Patchcore", "MVTecAD", category)
    if not os.path.isdir(category_dir):
        raise FileNotFoundError(
            f"No results folder found for category '{category}' at "
            f"{category_dir}. Has this category been trained? Check "
            f"patchcore_training_log.json under 'completed'."
        )

    # 1. Prefer the "latest" symlink/folder if it exists and has a checkpoint
    latest_dir = os.path.join(category_dir, "latest")
    if os.path.isdir(latest_dir):
        ckpt = _find_ckpt_under(latest_dir)
        if ckpt:
            print(f"[find_checkpoint] Using 'latest' -> {ckpt}")
            return ckpt

    # 2. Otherwise, find the highest-numbered vN folder explicitly
    version_dirs = []
    for name in os.listdir(category_dir):
        full_path = os.path.join(category_dir, name)
        if os.path.isdir(full_path) and name.startswith("v") and name[1:].isdigit():
            version_dirs.append((int(name[1:]), full_path))

    if version_dirs:
        version_dirs.sort(key=lambda x: x[0], reverse=True)  # newest first
        for version_num, version_path in version_dirs:
            ckpt = _find_ckpt_under(version_path)
            if ckpt:
                print(f"[find_checkpoint] Using newest version v{version_num} -> {ckpt}")
                return ckpt

    # 3. Last-resort fallback: old behaviour (walk order, not guaranteed newest)
    ckpt = _find_ckpt_under(category_dir)
    if ckpt:
        print(f"[find_checkpoint] WARNING: no 'latest' or vN folder matched - "
              f"falling back to first .ckpt found by directory walk: {ckpt}")
        return ckpt

    raise FileNotFoundError(
        f"Category folder exists but no .ckpt file found under "
        f"{category_dir}. Training may not have completed successfully."
    )


def predict_image(category: str, image_path: str, save_heatmap: bool = True) -> dict:
    """
    Run PatchCore inference on a single image.

    Returns a dict with:
        category, image_path, pred_label ("Normal"/"Defective"),
        pred_score (float anomaly score), heatmap_path (if saved)
    """
    from anomalib.models import Patchcore
    from anomalib.engine import Engine

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    ckpt_path = find_checkpoint(category)
    print(f"[predict] category={category}")
    print(f"[predict] checkpoint={ckpt_path}")
    print(f"[predict] image={image_path}")

    model = Patchcore(
        backbone="wide_resnet50_2",
        layers=["layer2", "layer3"],
        pre_trained=True,
    )

    engine = Engine(default_root_dir=HEATMAP_OUTPUT_DIR)

    predictions = engine.predict(
        model=model,
        ckpt_path=ckpt_path,
        data_path=image_path,
    )

    if not predictions:
        raise RuntimeError("Inference returned no predictions - check the "
                            "image path and checkpoint are valid.")

    pred = predictions[0]

    # anomalib's predict batch exposes these fields on the result object;
    # field names have been stable across recent anomalib 2.x releases.
    pred_score = float(pred.pred_score.item()) if hasattr(pred.pred_score, "item") else float(pred.pred_score)
    pred_label_raw = pred.pred_label
    pred_label = "Defective" if bool(pred_label_raw) else "Normal"

    result = {
        "category": category,
        "image_path": image_path,
        "pred_label": pred_label,
        "pred_score": round(pred_score, 4),
    }

    if save_heatmap and hasattr(pred, "anomaly_map") and pred.anomaly_map is not None:
        heatmap_path = _save_heatmap(pred, image_path, category)
        result["heatmap_path"] = heatmap_path

    print(f"[predict] RESULT: {pred_label} (score={pred_score:.4f})")
    return result


def _save_heatmap(pred, image_path: str, category: str) -> str:
    """Overlay the anomaly map on the original image and save it to disk."""
    import cv2
    import numpy as np

    anomaly_map = pred.anomaly_map
    if hasattr(anomaly_map, "cpu"):
        anomaly_map = anomaly_map.cpu().numpy()
    anomaly_map = np.squeeze(anomaly_map)

    # Normalize to 0-255 for a color heatmap
    normed = (anomaly_map - anomaly_map.min()) / (anomaly_map.max() - anomaly_map.min() + 1e-8)
    heatmap = cv2.applyColorMap((normed * 255).astype("uint8"), cv2.COLORMAP_JET)

    original = cv2.imread(image_path)
    heatmap_resized = cv2.resize(heatmap, (original.shape[1], original.shape[0]))
    overlay = cv2.addWeighted(original, 0.6, heatmap_resized, 0.4, 0)

    base_name = os.path.splitext(os.path.basename(image_path))[0]
    out_path = os.path.join(HEATMAP_OUTPUT_DIR, f"{category}_{base_name}_heatmap.png")
    cv2.imwrite(out_path, overlay)
    print(f"[predict] Heatmap saved to: {out_path}")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Run PatchCore inference on a single image.")
    parser.add_argument("--category", required=True, help="Trained category name, e.g. bottle")
    parser.add_argument("--image", required=True, help="Path to the image to inspect")
    parser.add_argument("--no-heatmap", action="store_true", help="Skip saving a heatmap image")
    args = parser.parse_args()

    try:
        result = predict_image(args.category, args.image, save_heatmap=not args.no_heatmap)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print("\n" + "=" * 50)
    print("PREDICTION RESULT")
    print("=" * 50)
    for k, v in result.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    main()
