import os
import sys
import os

# Ensure backend directory is in the python path to resolve 'ai.dataset' imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import time
import logging
import gc
from pathlib import Path
from typing import Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split

from ai.dataset import MVTecClassifierDataset
from ai.transforms import get_train_transform, get_test_transform
from ai.model import get_resnet18_classifier

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("visioninspect-ai.train_classifier")


def train_classifier(
    category: str = "bottle",
    epochs: int = 15,
    batch_size: int = 16,
    learning_rate: float = 0.001,
    patience: int = 5
) -> None:
    """
    Trains the ResNet18 defect classifier dynamically for a specific category.
    """
    data_path = Path(f"./datasets/mvtec/{category}")
    if not data_path.exists():
        logger.error(f"Dataset path not found: {data_path.resolve()}")
        print(f"\n[ERROR] Category dataset path does not exist: {data_path.resolve()}")
        return

    results_dir = Path(f"./backend/results/{category}/weights")
    results_dir.mkdir(parents=True, exist_ok=True)
    
    save_path = results_dir / "best_classifier.pth"
    classes_path = results_dir / "classes.json"

    print("======================================================================")
    print(f"   VisionInspect AI - ResNet18 Classifier Training: {category.upper()} ")
    print("======================================================================")
    print(f"Dataset Directory : {data_path.resolve()}")
    print(f"Results Directory : {results_dir.resolve()}")
    
    # 1. Device selection
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using execution device: {device}")

    # 2. Initialize Datasets & Transforms
    try:
        train_val_dataset = MVTecClassifierDataset(
            root_dir=data_path,
            split="train",
            transform=get_train_transform()
        )
        
        test_dataset = MVTecClassifierDataset(
            root_dir=data_path,
            split="test",
            transform=get_test_transform()
        )
    except Exception as e:
        logger.error(f"Failed to load datasets: {e}")
        return
        
    # Save the dynamic class map to JSON
    train_val_dataset.save_classes_to_json(classes_path)
    num_classes = train_val_dataset.get_num_classes()
    class_names = train_val_dataset.get_class_names()
    print(f"Detected {num_classes} classes: {class_names}")

    print("Combining train and test directories to generate multi-class splits...")
    full_dataset = torch.utils.data.ConcatDataset([train_val_dataset, test_dataset])
    total_len = len(full_dataset)
    
    val_len = int(total_len * 0.20)
    train_len = total_len - val_len
    
    # Split into train/validation sets
    train_split, val_split = random_split(
        full_dataset, 
        [train_len, val_len], 
        generator=torch.Generator().manual_seed(42)
    )

    # 3. Create DataLoaders
    train_loader = DataLoader(train_split, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_split, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)

    # 4. Initialize ResNet18 model dynamically
    model = get_resnet18_classifier(num_classes=num_classes, freeze_backbone=True)
    model = model.to(device)

    # 5. Define Loss, Optimizer, and Scheduler
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.fc.parameters(), lr=learning_rate)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    # 6. Training Loop with Early Stopping
    best_val_loss = float("inf")
    best_val_acc = 0.0
    patience_counter = 0

    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        
        model.train()
        train_loss, train_corrects = 0.0, 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            _, preds = torch.max(outputs, 1)
            train_loss += loss.item() * images.size(0)
            train_corrects += torch.sum(preds == labels.data).item()
            
        epoch_train_loss = train_loss / train_len
        epoch_train_acc = (train_corrects / train_len) * 100.0
        
        model.eval()
        val_loss, val_corrects = 0.0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                _, preds = torch.max(outputs, 1)
                val_loss += loss.item() * images.size(0)
                val_corrects += torch.sum(preds == labels.data).item()
                
        epoch_val_loss = val_loss / val_len
        epoch_val_acc = (val_corrects / val_len) * 100.0
        
        scheduler.step(epoch_val_loss)
        epoch_duration = time.time() - epoch_start
        
        print(f"Epoch {epoch:02d}/{epochs:02d} | "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}% | "
              f"Duration: {epoch_duration:.1f}s")
              
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            best_val_acc = epoch_val_acc
            patience_counter = 0
            torch.save(model.state_dict(), save_path)
            print(f" ---> [SAVED] New best model checkpoint saved to: {save_path}")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"\n[INFO] Early stopping triggered. Training stopped at epoch {epoch}.")
                break

    print("\n=======================================================")
    print(" Training Completed Successfully!")
    print(f" Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f" Model weights saved to  : {save_path.resolve()}")
    print("=======================================================")


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "bottle"
    
    if target == "all":
        categories = [
            "bottle", "cable", "capsule", "carpet", "grid", 
            "hazelnut", "leather", "metal_nut", "pill", "screw", 
            "tile", "toothbrush", "transistor", "wood", "zipper"
        ]
        for cat in categories:
            expected_weights = Path(f"./backend/results/{cat}/weights/best_classifier.pth")
            if expected_weights.exists():
                print(f"⏩ Skipping {cat}: Classifier weights already exist")
                continue
                
            train_classifier(category=cat)
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        print("\n🎉 Batch training complete! All 15 classifiers are ready.")
    else:
        train_classifier(category=target)
