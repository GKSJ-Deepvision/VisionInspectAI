import os
from PIL import Image

from torch.utils.data import Dataset
from torchvision import transforms
from ml_model.dataset import BottleDataset


class BottleDataset(Dataset):

    def __init__(self, root_dir):

        self.images = []
        self.labels = []

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor()
        ])

        label_map = {
            "good": 0,
            "broken_large": 1,
            "broken_small": 2,
            "contamination": 3
        }

        classes = list(label_map.keys())

        print("\nLoading Dataset...\n")

        for cls in classes:

            folder = os.path.join(root_dir, cls)

            print(f"Checking Folder : {folder}")

            if not os.path.exists(folder):
                print(f"Folder Not Found : {folder}")
                continue

            files = os.listdir(folder)

            print(f"{cls} -> {len(files)} files")

            for file in files:

                if file.lower().endswith((".png", ".jpg", ".jpeg")):

                    self.images.append(
                        os.path.join(folder, file)
                    )

                    self.labels.append(label_map[cls])

        print("\nTotal Images :", len(self.images))

    def __len__(self):

        return len(self.images)

    def __getitem__(self, index):

        image = Image.open(
            self.images[index]
        ).convert("RGB")

        image = self.transform(image)

        label = self.labels[index]

        return image, label