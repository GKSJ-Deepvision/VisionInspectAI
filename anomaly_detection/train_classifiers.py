import os
import sys
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image

# Adjust sys path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.classifier import CATEGORY_DEFECT_CLASSES

class DefectDataset(Dataset):
    """
    PyTorch Dataset for multi-class defect categorization across MVTec AD test subdirectories.
    """
    def __init__(self, category: str, transform=None):
        self.category = category.lower()
        self.transform = transform
        self.samples = []
        self.classes = CATEGORY_DEFECT_CLASSES.get(self.category, ["good", "defective"])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        category_dir = config.DATASET_DIR / self.category
        
        # 1. Load train/good images
        train_good = category_dir / "train" / "good"
        if train_good.exists():
            for p in train_good.glob("*"):
                if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".bmp", ".tiff"):
                    self.samples.append((p, self.class_to_idx.get("good", 0)))
                    
        # 2. Load test subdirectories (good + all defect sub-types)
        test_dir = category_dir / "test"
        if test_dir.exists():
            for sub_dir in test_dir.iterdir():
                if sub_dir.is_dir():
                    defect_name = sub_dir.name
                    class_idx = self.class_to_idx.get(defect_name, 0)
                    for p in sub_dir.glob("*"):
                        if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".bmp", ".tiff"):
                            self.samples.append((p, class_idx))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label

def train_classifier_for_category(category: str, epochs: int = 15, batch_size: int = 16):
    """
    Trains a fine-tuned ResNet18 classifier for a specific MVTec category on all defect sub-types.
    """
    category = category.lower()
    classes = CATEGORY_DEFECT_CLASSES.get(category, ["good", "defective"])
    num_classes = len(classes)
    
    print(f"\n" + "="*65)
    print(f"  TRAINING DEFECT CLASSIFIER FOR '{category.upper()}' ({num_classes} classes)")
    print(f"  Classes: {classes}")
    print("="*65)
    
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    dataset = DefectDataset(category=category, transform=train_transform)
    if len(dataset) == 0:
        print(f"No samples found for category '{category}'. Skipping.")
        return
        
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    
    # Fine-tune pre-trained ResNet18
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    model = model.to(config.DEVICE)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    model.train()
    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        correct = 0
        total = 0
        
        for imgs, labels in loader:
            imgs, labels = imgs.to(config.DEVICE), labels.to(config.DEVICE)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * imgs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
        scheduler.step()
        epoch_loss = running_loss / total
        epoch_acc = (correct / total) * 100.0
        if epoch % 5 == 0 or epoch == epochs:
            print(f"  Epoch [{epoch:02d}/{epochs:02d}] - Loss: {epoch_loss:.4f} - Accuracy: {epoch_acc:.2f}%")
            
    # Save state dict of ResNet18Classifier wrapper so keys match resnet.conv1, resnet.fc, etc.
    from anomaly_detection.classifier import ResNet18Classifier
    wrapper_model = ResNet18Classifier(num_classes=num_classes)
    wrapper_model.resnet = model
    
    save_path = config.MODEL_DIR / f"classifier_{category}.pth"
    torch.save(wrapper_model.state_dict(), save_path)
    print(f"[+] Saved classifier weights for '{category}' to: {save_path}")


def train_all_classifiers(epochs: int = 15):
    categories = sorted(CATEGORY_DEFECT_CLASSES.keys())
    print(f"Starting defect classifier training across {len(categories)} categories...")
    for cat in categories:
        train_classifier_for_category(cat, epochs=epochs)
        
    print("\n" + "="*65)
    print("   ALL DEFECT CLASSIFIER MODELS TRAINED SUCCESSFULLY!")
    print("="*65)

if __name__ == "__main__":
    train_all_classifiers(epochs=15)
