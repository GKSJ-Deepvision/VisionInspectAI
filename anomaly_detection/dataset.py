import os
from pathlib import Path
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from . import config
from .preprocessor import get_category_transforms

class MVTecDataset(Dataset):
    """
    Custom PyTorch Dataset for MVTec Anomaly Detection.
    Loads normal samples for training, and both normal and anomalous samples for testing.
    Uses category-optimized preprocessing transforms to ensure training-inference consistency.
    """
    def __init__(self, dataset_dir=None, category=None, split="train", transform=None):
        self.dataset_dir = Path(dataset_dir or config.DATASET_DIR)
        self.category = (category or config.CATEGORY).lower()
        self.split = split
        
        self.category_dir = self.dataset_dir / self.category
        if not self.category_dir.exists():
            raise FileNotFoundError(f"Category directory does not exist: {self.category_dir}")
            
        self.image_paths = []
        self.labels = []  # 0 for normal (good), 1 for anomalous
        self.defect_types = []  # string description (e.g. 'good', 'broken_large')
        
        # Define category-optimized transforms if none provided
        if transform is None:
            self.transform = get_category_transforms(
                category=self.category,
                split=self.split,
                image_size=config.IMAGE_SIZE
            )
        else:
            self.transform = transform
            
        self._load_image_list()
        
    def _load_image_list(self):
        split_dir = self.category_dir / self.split
        if not split_dir.exists():
            raise FileNotFoundError(f"Split directory does not exist: {split_dir}")
            
        # Walk through subdirectories
        for subdir in split_dir.iterdir():
            if not subdir.is_dir():
                continue
                
            defect_type = subdir.name
            label = 0 if defect_type == "good" else 1
            
            for file_path in subdir.glob("*"):
                # Support standard image extensions
                if file_path.suffix.lower() in [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"]:
                    self.image_paths.append(str(file_path))
                    self.labels.append(label)
                    self.defect_types.append(defect_type)
                    
        print(f"Loaded {len(self.image_paths)} images for MVTec Dataset ({self.category} - {self.split} split)")
        
    def __len__(self):
        return len(self.image_paths)
        
    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        defect_type = self.defect_types[idx]
        
        # Load image consistently in 3-channel RGB mode
        img = Image.open(img_path).convert("RGB")
        
        if self.transform:
            img = self.transform(img)
            
        return img, label, defect_type, img_path

def get_dataloaders(dataset_dir=None, category=None, batch_size=None, num_workers=0):
    """
    Helper function to create Train and Test dataloaders.
    """
    batch_size = batch_size or config.BATCH_SIZE
    
    train_dataset = MVTecDataset(dataset_dir=dataset_dir, category=category, split="train")
    test_dataset = MVTecDataset(dataset_dir=dataset_dir, category=category, split="test")
    
    pin_memory = torch.cuda.is_available()
    
    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        drop_last=False,
        num_workers=num_workers,
        pin_memory=pin_memory
    )
    test_loader = torch.utils.data.DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        drop_last=False,
        num_workers=num_workers,
        pin_memory=pin_memory
    )
    
    return train_loader, test_loader
