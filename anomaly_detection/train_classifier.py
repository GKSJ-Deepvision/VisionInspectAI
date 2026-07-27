import os
import sys
import argparse
from pathlib import Path
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

# Add root folder to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.classifier import DefectClassifier, CATEGORY_DEFECT_CLASSES

class MultiClassMVTecDataset(Dataset):
    """
    Dataset loader for multi-class defect classification.
    Combines images from both train/ and test/ splits to get all defect classes.
    """
    def __init__(self, category=None, dataset_dir=None, transform=None):
        self.dataset_dir = Path(dataset_dir or config.DATASET_DIR)
        self.category = (category or config.CATEGORY).lower()
        self.category_dir = self.dataset_dir / self.category
        
        if not self.category_dir.exists():
            raise FileNotFoundError(f"Category directory not found: {self.category_dir}")
            
        self.classes = CATEGORY_DEFECT_CLASSES.get(self.category, ["good", "defective"])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        self.image_paths = []
        self.labels = []
        
        # Default data transforms
        if transform is None:
            self.transform = transforms.Compose([
                transforms.Resize(config.IMAGE_SIZE),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomRotation(degrees=10),
                transforms.ColorJitter(brightness=0.1, contrast=0.1),
                transforms.ToTensor()
            ])
        else:
            self.transform = transform
            
        self._load_all_images()
        
    def _load_all_images(self):
        for split in ["train", "test"]:
            split_dir = self.category_dir / split
            if not split_dir.exists():
                continue
                
            for sub_dir in split_dir.iterdir():
                if not sub_dir.is_dir():
                    continue
                    
                defect_name = sub_dir.name
                # Map defect name to class index
                if defect_name in self.class_to_idx:
                    class_idx = self.class_to_idx[defect_name]
                else:
                    # Fallback to closest matching class or default
                    class_idx = self.class_to_idx.get("good", 0)
                    for k, idx in self.class_to_idx.items():
                        if k in defect_name or defect_name in k:
                            class_idx = idx
                            break
                            
                for file_path in sub_dir.glob("*"):
                    if file_path.suffix.lower() in [".png", ".jpg", ".jpeg", ".bmp", ".tif"]:
                        self.image_paths.append(str(file_path))
                        self.labels.append(class_idx)
                        
        print(f"Loaded {len(self.image_paths)} images across {len(self.classes)} classes for category '{self.category}'")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label

def train_category_classifier(category="bottle", epochs=10, batch_size=16, lr=1e-3):
    category = category.lower()
    device = torch.device(config.DEVICE)
    print(f"\n" + "="*60)
    print(f" TRAINING DEFECT CLASSIFIER FOR CATEGORY: '{category}' ")
    print(f"="*60)
    
    try:
        dataset = MultiClassMVTecDataset(category=category)
    except Exception as e:
        print(f"Failed to load dataset for category '{category}': {e}")
        return None
        
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, drop_last=False)
    num_classes = len(dataset.classes)
    
    model = DefectClassifier(num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    
    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for imgs, labels in dataloader:
            imgs, labels = imgs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * imgs.size(0)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        scheduler.step()
        epoch_loss = running_loss / total
        accuracy = (correct / total) * 100.0
        print(f"Epoch [{epoch}/{epochs}] - Loss: {epoch_loss:.4f} | Accuracy: {accuracy:.2f}%")
        
    # Save trained classifier
    model_path = config.MODEL_DIR / f"classifier_{category}.pth"
    torch.save(model.state_dict(), model_path)
    print(f"Trained classifier for '{category}' saved to: {model_path}")
    return model

def train_all_classifiers(epochs=10):
    dataset_dir = Path(config.DATASET_DIR)
    if not dataset_dir.exists():
        print(f"Dataset dir not found: {dataset_dir}")
        return
        
    categories = [d.name for d in dataset_dir.iterdir() if d.is_dir() and d.name != ".git"]
    print(f"Found {len(categories)} categories to train classifiers: {categories}")
    
    for cat in categories:
        train_category_classifier(category=cat, epochs=epochs)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train multi-class defect classifiers.")
    parser.add_argument("--category", type=str, default="bottle", help="Category name or 'all'")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    args = parser.parse_args()
    
    if args.category.lower() == "all":
        train_all_classifiers(epochs=args.epochs)
    else:
        train_category_classifier(category=args.category, epochs=args.epochs)
