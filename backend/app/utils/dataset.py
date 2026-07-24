import os
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

class MVTecDataset(Dataset):
    def __init__(self, root_dir, category, is_train=True, transform=None):
        """
        Args:
            root_dir (str): Path to the mvtec_ad dataset folder.
            category (str): The object category (e.g., 'bottle', 'cable').
            is_train (bool): True for training set (only good images), False for test set.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root_dir = root_dir
        self.category = category
        self.is_train = is_train
        self.transform = transform
        
        self.image_paths = []
        self.labels = [] # 0 for good, 1 for anomaly
        
        self._load_dataset()

    def _load_dataset(self):
        phase = 'train' if self.is_train else 'test'
        category_dir = os.path.join(self.root_dir, self.category, phase)
        
        for folder_name in os.listdir(category_dir):
            folder_path = os.path.join(category_dir, folder_name)
            if not os.path.isdir(folder_path):
                continue
                
            label = 0 if folder_name == 'good' else 1
            
            for file_name in os.listdir(folder_path):
                if file_name.endswith(('.png', '.jpg', '.jpeg')):
                    self.image_paths.append(os.path.join(folder_path, file_name))
                    self.labels.append(label)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label

# --- Test the Loader ---
if __name__ == "__main__":
    data_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    dataset_path = "../data/mvtec_ad" 
    # loading the cateringes
    train_dataset = MVTecDataset(root_dir=dataset_path, category='bottle', is_train=True, transform=data_transforms)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

    print(f"Loaded {len(train_dataset)} training images.")
