
import os
import sys
import json
import time
from datetime import datetime

# --------------------------------------------------------------------------
# Increase recursion limit - Anomalib's KCenterGreedy coreset selection
# uses one recursive call per selected point, which can exceed Python's
# default limit (1000) even for a single category. This is a known
# limitation of the library's implementation, not a bug in this script.
# --------------------------------------------------------------------------
sys.setrecursionlimit(50000)

# --------------------------------------------------------------------------
# CONFIGURATION - edit these values for your setup
# --------------------------------------------------------------------------

DATASET_ROOT = r"D:\Internship_Project\VisionInspectAI\dataset\mvtec_anomaly_detection"
RESULTS_DIR = "./results"
LOG_FILE = "./training_log.json"

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

# Lower this (e.g. 0.05) if training is too slow on CPU - trades a small
# amount of accuracy for meaningfully faster coreset selection.
CORESET_SAMPLING_RATIO = 0.1

MAX_TRAIN_SECONDS_PER_CATEGORY = None  # e.g. 2400 to hard-cap at 40 min/category, or None for no limit

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


def train_one_category(category):
    """Train PatchCore on a single category. Returns a result dict."""
    from anomalib.data import MVTecAD
    from anomalib.models import Patchcore
    from anomalib.engine import Engine

    print(f"\n{'='*60}")
    print(f"Training category: {category}")
    print(f"{'='*60}")

    start = time.time()

    datamodule = MVTecAD(
        root=DATASET_ROOT,
        category=category,
        train_batch_size=16,
        eval_batch_size=16,
    )

    model = Patchcore(
        backbone="wide_resnet50_2",
        layers=["layer2", "layer3"],
        coreset_sampling_ratio=CORESET_SAMPLING_RATIO,
        num_neighbors=9,
        pre_trained=True,
    )

    engine = Engine(default_root_dir=RESULTS_DIR, max_epochs=1)
    engine.fit(model=model, datamodule=datamodule)

    test_results = engine.test(model=model, datamodule=datamodule)

    elapsed = time.time() - start

    return {
        "category": category,
        "elapsed_seconds": round(elapsed, 1),
        "test_results": test_results,
        "timestamp": datetime.now().isoformat(),
    }


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
            result = train_one_category(category)
            log["completed"][category] = result
            save_log(log)
            print(f"\n'{category}' completed in {result['elapsed_seconds']:.0f} seconds.")
            print(f"Progress saved to {LOG_FILE}\n")
        except Exception as e:
            print(f"\nERROR training '{category}': {e}")
            log["failed"][category] = {
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
            save_log(log)
            print(f"Logged failure for '{category}'. Continuing to next category.\n")
            continue

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
    main()
