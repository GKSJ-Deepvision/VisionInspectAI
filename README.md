# VisionInspectAI

VisionInspectAI is an AI-powered industrial visual inspection system that automates defect detection 
and product quality assessment using Computer Vision and Deep Learning.

## Project Structure

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
├── dataset/                     # MVTec AD Dataset (Ignored in Git)
│
├── frontend/                    # React Frontend
│
└── docs/

## Inspection Pipeline

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

## Current Modules

### Dataset Loader
Loads images directly from the MVTec AD dataset.
* **Features:** Automatic category discovery, train/test image loading, defect type loading, ground truth mask loading, and image loading.

### Image Preprocessing
Prepares images before model inference.
* **Steps:** Image Loading, RGB Conversion, Image Resizing, CLAHE Contrast Enhancement, Optional Noise Removal, and Image Normalization.

### Image Quality Analysis
Evaluates image quality before inference.
* **Metrics:** Brightness, Contrast, Blur Score (Variance of Laplacian), and Noise Estimation.

### Feature Extraction
Extracts handcrafted Computer Vision features.
* **Features:** RGB Color Histogram, Local Binary Pattern (LBP), Edge Density, and Contour Statistics.

### Visualization & Pipeline
Automatically generates original images, preprocessed images, side-by-side comparison views, histograms, and edge detection results through a unified pipeline workflow.

## Generated Outputs
Running the inspection pipeline generates:
* Quality Reports (JSON)
* Feature Summaries (CSV)
* Comparison Images, Histograms, and Edge Detection Results
*(Note: These outputs are generated automatically and are excluded from version control).*

## Future Work / Milestone 2 Features
* Deep Learning Model Integration
* Product Classification & Defect Localization
* FastAPI Integration
* React Dashboard & Database Integration
