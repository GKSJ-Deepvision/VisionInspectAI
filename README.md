# VisionInspect AI – AI Module

## Objective
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
VisionInspect-AI/
│
├── ai/
│   │
│   ├── dataset/                           # Original MVTec AD Dataset
│   │   ├── bottle/
│   │   ├── cable/
│   │   ├── capsule/
│   │   ├── carpet/
│   │   ├── grid/
│   │   ├── hazelnut/
│   │   ├── leather/
│   │   ├── metal_nut/
│   │   ├── pill/
│   │   ├── screw/
│   │   ├── tile/
│   │   ├── toothbrush/
│   │   ├── transistor/
│   │   ├── wood/
│   │   └── zipper/
│   │
│   ├── processed_dataset/                 # Preprocessed Dataset
│   │
│   ├── outputs/
│   │   ├── models/                        # Trained PatchCore model
│   │   ├── predictions/                   # Prediction results
│   │   ├── reports/                       # Evaluation reports
│   │   └── visualizations/                # Heatmaps, plots
│   │
│   └── src/
│       │
│       ├── data/
│       │   ├── config.py
│       │   ├── utils.py
│       │   ├── explore_dataset.py
│       │   ├── visualize.py
│       │   └── preprocessing.py
│       │
│       ├── models/
│       │   ├── patchcore.py
│       │   ├── train.py
│       │   ├── evaluate.py
│       │   └── predict.py
│       │
│       └── metrics/
│           └── metrics.py
│
├── backend/
│   │
│   ├── app.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── upload.py
│   │   ├── inspection.py
│   │   ├── analytics.py
│   │   └── history.py
│   │
│   ├── services/
│   │   ├── image_processing.py
│   │   ├── inference.py
│   │   ├── quality_control.py
│   │   └── severity_scoring.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   ├── models.py
│   │   └── schema.sql
│   │
│   ├── uploads/
│   │   ├── original/
│   │   ├── processed/
│   │   └── temporary/
│   │
│   ├── utils/
│   │   └── helpers.py
│   │
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   ├── Upload/
│   │   │   ├── Dashboard/
│   │   │   ├── Charts/
│   │   │   └── Reports/
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inspection.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── History.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── docs/
│   ├── PREPROCESSING_SPEC.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   └── PROJECT_PROGRESS.md
│
├── .gitignore
├── README.md
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
