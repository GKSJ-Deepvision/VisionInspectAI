# VisionInspect AI - AI/ML Module

This branch contains the complete AI/ML module for VisionInspect AI, a manufacturing defect detection and quality inspection system. The module processes bottle images, detects anomalies, localizes suspicious regions, classifies defect types, calculates severity, and produces results that can be consumed by the backend API.

## Module Responsibilities

- Digital image fundamentals and image handling
- MVTec AD bottle dataset loading and validation
- Image preprocessing and enhancement
- OpenCV baseline anomaly detection
- PaDiM anomaly detection and localization
- Defect-type classification
- Heatmap and defect-mask generation
- Severity scoring and pass/review/fail decisions
- Model evaluation and k-fold validation
- Backend-ready inference output

## Structure

```text
ml/                         AI/ML source code
models/                     Trained model artifacts and reference images
notebooks/                  End-to-end learning, training and evaluation workflow
tests/                      AI/ML validation tests
requirements-ai.txt         Python dependencies for this module
.gitattributes              Git LFS rules for large model files
```

## AI/ML Workflow

```text
Input image
    -> image validation and preprocessing
    -> anomaly detection using PaDiM or the OpenCV baseline
    -> anomaly map and heatmap generation
    -> good/defective decision
    -> defect-type classification
    -> severity score calculation
    -> pass, review or fail decision
    -> backend-ready prediction result
```

## Dataset

The module uses the MVTec AD `bottle` category.

```text
data/raw/mvtec_anomaly_detection/bottle/
├── train/good/
├── test/good/
├── test/broken_large/
├── test/broken_small/
├── test/contamination/
└── ground_truth/
    ├── broken_large/
    ├── broken_small/
    └── contamination/
```

The dataset is not included in the repository. Place it at the path above before running dataset-dependent notebooks or tests.

## Installation

Create or activate a Python environment, then install the AI dependencies:

```bash
pip install -r requirements-ai.txt
```

Large model artifacts are tracked with Git LFS:

```bash
git lfs install
git lfs pull
```

## Notebook Order

Run the notebooks in this sequence:

1. `01_digital_image_basics.ipynb`
2. `02_opencv_numpy_matplotlib.ipynb`
3. `03_image_preprocessing.ipynb`
4. `04_mvtec_dataset_understanding.ipynb`
5. `05_dataset_loader.ipynb`
6. `06_baseline_defect_detection.ipynb`
7. `07_anomalib_model_training.ipynb`
8. `08_defect_classification.ipynb`
9. `09_severity_scoring.ipynb`
10. `10_model_evaluation_results.ipynb`

The notebooks use real MVTec bottle images and display preprocessing, training, prediction and evaluation evidence inline.

## Models

### PaDiM

PaDiM learns the distribution of normal bottle features and identifies deviations as anomalies. It provides image-level defect detection and pixel-level localization.

Saved evaluation metrics:

| Metric | Score |
| --- | ---: |
| Image AUROC | 0.9984 |
| Image F1 | 0.9839 |
| Pixel AUROC | 0.9821 |
| Pixel F1 | 0.7136 |

### Defect Classifier

The defect classifier uses frozen ResNet18 ImageNet features with a scikit-learn classifier.

Supported classes:

- `good`
- `broken_large`
- `broken_small`
- `contamination`

Saved classifier accuracy: `0.9318`.

### OpenCV Baseline

The baseline compares a preprocessed image against a normal reference image. It provides lightweight anomaly scoring and heatmap generation when PaDiM is unavailable.

## Severity Scoring

```text
Severity Score =
    Defect Size x 30%
  + Defect Location x 25%
  + Defect Type x 25%
  + Detection Confidence x 20%
```

| Score | Level | Decision guidance |
| ---: | --- | --- |
| 80-100 | Critical | Reject or immediate action |
| 60-79 | High | Fail or rework |
| 40-59 | Medium | Manual review |
| 0-39 | Low | Generally acceptable |

## Testing

Run the standalone AI/ML tests on this branch with:

```bash
pytest tests/ --ignore=tests/test_prediction.py
```

Dataset-dependent tests are skipped when the local MVTec dataset is unavailable. After the backend module is integrated, run the complete suite with `pytest tests/`, including `test_prediction.py`.

## Model Artifacts

```text
models/
├── checkpoints/padim_mvtec_bottle_v1.ckpt
├── defect_classifier.pkl
├── model_metadata.json
└── inference/
    ├── normal_reference.png
    └── resnet18-f37072fd.pth
```

## Current Scope

- Product category: MVTec AD bottle
- Anomaly detector: PaDiM
- Fallback detector: OpenCV reference comparison
- Feature extractor: ResNet18
- Defect classifier: scikit-learn pipeline
- Output: prediction, defect type, confidence, anomaly score, heatmap, severity and quality decision

Additional product categories require their own training data, evaluation and calibrated decision thresholds.
