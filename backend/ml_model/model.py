import torch.nn as nn
from torchvision.models import resnet18


class DefectModel(nn.Module):

    def __init__(self):

        super().__init__()

        self.model = resnet18(weights="DEFAULT")

        self.model.fc = nn.Linear(
            self.model.fc.in_features,
            4
        )

    def forward(self, x):

        return self.model(x)