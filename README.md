# VisionInspectAI

VisionInspectAI is an AI-powered industrial visual inspection system that automates defect detection and product quality assessment using Computer Vision and Deep Learning.

---

# Project Structure

```
VisionInspectAI/
│
├── backend/
│   ├── app/                     # FastAPI backend
│   ├── inspection_plots/        # Generated reports & visualizations
│   └── visualization/
│       ├── main.py
│       └── src/
│           ├── config.py
│           ├── dataset_loader.py
│           ├── preprocessing.py
│           ├── image_quality.py
│           ├── feature_extraction.py
│           ├── visualization.py
│           ├── pipeline.py
│           └── ...
│
├── dataset/                     # MVTec AD Dataset
│
├── frontend/                    # React Frontend
│
└── docs/
```

---

# Inspection Pipeline

```
MVTec AD Dataset
        │
        ▼
Dataset Loader
        │
        ▼
Image Quality Analysis
        │
        ▼
Image Preprocessing
        │
        ▼
Feature Extraction
        │
        ▼
Model Inference
(Classification + Defect Detection)
        │
        ▼
Inspection Report
        │
        ▼
FastAPI Backend
        │
        ▼
React Frontend
```

---

# Current Modules

## Dataset Loader

Loads images directly from the MVTec AD dataset.

Features:

- Automatic category discovery
- Train/Test image loading
- Defect type loading
- Ground truth mask loading

---

## Image Preprocessing

Prepares images before model inference.

Current preprocessing steps:

- Image Loading
- RGB Conversion
- Image Resizing
- CLAHE Contrast Enhancement
- Optional Noise Removal
- Image Normalization

---

## Image Quality Analysis

Evaluates image quality before inference.

Metrics:

- Brightness
- Contrast
- Blur Score (Variance of Laplacian)
- Noise Estimation

---

## Feature Extraction

Extracts handcrafted Computer Vision features.

Features:

- RGB Color Histogram
- Local Binary Pattern (LBP)
- Edge Density
- Contour Statistics

---

## Visualization

Automatically generates:

- Original Image
- Preprocessed Image
- Comparison View
- RGB Histogram
- Grayscale Histogram
- Edge Detection

---

## Pipeline

The pipeline integrates all preprocessing modules into a single workflow.

```
Load Image
      │
      ▼
Preprocess
      │
      ▼
Quality Analysis
      │
      ▼
Feature Extraction
      │
      ▼
Visualization
      │
      ▼
Generate Reports
```

---

# Generated Outputs

Running the inspection pipeline generates:

- Quality Report (JSON)
- Feature Summary (CSV)
- Comparison Images
- Histograms
- Edge Detection Results

These outputs are generated automatically and are excluded from version control.

---

# Future Work

- Deep Learning Model Integration
- Product Classification
- Defect Detection
- Defect Localization
- Inspection Report Generation
- FastAPI Integration
- React Dashboard
- Database Integration

---