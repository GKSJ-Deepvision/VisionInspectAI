import os
import sys
import argparse
from pathlib import Path
import torch

# Add root folder to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.train import train_model

def train_all_categories(epochs=10, force=False):
    dataset_dir = Path(config.DATASET_DIR)
    if not dataset_dir.exists():
        print(f"Error: Dataset directory not found at: {dataset_dir}")
        sys.exit(1)
        
    # Get all subdirectories (categories) in the dataset directory
    categories = [d.name for d in dataset_dir.iterdir() if d.is_dir() and d.name != ".git"]
    
    print("="*60)
    print(f"       TRAINING ANOMALY AUTOENCODERS FOR ALL CATEGORIES       ")
    print(f"Found {len(categories)} categories to process: {', '.join(categories)}")
    print(f"Epochs per category: {epochs}")
    print(f"Device: {config.DEVICE}")
    print("="*60)
    
    for i, category in enumerate(categories, 1):
        print(f"\n[{i}/{len(categories)}] Processing category: '{category}'")
        
        # Determine model output path
        model_path = config.MODEL_DIR / f"autoencoder_{category}.pth"
        
        if model_path.exists() and not force:
            print(f"Trained model already exists at {model_path}. Skipping.")
            continue
            
        print(f"Starting training for '{category}'...")
        
        # Dynamically override config variables
        config.CATEGORY = category
        config.MODEL_PATH = model_path
        
        # Run training loop
        try:
            train_model(category=category, num_epochs=epochs)
            print(f"Success: Model for '{category}' trained and saved to {model_path}")
        except Exception as e:
            print(f"Error training category '{category}': {e}")
            
    print("\n" + "="*60)
    print("   ALL MODEL TRAINING WORKFLOWS COMPLETED!")
    print("="*60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Autoencoders for all MVTec AD categories.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs per category.")
    parser.add_argument("--force", action="store_true", help="Force retrain even if model files exist.")
    args = parser.parse_args()
    
    train_all_categories(epochs=args.epochs, force=args.force)
