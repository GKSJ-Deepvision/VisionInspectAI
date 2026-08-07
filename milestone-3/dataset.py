import logging
from pathlib import Path
from typing import Dict, List, Tuple, Union, Optional
from PIL import Image
import torch
from torch.utils.data import Dataset
import json

# Setup logger for the dataset module
logger = logging.getLogger("visioninspect-ai.dataset")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class MVTecClassifierDataset(Dataset):
    """
    A PyTorch Dataset for loading any MVTec AD category for image classification dynamically.
    """

    def __init__(
        self,
        root_dir: Union[str, Path],
        split: str,
        transform: Optional[object] = None
    ) -> None:
        """
        Initializes the MVTecClassifierDataset.

        Args:
            root_dir (Union[str, Path]): Root path to the specific category directory (e.g., ./datasets/mvtec/cable).
            split (str): The dataset split to load ("train" or "test").
            transform (Optional[object]): Optional PyTorch transforms to apply to the images.
        """
        if split not in ("train", "test"):
            raise ValueError(f"Invalid split '{split}'. Expected 'train' or 'test'.")

        self.root_dir = Path(root_dir)
        self.split = split
        self.transform = transform
        self.samples: List[Tuple[Path, int]] = []

        self.split_dir = self.root_dir / self.split
        if not self.split_dir.exists():
            raise FileNotFoundError(f"Split directory does not exist: {self.split_dir.resolve()}")

        # Dynamically determine LABEL_MAPPING by scanning the 'test' directory
        self.LABEL_MAPPING = self._build_label_mapping()
        self.CLASS_NAMES = self.get_class_names()

        logger.info(f"Scanning split '{self.split}' under: {self.split_dir.resolve()}")
        self._scan_dataset()

    def _build_label_mapping(self) -> Dict[str, int]:
        """
        Scans the 'test' directory to discover all defect classes.
        'good' is always assigned index 0. Other classes are sorted alphabetically.
        """
        test_dir = self.root_dir / "test"
        if not test_dir.exists():
            raise FileNotFoundError(f"Test directory not found for scanning classes: {test_dir}")
            
        classes = []
        for item in test_dir.iterdir():
            if item.is_dir():
                classes.append(item.name)
                
        if "good" not in classes:
            raise ValueError("'good' class folder missing from test directory!")
            
        # Ensure 'good' is always 0
        classes.remove("good")
        classes = sorted(classes)
        
        mapping = {"good": 0}
        for idx, cls_name in enumerate(classes, start=1):
            mapping[cls_name] = idx
            
        logger.info(f"Dynamically generated label mapping: {mapping}")
        return mapping

    def _scan_dataset(self) -> None:
        extensions = {".png", ".jpg", ".jpeg"}

        for class_name, label_id in self.LABEL_MAPPING.items():
            class_dir = self.split_dir / class_name
            if not class_dir.exists():
                if self.split == "train" and class_name != "good":
                    continue
                logger.warning(f"Class folder not found in split directory: {class_dir}")
                continue

            count = 0
            for item in class_dir.iterdir():
                if item.is_file() and item.suffix.lower() in extensions:
                    self.samples.append((item, label_id))
                    count += 1

            if count > 0:
                logger.info(f"Loaded {count} images for class '{class_name}' (label ID: {label_id})")

        if not self.samples:
            raise FileNotFoundError(f"No valid image files found in split directory: {self.split_dir.resolve()}")

        logger.info(f"Total samples loaded for '{self.split}' split: {len(self.samples)}")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, int]:
        if index < 0 or index >= len(self.samples):
            raise IndexError(f"Index {index} out of bounds for dataset of size {len(self.samples)}")

        img_path, label = self.samples[index]

        try:
            with Image.open(img_path) as img:
                image = img.convert("RGB")
                if self.transform is not None:
                    image = self.transform(image)
                return image, label
        except Exception as e:
            logger.error(f"Failed to load image at {img_path}: {e}")
            raise

    def get_class_names(self) -> List[str]:
        # Sort by value (ID) so index matches name correctly
        sorted_mapping = sorted(self.LABEL_MAPPING.items(), key=lambda x: x[1])
        return [item[0] for item in sorted_mapping]

    def get_num_classes(self) -> int:
        return len(self.LABEL_MAPPING)

    def save_classes_to_json(self, filepath: Union[str, Path]) -> None:
        """Saves the sorted CLASS_NAMES to a JSON file for the predictor to load."""
        with open(filepath, 'w') as f:
            json.dump(self.CLASS_NAMES, f)
