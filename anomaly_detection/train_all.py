import os
import sys
import argparse
from pathlib import Path
import torch

# Add root folder to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.train import train_model

def train_all_categories(force=False):
    dataset_dir = Path(config.DATASET_DIR)
    if not dataset_dir.exists():
        print(f"Error: Dataset directory not found at: {dataset_dir}")
        sys.exit(1)

    # Get all subdirectories (categories) in the dataset directory
    categories = sorted([d.name for d in dataset_dir.iterdir() if d.is_dir() and not d.name.startswith(".")])

    print("="*60)
    print(f"       FITTING PaDiM ANOMALY DETECTION MODELS FOR ALL CATEGORIES       ")
    print(f"Found {len(categories)} categories to process: {', '.join(categories)}")
    print(f"Device: {config.DEVICE}")
    print("="*60)

    for i, category in enumerate(categories, 1):
        print(f"\n[{i}/{len(categories)}] Processing category: '{category}'")

        # Determine model output path
        model_path = config.MODEL_DIR / f"padim_{category}.pth"

        if model_path.exists() and not force:
            print(f"Trained model already exists at {model_path}. Skipping.")
            continue

        print(f"Starting PaDiM fitting for '{category}'...")

        # Run training loop
        try:
            train_model(category=category)
            print(f"Success: PaDiM model for '{category}' fitted and saved to {model_path}")
        except Exception as e:
            print(f"Error fitting category '{category}': {e}")

    print("\n" + "="*60)
    print("   ALL PaDiM MODEL TRAINING WORKFLOWS COMPLETED!")
    print("="*60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PaDiM models for all MVTec AD categories.")
    parser.add_argument("--force", action="store_true", help="Force retrain even if model files exist.")
    args = parser.parse_args()

    train_all_categories(force=args.force)
