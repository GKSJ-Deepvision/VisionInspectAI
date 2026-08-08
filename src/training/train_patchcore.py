import os
import sys
import gc
import json
import time
import argparse
from datetime import datetime

# --------------------------------------------------------------------------
# Increase recursion limit - Anomalib's KCenterGreedy coreset selection
# uses one recursive call per selected point, which can exceed Python's
# default limit (1000) even for a single category. This is a known
# limitation of the library's implementation, not a bug in this script.
# --------------------------------------------------------------------------
sys.setrecursionlimit(50000)

# --------------------------------------------------------------------------
# GPU ENFORCEMENT - fail loudly instead of silently falling back to CPU.
# This must run BEFORE any anomalib/torch model code executes.
# --------------------------------------------------------------------------
import torch

if not torch.cuda.is_available():
    raise RuntimeError(
        "CUDA GPU not detected! Refusing to run on CPU (coreset selection "
        "on CPU can take hours). Check your NVIDIA driver and PyTorch "
        "CUDA install: `python -c \"import torch; print(torch.cuda.is_available())\"`"
    )

DEVICE = torch.device("cuda")
print(f"[GPU CHECK] Using device: {DEVICE} ({torch.cuda.get_device_name(0)})")
print(f"[GPU CHECK] Total VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

# --------------------------------------------------------------------------
# CONFIGURATION - edit these values for your setup
# --------------------------------------------------------------------------

DATASET_ROOT = r"D:\Internship_Project\VisionInspectAI\dataset\mvtec_anomaly_detection"
RESULTS_DIR = r"D:\Internship_Project\VisionInspectAI\src\results"
LOG_FILE = r"D:\Internship_Project\VisionInspectAI\src\patchcore_training_log.json"

# Priority order: put the categories you most need for tomorrow's
# presentation FIRST. Anything not listed here will be trained after,
# in alphabetical order. Edit this list based on what your team needs most.
PRIORITY_CATEGORIES = [
    "bottle",
    "cable",
    "capsule",
    "carpet",
    "grid",
    "hazelnut",
    "leather",
    "metal_nut",
    "pill",
    "screw",
]

# Lower this (e.g. 0.05) if training is too slow - trades a small amount of
# accuracy for meaningfully faster coreset selection.
# NOTE: coreset selection (KCenterGreedy) runs on CPU regardless of GPU
# availability - this is an Anomalib library limitation, not a bug here.
# 0.1 took ~2.5 hours on hazelnut (391 train images) alone. 0.02 is a much
# safer default for a laptop - still solid accuracy for MVTec AD categories.
CORESET_SAMPLING_RATIO = 0.02

# Optional per-category override, e.g. {"cable": 0.05, "screw": 0.05}.
# Anything not listed here uses CORESET_SAMPLING_RATIO above. Useful for
# visually complex categories where 0.02 may hurt pixel-level F1 too much,
# without raising the ratio (and GPU memory-bank size) for every category.
CATEGORY_CORESET_OVERRIDES = {
    # "cable": 0.05,
    # "screw": 0.05,
    # "metal_nut": 0.05,
}

# --------------------------------------------------------------------------
# HARDWARE-SPECIFIC SETTINGS - tuned for RTX 3050 (6 GB VRAM).
# --------------------------------------------------------------------------

# 16 was too aggressive for 6 GB alongside wide_resnet50_2 + PatchCore's
# memory bank. 8 is a safer default; if you still see CUDA OOM errors,
# lower FALLBACK_BATCH_SIZE below instead of touching this.
TRAIN_BATCH_SIZE = 8
EVAL_BATCH_SIZE = 8

# If a category OOMs at TRAIN_BATCH_SIZE, the script automatically retries
# that same category ONCE at this smaller batch size before giving up and
# logging it as failed.
FALLBACK_BATCH_SIZE = 4

# Windows + num_workers > 0 is the most common cause of "DataLoader worker
# exited unexpectedly" crashes (spawn overhead, AV interference, RAM
# pressure). 0 means data loads in the main process - slightly slower per
# batch, but far more stable. Raise to 2 only if you've confirmed stability.
NUM_WORKERS = 0

# Seconds to pause between categories. Gives the GPU a moment to fully
# release memory and cool down between runs instead of being hit back to
# back for hours - protects against thermal throttling / instability on a
# laptop GPU.
COOLDOWN_SECONDS_BETWEEN_CATEGORIES = 15

# --------------------------------------------------------------------------


def load_log():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            return json.load(f)
    return {"completed": {}, "failed": {}}


def save_log(log):
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)


def get_all_categories(dataset_root):
    return sorted([
        f for f in os.listdir(dataset_root)
        if os.path.isdir(os.path.join(dataset_root, f))
    ])


def checkpoint_exists(category):
    """Check if a category already has a saved PatchCore checkpoint."""
    category_dir = os.path.join(RESULTS_DIR, "Patchcore", "MVTecAD", category)
    if not os.path.isdir(category_dir):
        return False
    for root, _, files in os.walk(category_dir):
        for f in files:
            if f.endswith(".ckpt"):
                return True
    return False


def print_gpu_memory(prefix=""):
    """Print current GPU memory usage - helps confirm cleanup is working."""
    free_bytes, total_bytes = torch.cuda.mem_get_info()
    free_gb = free_bytes / 1e9
    total_gb = total_bytes / 1e9
    used_gb = total_gb - free_gb
    print(f"[GPU MEM]{' ' + prefix if prefix else ''} "
          f"Used: {used_gb:.2f} GB / {total_gb:.2f} GB  (Free: {free_gb:.2f} GB)")


def cleanup_gpu():
    """
    Aggressively release GPU/CPU memory between categories. This is the
    single most important fix for the crash cascade seen in earlier runs:
    once one category OOM'd or crashed, leftover tensors and DataLoader
    workers kept memory pinned, causing every category after it to fail too.
    """
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
        torch.cuda.synchronize()


def train_one_category(category, batch_size, coreset_ratio=None):
    """Train PatchCore on a single category. Returns a result dict."""
    from anomalib.data import MVTecAD
    from anomalib.models import Patchcore
    from anomalib.engine import Engine

    if coreset_ratio is None:
        coreset_ratio = CATEGORY_CORESET_OVERRIDES.get(category, CORESET_SAMPLING_RATIO)

    print(f"\n{'='*60}")
    print(f"Training category: {category}  (batch_size={batch_size}, "
          f"coreset_ratio={coreset_ratio})")
    print(f"{'='*60}")
    print_gpu_memory("before category start")

    start = time.time()

    print(f"[{category}] Building datamodule and starting fit() - "
          f"the 'Selecting Coreset Indices' progress bar that appears next "
          f"is CPU-bound (not stuck, not using GPU) - this is expected.")

    datamodule = MVTecAD(
        root=DATASET_ROOT,
        category=category,
        train_batch_size=batch_size,
        eval_batch_size=batch_size,
        num_workers=NUM_WORKERS,
    )

    model = Patchcore(
        backbone="wide_resnet50_2",
        layers=["layer2", "layer3"],
        coreset_sampling_ratio=coreset_ratio,
        num_neighbors=9,
        pre_trained=True,
    )

    # Force GPU explicitly - do not let the Engine auto-detect/fall back to
    # CPU. accelerator="gpu" + devices=1 makes Lightning raise an error
    # immediately if no GPU is visible, instead of silently training on CPU.
    engine = Engine(
        default_root_dir=RESULTS_DIR,
        max_epochs=1,
        accelerator="gpu",
        devices=1,
    )

    try:
        engine.fit(model=model, datamodule=datamodule)

        # Sanity check: confirm the trained model actually ended up on GPU.
        try:
            model_device = next(model.parameters()).device
            print(f"[GPU CHECK] Model parameters are on: {model_device}")
        except StopIteration:
            pass

        test_results = engine.test(model=model, datamodule=datamodule)
        elapsed = time.time() - start

        return {
            "category": category,
            "batch_size_used": batch_size,
            "coreset_ratio_used": coreset_ratio,
            "elapsed_seconds": round(elapsed, 1),
            "test_results": test_results,
            "timestamp": datetime.now().isoformat(),
        }
    finally:
        # Always run, whether training succeeded, failed, or OOM'd - this
        # is what prevents one bad category from poisoning the next one.
        del model, engine, datamodule
        cleanup_gpu()
        print_gpu_memory("after cleanup")


def train_one_category_with_retry(category, coreset_ratio=None):
    """
    Try training at the configured batch size. If it fails specifically
    with a CUDA out-of-memory error, clean up and retry ONCE at a smaller
    fallback batch size before giving up on this category.
    """
    try:
        return train_one_category(category, TRAIN_BATCH_SIZE, coreset_ratio)
    except torch.cuda.OutOfMemoryError as e:
        print(f"\n[OOM] '{category}' ran out of GPU memory at batch_size="
              f"{TRAIN_BATCH_SIZE}. Cleaning up and retrying once at "
              f"batch_size={FALLBACK_BATCH_SIZE}...\n")
        cleanup_gpu()
        time.sleep(5)
        return train_one_category(category, FALLBACK_BATCH_SIZE, coreset_ratio)


def parse_args():
    parser = argparse.ArgumentParser(
        description="PatchCore multi-category training. Run with no "
                     "arguments to train the full category list normally."
    )
    parser.add_argument(
        "--category", type=str, default=None,
        help="Test mode: train ONLY this single category and exit. Does "
             "NOT touch the shared training log, so it won't affect your "
             "full run's progress tracking. Use this to safely try a new "
             "coreset ratio before committing to the full 15-category run."
    )
    parser.add_argument(
        "--coreset-ratio", type=float, default=None,
        help="Only used with --category. Overrides the ratio for this "
             "single test run (e.g. 0.05)."
    )
    return parser.parse_args()


def run_single_category_test(category, coreset_ratio):
    """
    Test mode: train exactly one category, print full timing + GPU memory
    info, and exit - without writing to the shared progress log. Use this
    to check a new coreset_ratio (or any setting) is safe before applying
    it to the full run.
    """
    print("VisionInspect AI - PatchCore SINGLE-CATEGORY TEST MODE")
    print(f"Category: {category}")
    print(f"Coreset ratio: "
          f"{coreset_ratio if coreset_ratio is not None else CATEGORY_CORESET_OVERRIDES.get(category, CORESET_SAMPLING_RATIO)}")
    print("NOTE: this run will NOT be written to the training log.\n")

    if not os.path.exists(DATASET_ROOT):
        print(f"ERROR: Dataset path not found: {DATASET_ROOT}")
        sys.exit(1)

    all_categories = get_all_categories(DATASET_ROOT)
    if category not in all_categories:
        print(f"ERROR: '{category}' not found in dataset folder. "
              f"Available categories: {all_categories}")
        sys.exit(1)

    try:
        result = train_one_category_with_retry(category, coreset_ratio)
        print("\n" + "=" * 60)
        print("TEST RESULT")
        print("=" * 60)
        print(json.dumps(result, indent=2, default=str))
        print("\nIf VRAM usage and timing above look safe, apply this "
              "ratio via CATEGORY_CORESET_OVERRIDES (or CORESET_SAMPLING_RATIO) "
              "and run the full script normally.")
    except Exception as e:
        print(f"\nTEST FAILED for '{category}': {e}")
        cleanup_gpu()
        sys.exit(1)


def main():
    print("VisionInspect AI - PatchCore Multi-Category Training")
    print(f"Dataset root: {DATASET_ROOT}")

    if not os.path.exists(DATASET_ROOT):
        print(f"ERROR: Dataset path not found: {DATASET_ROOT}")
        print("Update DATASET_ROOT at the top of this script and try again.")
        sys.exit(1)

    all_categories = get_all_categories(DATASET_ROOT)
    print(f"Found {len(all_categories)} categories in dataset folder.")

    # Build training order: priority list first, then anything else alphabetically
    remaining = [c for c in all_categories if c not in PRIORITY_CATEGORIES]
    training_order = [c for c in PRIORITY_CATEGORIES if c in all_categories] + remaining

    log = load_log()

    print(f"\nTraining order ({len(training_order)} categories):")
    for i, c in enumerate(training_order, 1):
        status = "already done" if (c in log["completed"] or checkpoint_exists(c)) else "pending"
        print(f"  {i:2d}. {c:15s} [{status}]")

    print(f"\nStarting run at {datetime.now().isoformat()}\n")

    for category in training_order:
        if category in log["completed"]:
            print(f"Skipping '{category}' - already marked complete in {LOG_FILE}")
            continue
        if checkpoint_exists(category):
            print(f"Skipping '{category}' - checkpoint already exists on disk")
            log["completed"][category] = {"note": "checkpoint found on disk, not re-trained"}
            save_log(log)
            continue

        try:
            result = train_one_category_with_retry(category)
            log["completed"][category] = result
            save_log(log)
            print(f"\n'{category}' completed in {result['elapsed_seconds']:.0f} seconds "
                  f"(batch_size={result['batch_size_used']}).")
            print(f"Progress saved to {LOG_FILE}\n")
        except Exception as e:
            print(f"\nERROR training '{category}': {e}")
            log["failed"][category] = {
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
            save_log(log)
            # Defensive cleanup even if train_one_category's own finally
            # block didn't run for some reason (e.g. error before engine
            # was created).
            cleanup_gpu()
            print(f"Logged failure for '{category}'. Continuing to next category.\n")

        # Cooldown between categories regardless of success/failure - avoids
        # slamming the GPU with back-to-back workloads for hours straight.
        print(f"[COOLDOWN] Waiting {COOLDOWN_SECONDS_BETWEEN_CATEGORIES}s before next category...\n")
        time.sleep(COOLDOWN_SECONDS_BETWEEN_CATEGORIES)

    print("\n" + "=" * 60)
    print("RUN SUMMARY")
    print("=" * 60)
    print(f"Completed: {len(log['completed'])} / {len(training_order)}")
    print(f"Failed:    {len(log['failed'])}")
    if log["completed"]:
        print("\nCompleted categories:")
        for c in log["completed"]:
            print(f"  - {c}")
    if log["failed"]:
        print("\nFailed categories (see error details in training_log.json):")
        for c in log["failed"]:
            print(f"  - {c}")


if __name__ == "__main__":
    args = parse_args()
    if args.category:
        run_single_category_test(args.category, args.coreset_ratio)
    else:
        main()
