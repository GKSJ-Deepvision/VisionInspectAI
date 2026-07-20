import os
import torch
import torch.nn as nn
import torch.nn.functional as F

# Mapping of all 15 MVTec AD categories to their sub-defect classes
CATEGORY_DEFECT_CLASSES = {
    "bottle": ["good", "broken_large", "broken_small", "contamination"],
    "cable": ["good", "bent_wire", "cable_swap", "combined", "cut_inner_insulation", "cut_outer_insulation", "missing_cable", "missing_wire", "poke_insulation", "star_twisted"],
    "capsule": ["good", "bite", "crack", "faulty_imprint", "poke", "scratch", "squeeze"],
    "carpet": ["good", "color", "cut", "hole", "metal_contamination", "thread"],
    "grid": ["good", "bent", "broken", "glue", "metal_contamination", "thread"],
    "hazelnut": ["good", "crack", "cut", "hole", "print"],
    "leather": ["good", "color", "cut", "fold", "glue"],
    "metal_nut": ["good", "bent", "color", "flip", "scratch"],
    "pill": ["good", "color", "combined", "contamination", "crack", "faulty_imprint", "scratch"],
    "screw": ["good", "manipulated_front", "scratch_head", "scratch_neck", "thread_side", "thread_top"],
    "tile": ["good", "crack", "glue_strip", "gray_stroke", "oil", "rough"],
    "toothbrush": ["good", "defective"],
    "transistor": ["good", "bent_lead", "cut_lead", "damaged_case", "misplaced"],
    "wood": ["good", "color", "hole", "liquid", "scratch"],
    "zipper": ["good", "broken_teeth", "fabric_border", "fabric_interior", "rough", "split_teeth", "squeezed_teeth"]
}

class ConvBlock(nn.Module):
    """Residual Convolutional Block for Feature Extraction."""
    def __init__(self, in_channels, out_channels, stride=1):
        super(ConvBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        residual = self.shortcut(x)
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return self.relu(out)

class DefectClassifier(nn.Module):
    """
    Deep ConvNet Classifier for Multi-Class Manufacturing Defect Categorization.
    Outputs logits and softmax class confidence scores.
    """
    def __init__(self, num_classes=4):
        super(DefectClassifier, self).__init__()
        self.num_classes = num_classes
        
        self.prep = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=7, stride=2, padding=3, bias=False), # 64x64
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2, padding=1) # 32x32
        )
        
        self.layer1 = ConvBlock(32, 64, stride=1)
        self.layer2 = ConvBlock(64, 128, stride=2) # 16x16
        self.layer3 = ConvBlock(128, 256, stride=2) # 8x8
        
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.prep(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        logits = self.fc(x)
        return logits

    def predict_class(self, x, class_list=None):
        """
        Runs forward pass and returns predicted class name, confidence %, and class probabilities dict.
        """
        self.eval()
        with torch.no_grad():
            logits = self(x)
            probs = F.softmax(logits, dim=1).squeeze(0)
            conf, pred_idx = torch.max(probs, dim=0)
            
            idx = pred_idx.item()
            confidence_pct = round(conf.item() * 100.0, 2)
            
            if class_list and idx < len(class_list):
                predicted_class = class_list[idx]
            else:
                predicted_class = f"class_{idx}"
                
            probs_dict = {}
            if class_list:
                for i, cls_name in enumerate(class_list):
                    if i < len(probs):
                        probs_dict[cls_name] = round(probs[i].item() * 100.0, 2)
                        
            return predicted_class, confidence_pct, probs_dict
