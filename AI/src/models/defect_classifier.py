import torch
import torch.nn as nn
from torchvision.models import (
    efficientnet_b0,
    EfficientNet_B0_Weights,
)

from data import config


class DefectClassifier(nn.Module):

    def __init__(
        self,
        num_classes: int,
        pretrained: bool = True,
        freeze_backbone: bool = False,
    ):

        super().__init__()

        if pretrained:
            weights = EfficientNet_B0_Weights.DEFAULT
        else:
            weights = None

        self.backbone = efficientnet_b0(weights=weights)

        if freeze_backbone:
            for param in self.backbone.features.parameters():
                param.requires_grad = False

        in_features = self.backbone.classifier[1].in_features

        self.backbone.classifier = nn.Sequential(
            nn.Dropout(
                p=config.CLASSIFIER_DROPOUT,
                inplace=True,
            ),
            nn.Linear(
                in_features,
                num_classes,
            ),
        )

        self._initialize_weights()

    def forward(self, x):

        return self.backbone(x)

    def unfreeze_backbone(self):

        for param in self.backbone.features.parameters():
            param.requires_grad = True

    def freeze_backbone(self):

        for param in self.backbone.features.parameters():
            param.requires_grad = False

    @staticmethod
    def count_trainable_parameters(model):

        return sum(
            p.numel()
            for p in model.parameters()
            if p.requires_grad
        )

    @staticmethod
    def count_total_parameters(model):

        return sum(
            p.numel()
            for p in model.parameters()
        )

    def _initialize_weights(self):

        for module in self.backbone.classifier.modules():

            if isinstance(module, nn.Linear):

                nn.init.xavier_uniform_(module.weight)

                if module.bias is not None:
                    nn.init.zeros_(module.bias)


def build_classifier(
    num_classes: int,
):

    model = DefectClassifier(
        num_classes=num_classes,
        pretrained=True,
        freeze_backbone=config.FREEZE_BACKBONE,
    )

    return model


if __name__ == "__main__":

    model = build_classifier(73)

    print(model)

    print(
        "\nTotal Parameters:",
        DefectClassifier.count_total_parameters(model),
    )

    print(
        "Trainable Parameters:",
        DefectClassifier.count_trainable_parameters(model),
    )

    x = torch.randn(
        2,
        3,
        config.CLASSIFIER_IMAGE_SIZE[0],
        config.CLASSIFIER_IMAGE_SIZE[1],
    )

    y = model(x)

    print("Output Shape:", y.shape)