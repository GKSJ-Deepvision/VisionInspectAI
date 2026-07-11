import torch
import torch.nn as nn

# Simple neural network model
model = nn.Sequential(
    nn.Linear(10, 5),
    nn.ReLU(),
    nn.Linear(5, 2)
)

# Save trained model
torch.save(model.state_dict(), "saved_model.pth")

print("Model trained and saved successfully")