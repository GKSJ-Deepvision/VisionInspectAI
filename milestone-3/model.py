import torch.nn as nn
import torchvision.models as models
from torchvision.models import ResNet18_Weights

def get_resnet18_classifier(num_classes: int = 4, freeze_backbone: bool = True) -> nn.Module:
    """
    Constructs a ResNet18 model modified for defect classification.
    
    Args:
        num_classes (int): Number of target classification classes (default is 4).
        freeze_backbone (bool): If True, freezes the weights of the ResNet backbone.
        
    Returns:
        nn.Module: The modified ResNet18 model.
    """
    # Load ResNet18 with default pre-trained weights
    model = models.resnet18(weights=ResNet18_Weights.DEFAULT)
    
    # Freeze layers if specified
    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False
            
    # Replace the classification fully connected layer
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, num_classes)
    
    # Ensure fully connected layer params are trainable
    for param in model.fc.parameters():
        param.requires_grad = True
        
    return model


def freeze_backbone(model: nn.Module) -> None:
    """
    Freezes all feature extractor weights, leaving only the fc classifier active.
    """
    for name, param in model.named_parameters():
        if "fc" not in name:
            param.requires_grad = False


def unfreeze_backbone(model: nn.Module) -> None:
    """
    Unfreezes the entire model to allow fine-tuning.
    """
    for param in model.parameters():
        param.requires_grad = True
