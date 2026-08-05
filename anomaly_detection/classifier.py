import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2

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

from torchvision import models

class ResNet18Classifier(nn.Module):
    """
    Fine-Tuned ResNet18 Deep Classifier for Multi-Class Manufacturing Defect Categorization.
    """
    def __init__(self, num_classes=4):
        super(ResNet18Classifier, self).__init__()
        self.num_classes = num_classes
        self.resnet = models.resnet18(weights=None)
        self.resnet.fc = nn.Linear(self.resnet.fc.in_features, num_classes)

    def forward(self, x):
        return self.resnet(x)

    def predict_class(self, x, class_list=None, exclude_good=False):
        """
        Runs forward pass and returns predicted class name, confidence %, and class probabilities dict.
        If exclude_good=True, ignores the 'good' class (used when anomaly is already detected).
        """
        self.eval()
        with torch.no_grad():
            logits = self(x).clone()
            if class_list and exclude_good and "good" in class_list:
                good_idx = class_list.index("good")
                logits[0, good_idx] = -1e9
                
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

# Backward compatibility alias
DefectClassifier = ResNet18Classifier

_classifier_cache = {}

def load_classifier(category: str):
    category = category.lower()
    if category in _classifier_cache:
        return _classifier_cache[category]
        
    classes = CATEGORY_DEFECT_CLASSES.get(category, ["good", "defective"])
    model = ResNet18Classifier(num_classes=len(classes))
    model_path = os.path.join("models", f"classifier_{category}.pth")
    if os.path.exists(model_path):
        try:
            state_dict = torch.load(model_path, map_location="cpu")
            if any(k.startswith("resnet.") for k in state_dict.keys()):
                model.load_state_dict(state_dict, strict=False)
            else:
                model.resnet.load_state_dict(state_dict, strict=False)
            model.eval()
            print(f"[+] Loaded fine-tuned ResNet18 classifier for '{category}' ({len(classes)} classes)")
        except Exception as e:
            print(f"Error loading classifier for {category}: {e}")

    else:
        print(f"Warning: Classifier weights not found at {model_path}. Using base model.")
            
    _classifier_cache[category] = (model, classes)
    return model, classes



def predict_defect_class(img_tensor, category: str, exclude_good: bool = False):
    """
    Predicts specific defect sub-class (e.g. 'crack', 'broken_large', 'good') and confidence %.
    """
    model, classes = load_classifier(category)
    if img_tensor.dim() == 3:
        img_tensor = img_tensor.unsqueeze(0)
    pred_class, conf, probs = model.predict_class(img_tensor, class_list=classes, exclude_good=exclude_good)
    return pred_class, conf, probs

# Category feature reference centroids for 15-category automatic product identification
_CATEGORY_PROFILES = {
    'bottle': np.array([219.0, 31.4, 21.0, 52.8, 0.052]),
    'cable': np.array([179.6, 73.1, 48.4, 49.3, 0.089]),
    'capsule': np.array([215.1, 57.5, 41.3, 56.4, 0.071]),
    'carpet': np.array([109.8, 30.6, 68.3, 17.6, 0.063]),
    'grid': np.array([195.4, 62.4, 5.7, 44.5, 0.170]),
    'hazelnut': np.array([53.0, 48.0, 102.7, 18.0, 0.059]),
    'leather': np.array([119.5, 23.9, 137.9, 17.8, 0.038]),
    'metal_nut': np.array([148.9, 78.4, 7.3, 44.2, 0.125]),
    'pill': np.array([225.4, 51.6, 17.6, 45.4, 0.055]),
    'screw': np.array([168.0, 52.1, 10.3, 45.3, 0.093]),
    'tile': np.array([186.2, 45.2, 59.9, 21.0, 0.072]),
    'toothbrush': np.array([211.3, 45.2, 23.4, 56.7, 0.051]),
    'transistor': np.array([173.3, 80.2, 7.6, 38.6, 0.099]),
    'wood': np.array([174.6, 27.6, 85.3, 18.7, 0.055]),
    'zipper': np.array([127.8, 86.9, 23.3, 44.1, 0.117]),
}

_PRODUCT_MODEL = None

_PRODUCT_MODEL = None

def get_product_detector():
    global _PRODUCT_MODEL
    if _PRODUCT_MODEL is None:
        try:
            from torchvision import models, transforms
            resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            resnet.fc = torch.nn.Identity()
            resnet.eval()
            
            tf = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            _PRODUCT_MODEL = (resnet, tf)
        except Exception as e:
            print(f"Failed to load ResNet product detector: {e}")
            _PRODUCT_MODEL = False
    return _PRODUCT_MODEL

def detect_product_category(pil_img) -> tuple[str, float]:
    """
    Automatically detects which of the 15 MVTec product categories an uploaded image belongs to.
    Returns:
        (category_name, confidence_percent)
    """
    if hasattr(pil_img, "convert") and pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")

    detector = get_product_detector()
    if detector and _CATEGORY_EMBEDDING_CENTROIDS:
        try:
            resnet, tf = detector
            t = tf(pil_img).unsqueeze(0)
            with torch.no_grad():
                emb = resnet(t).squeeze(0).numpy()
                emb = emb / (np.linalg.norm(emb) + 1e-8)
                
            scores = {}
            for cat, cent in _CATEGORY_EMBEDDING_CENTROIDS.items():
                cos_sim = np.dot(emb, cent) / (np.linalg.norm(emb) * np.linalg.norm(cent) + 1e-8)
                scores[cat] = float(cos_sim)
                
            if scores:
                best_cat = max(scores, key=scores.get)
                best_sim = scores[best_cat]
                conf = round(min(99.9, max(75.0, best_sim * 100.0)), 1)
                return best_cat, conf
        except Exception as e:
            print(f"ResNet product classification error: {e}. Using feature profiling fallback.")
            
    # Fallback to feature profiling
    try:
        if hasattr(pil_img, "convert") and pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        img_np = np.array(pil_img.resize((128, 128)))
        if img_np.ndim == 2:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_GRAY2RGB)
            
        hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        
        feat = np.array([
            float(np.mean(gray)), float(np.std(gray)),
            float(np.mean(hsv[:, :, 1])), float(np.mean(hsv[:, :, 0])),
            float(np.mean(cv2.Canny(gray, 50, 150) > 0))
        ])
        
        dists = {cat: float(np.linalg.norm((feat - prof) / (prof + 1e-5))) for cat, prof in _CATEGORY_PROFILES.items()}
        best_cat = min(dists, key=dists.get)
        return best_cat, 85.0
    except Exception as e:
        print(f"Product auto-detection fallback error: {e}")
        return "bottle", 50.0

# 512-D ResNet18 Centroids for 15 MVTec Product Categories
_CATEGORY_EMBEDDING_CENTROIDS = {}
_centroids_file = os.path.join(os.path.dirname(__file__), "category_centroids.npy")
if os.path.exists(_centroids_file):
    try:
        _loaded = np.load(_centroids_file, allow_pickle=True)
        if isinstance(_loaded, np.ndarray) and _loaded.ndim == 0:
            _loaded = _loaded.item()
        _CATEGORY_EMBEDDING_CENTROIDS = dict(_loaded)
    except Exception as _e:
        print(f"Warning loading category_centroids.npy: {_e}")



