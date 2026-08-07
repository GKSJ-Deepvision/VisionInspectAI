import torch
from dataset import get_dataloaders

train_loader, val_loader, test_loader = get_dataloaders()

print("Train Images:", len(train_loader.dataset))
print("Validation Images:", len(val_loader.dataset))
print("Test Images:", len(test_loader.dataset))

images, labels = next(iter(train_loader))

print("Image Shape:", images.shape)
print("Labels:", labels)
