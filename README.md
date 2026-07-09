# VisionInspect AI – AI Module

## Overview



The objective of this module is to build an anomaly detection pipeline capable of identifying manufacturing defects using the **PatchCore** model and the **MVTec AD** dataset.

## Work Completed

### 1. Environment Setup
- Configured Python virtual environment.
- Installed required AI and computer vision libraries.
- Organized project directory structure.

### 2. Dataset Exploration
- Explored the MVTec AD dataset.
- Generated dataset statistics including:
  - Number of categories
  - Training images
  - Testing images
  - Good and defective samples
  - Defect types
  - Image resolution
  - Color channels
  - Corrupted image detection

### 3. Data Preprocessing
- Dataset validation.
- Image resizing to **256 × 256**.
- Preserved original folder hierarchy.
- Separate preprocessing for images and ground-truth masks.
- Removed corrupted images during preprocessing.

### 4. PatchCore Model Configuration
- Implemented PatchCore anomaly detection model using **Anomalib**.
- Configured:
  - Wide ResNet50-2 backbone
  - Layer2 & Layer3 feature extraction
  - Coreset sampling
  - Nearest neighbor search
  - ImageNet normalization (built-in)

### 5. Model Training
- Implemented training pipeline.
- Created MVTec AD DataModule.
- Trained the model on the **Bottle** category for initial validation.
- Generated model checkpoint for inference.

### 6. Model Prediction
- Implemented prediction pipeline using the trained checkpoint.
- Supports prediction on user-provided image paths.
- Generates:
  - Anomaly Score
  - Normal / Defective Prediction
  - Anomaly Heatmap
  - Predicted Defect Mask

## Project Structure

```
AI/
│
├── src/
│   ├── data/
│   │   ├── config.py
│   │   ├── datamodule.py
│   │   ├── explore_dataset.py
│   │   └── preprocessing.py
│   │
│   └── models/
│       ├── patchcore.py
│       ├── train.py
│       ├── predict.py
│       └── evaluate.py
│
└── requirements.txt
```

---

## Technologies Used

- Python
- PyTorch
- Anomalib
- PatchCore
- OpenCV
- NumPy
- Pandas
- SciPy
- Scikit-learn

---

## Current Status

✔ Environment Setup

✔ Dataset Exploration

✔ Data Preprocessing

✔ PatchCore Model Configuration

✔ Model Training (Bottle Category)

✔ Model Prediction



## Future Work

- Train on all assigned MVTec AD categories.
- Model evaluation on complete dataset.
- Defect severity estimation.
- Defect classification.
- Confidence score generation.
- Backend integration.
- Web-based inspection dashboard.

---
