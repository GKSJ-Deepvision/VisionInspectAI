
from __future__ import annotations

import json
import logging
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image, UnidentifiedImageError

from sklearn.model_selection import train_test_split

from torch.utils.data import Dataset
from torch.utils.data import DataLoader

from torchvision import transforms

from data import config

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s | %(message)s",
)

logger = logging.getLogger(__name__)

class DefectDataset(Dataset):
    """
    PyTorch Dataset for defect classification.
    """

    def __init__(
        self,
        samples: List[Tuple[Path, int]],
        transform=None,
    ) -> None:

        self.samples = samples
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, index: int):

        image_path, label = self.samples[index]

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


class ClassifierDatasetBuilder:
    """
    Creates training and validation dataloaders for
    EfficientNet defect classifier.
    """

    def __init__(self):

        self.dataset_root = config.PROCESSED_DATASET_ROOT

        self.batch_size = config.CLASSIFIER_BATCH_SIZE

        self.train_split = config.TRAIN_SPLIT

        self.validation_split = config.VALIDATION_SPLIT

        self.random_seed = config.RANDOM_SEED

        self.label_file = config.CLASSIFIER_LABELS_PATH

        self.image_extensions = config.IMAGE_EXTENSIONS

        self.class_to_index = {}

        self.index_to_class = {}

        self.class_counts = {}


    @staticmethod
    def get_train_transforms():

        return transforms.Compose(
            [
                transforms.Resize(config.CLASSIFIER_IMAGE_SIZE),

                transforms.RandomHorizontalFlip(),

                transforms.RandomRotation(10),

                transforms.ColorJitter(
                    brightness=0.2,
                    contrast=0.2,
                    saturation=0.2,
                ),

                transforms.ToTensor(),

                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    @staticmethod
    def get_validation_transforms():

        return transforms.Compose(
            [
                transforms.Resize(config.CLASSIFIER_IMAGE_SIZE),

                transforms.ToTensor(),

                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )


    def scan_dataset(self) -> Dict[str, List[Path]]:
        """
        Scan the processed dataset and collect all defective images.

        Returns
        -------
        Dict[str, List[Path]]
            Dictionary containing
            {
                "bottle_broken_large": [...],
                "cable_bent_wire": [...],
                ...
            }
        """

        if not self.dataset_root.exists():
            raise FileNotFoundError(
                f"Processed dataset not found:\n{self.dataset_root}"
            )

        defect_images = defaultdict(list)

        logger.info("Scanning processed dataset...")

        for category in config.CATEGORIES:

            test_dir = self.dataset_root / category / "test"

            if not test_dir.exists():
                logger.warning("Missing directory: %s", test_dir)
                continue

            logger.info("Scanning category: %s", category)

            for defect_dir in sorted(test_dir.iterdir()):

                if not defect_dir.is_dir():
                    continue

                if defect_dir.name.lower() == "good":
                    continue

                class_name = f"{category}_{defect_dir.name}"

                image_count = 0

                for image_path in sorted(defect_dir.iterdir()):

                    if not image_path.is_file():
                        continue

                    if image_path.suffix.lower() not in self.image_extensions:
                        continue

                    try:
                        Image.open(image_path).verify()

                        defect_images[class_name].append(image_path)

                        image_count += 1

                    except (
                        UnidentifiedImageError,
                        OSError,
                    ):

                        logger.warning(
                            "Skipping corrupted image: %s",
                            image_path.name,
                        )

                logger.info(
                    "%-40s %4d images",
                    class_name,
                    image_count,
                )

        if len(defect_images) == 0:
            raise RuntimeError(
                "No defect images were found in the processed dataset."
            )

        return defect_images


    def create_label_mapping(
        self,
        defect_images: Dict[str, List[Path]],
    ) -> None:
        """
        Create integer labels for each defect class.
        """

        classes = sorted(defect_images.keys())

        self.class_to_index = {
            class_name: index
            for index, class_name in enumerate(classes)
        }

        self.index_to_class = {
            index: class_name
            for class_name, index in self.class_to_index.items()
        }

        logger.info(
            "Detected %d unique defect classes.",
            len(self.class_to_index),
        )

    def build_samples(
        self,
        defect_images: Dict[str, List[Path]],
    ) -> List[Tuple[Path, int]]:
        """
        Convert image dictionary into a list of
        (image_path, label) tuples.
        """

        samples = []

        self.class_counts.clear()

        for class_name, images in defect_images.items():

            label = self.class_to_index[class_name]

            self.class_counts[class_name] = len(images)

            for image_path in images:

                samples.append(
                    (
                        image_path,
                        label,
                    )
                )

        logger.info(
            "Collected %d defective images.",
            len(samples),
        )

        return samples

    def save_labels(self) -> None:
        """
        Save label mapping as JSON.
        """

        self.label_file.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with open(
            self.label_file,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                self.class_to_index,
                file,
                indent=4,
            )

        logger.info(
            "Label mapping saved to %s",
            self.label_file,
        )

    def create_dataloaders(
        self,
        samples: List[Tuple[Path, int]],
    ):
        """
        Create train and validation DataLoaders.
        """

        labels = [label for _, label in samples]

        train_samples, validation_samples = train_test_split(
            samples,
            test_size=self.validation_split,
            random_state=self.random_seed,
            stratify=labels,
            shuffle=True,
        )

        train_dataset = DefectDataset(
            train_samples,
            self.get_train_transforms(),
        )

        validation_dataset = DefectDataset(
            validation_samples,
            self.get_validation_transforms(),
        )

        train_loader = DataLoader(
            train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            num_workers=config.NUM_WORKERS,
            pin_memory=True,
        )

        validation_loader = DataLoader(
            validation_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=config.NUM_WORKERS,
            pin_memory=True,
        )

        return (
            train_loader,
            validation_loader,
            len(train_samples),
            len(validation_samples),
        )

    def print_statistics(
        self,
        total_images: int,
        train_images: int,
        validation_images: int,
    ) -> None:

        logger.info(config.LINE)
        logger.info("Universal Defect Classification Dataset")
        logger.info(config.LINE)

        logger.info("Dataset Root      : %s", self.dataset_root)
        logger.info("Classes           : %d", len(self.class_to_index))
        logger.info("Total Images      : %d", total_images)
        logger.info("Training Images   : %d", train_images)
        logger.info("Validation Images : %d", validation_images)

        logger.info(config.SUBLINE)

        for class_name in sorted(self.class_counts):

            logger.info(
                "%-40s %5d",
                class_name,
                self.class_counts[class_name],
            )

        logger.info(config.LINE)



    def build(self):
        """
        Complete dataset preparation pipeline.
        """

        defect_images = self.scan_dataset()

        self.create_label_mapping(defect_images)

        samples = self.build_samples(defect_images)

        (
            train_loader,
            validation_loader,
            train_count,
            validation_count,
        ) = self.create_dataloaders(samples)

        self.save_labels()

        self.print_statistics(
            total_images=len(samples),
            train_images=train_count,
            validation_images=validation_count,
        )

        return (
            train_loader,
            validation_loader,
            self.class_to_index,
            self.index_to_class,
        )


def main():

    builder = ClassifierDatasetBuilder()

    builder.build()


if __name__ == "__main__":
    main()
