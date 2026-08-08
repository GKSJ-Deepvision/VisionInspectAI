import os
import torch
import torch.nn as nn
import torch.optim as optim

from torch.utils.data import DataLoader

from dataset import BottleDataset
from model import DefectModel

# ---------------------------------
# Dataset Path
# ---------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

dataset_path = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "..",
        "dataset",
        "mvtec_anomaly_detection",
        "bottle",
        "test"
    )
)

print("\nCurrent Working Directory")
print(os.getcwd())

print("\nDataset Path")
print(dataset_path)

print("\nDataset Exists")
print(os.path.exists(dataset_path))

# ---------------------------------
# Load Dataset
# ---------------------------------

train_dataset = BottleDataset(dataset_path)

if len(train_dataset) == 0:
    raise Exception("Dataset is empty. Check dataset path.")

train_loader = DataLoader(
    train_dataset,
    batch_size=8,
    shuffle=True
)

# ---------------------------------
# Device
# ---------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("\nUsing Device :", device)

# ---------------------------------
# Model
# ---------------------------------

model = DefectModel().to(device)

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.001
)

epochs = 5

# ---------------------------------
# Training
# ---------------------------------

print("\nTraining Started...\n")

for epoch in range(epochs):

    model.train()

    running_loss = 0

    correct = 0

    total = 0

    for images, labels in train_loader:

        images = images.to(device)

        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total

    print(
        f"Epoch {epoch+1}/{epochs} | "
        f"Loss : {running_loss:.4f} | "
        f"Accuracy : {accuracy:.2f}%"
    )

# ---------------------------------
# Save Model
# ---------------------------------

save_path = os.path.join(
    BASE_DIR,
    "saved_model.pth"
)

torch.save(
    model.state_dict(),
    save_path
)

print("\nModel Saved Successfully")

print("Saved At :", save_path)