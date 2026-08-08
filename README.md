# VisionInspect AI - AI/ML Module

This branch contains the AI/ML work assigned to Member 4 for VisionInspect AI. It covers image preprocessing, multi-category anomaly detection, defect localization, defect subtype classification, severity scoring, model evaluation, portable inference artifacts, and backend-ready prediction output.

Branch: `Himanshu-parhi-ai/ml`

## Supported Categories

The model registry supports all 15 MVTec AD categories:

`bottle`, `cable`, `capsule`, `carpet`, `grid`, `hazelnut`, `leather`, `metal_nut`, `pill`, `screw`, `tile`, `toothbrush`, `transistor`, `wood`, and `zipper`.

Each category has its own calibrated detector threshold, normal reference profile, defect subtype classifier, metadata, and runtime configuration.

## AI/ML Workflow

```text
Product image and category
    -> validation and object-aware preprocessing
    -> category-specific anomaly detector
    -> good or defective decision
    -> anomaly map, defect mask, and heatmap
    -> defect subtype classifier for defective images
    -> confidence and defect geometry
    -> weighted severity score
    -> pass, review, or fail decision
    -> backend-ready prediction dictionary
```

## Model Architecture

### Advanced anomaly detection

- PaDiM is the trained anomaly detector for most categories.
- PatchCore is selected for `cable`, `hazelnut`, and `screw`, where benchmark comparison showed stronger performance.
- Training checkpoints are intentionally excluded because they are large training artifacts and are not required by the portable runtime.

### Portable anomaly detection

- A shared ResNet18 ONNX feature extractor generates image embeddings.
- Each category stores a normal embedding memory and calibrated threshold in `normal_profile.npz` and `model_metadata.json`.
- OpenCV residual analysis localizes suspicious regions and produces defect masks and heatmaps.
- Cable additionally includes an exported OpenVINO PatchCore model and calibrated compact runtime.

### Defect subtype classification

- Category-specific classifiers predict the defect subtype only after anomaly detection marks an image as defective.
- Classifiers use ResNet18 embeddings or category-specific visual and texture features.
- Capsule and wood include fine-tuned CNN classifiers exported to ONNX.
- Portable classifier artifacts are stored as `.pkl`, `.npz`, or `.onnx` files.

## Repository Structure

```text
ml/                  Core preprocessing, detection, classification, and scoring code
models/              Portable category model registry and inference artifacts
notebooks/           Ten connected AI/ML notebooks with inline results
scripts/             Training, benchmarking, calibration, promotion, and export tools
tests/               Standalone AI/ML unit and artifact validation tests
documentation/       AI/ML module report files
requirements-ai.txt  Reproducible Python dependencies
pyproject.toml       Test and lint configuration
```

The inherited team `frontend/` directory is not owned or modified by this AI/ML branch.

## Dataset Setup

The dataset is not committed to GitHub. Download MVTec AD and place it at:

```text
data/raw/mvtec_anomaly_detection/
    bottle/
    cable/
    capsule/
    ...
    zipper/
```

Every category should contain `train/good`, `test/<defect_type>`, and `ground_truth/<defect_type>` where masks are available.

## Installation

Use Python 3.11 or 3.12. Clone the repository and switch to this branch:

```bash
git clone https://github.com/GKSJ-Deepvision/VisionInspectAI.git
cd VisionInspectAI
git switch Himanshu-parhi-ai/ml
git lfs install
git lfs pull
python -m pip install -r requirements-ai.txt
```

Git LFS is required because the portable ONNX, OpenVINO, NumPy, and scikit-learn model artifacts are versioned with this branch.

## Notebook Sequence

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

The notebooks display their important images, tables, metrics, prediction dictionaries, and validation evidence inline. They do not require generated report folders for presentation evidence.

## Training and Evaluation Tools

```bash
# Train category anomaly models and portable reference profiles
python scripts/train_category_models.py --category bottle

# Train category defect subtype classifiers
python scripts/train_category_classifiers.py --category bottle

# Compare PaDiM and PatchCore candidates
python scripts/benchmark_category_models.py --category cable

# Calibrate category thresholds and portable runtime artifacts
python scripts/calibrate_category_thresholds.py --category cable

# Export supported anomaly models to OpenVINO
python scripts/export_openvino.py --category cable

# Train and export fine-tuned CNN subtype classifiers
python scripts/train_finetuned_cnn_classifiers.py --category capsule
```

Run a script with `--help` before training to inspect its complete arguments.

## Prediction Output

`ml/predict.py` produces a structured result suitable for FastAPI integration. The output includes:

- category and model used
- good or defective prediction
- defect subtype and confidence
- anomaly score and active threshold
- defect area ratio and localization data
- heatmap and explainability information
- severity score and level
- pass, review, or fail decision

## Severity Scoring

```text
Severity score =
    defect size       x 30%
  + defect location   x 25%
  + defect type       x 25%
  + confidence        x 20%
```

| Score | Level | QA guidance |
| ---: | --- | --- |
| 80-100 | Critical | Reject and trigger immediate action |
| 60-79 | High | Fail or send for rework |
| 40-59 | Medium | Manual quality review |
| 0-39 | Low | Generally acceptable |

## Recorded Evaluation Highlights

| Model or pipeline | Main result |
| --- | ---: |
| Bottle PaDiM image AUROC | 0.9968 |
| Bottle PaDiM image F1 | 0.9764 |
| Bottle portable detector AUROC | 0.9913 |
| Bottle subtype classifier macro F1 | 0.8719 |
| Cable PatchCore image AUROC | 0.9695 |
| Cable PatchCore image F1 | 0.9274 |
| Cable OpenVINO calibrated detector F1 | 0.9670 |
| Cable defect subtype classifier macro F1 | 0.8529 |

Metrics are read from the committed category metadata. They should be interpreted with their documented validation protocol; subtype results use the labelled MVTec defect folders and are separate from the official anomaly-detection benchmark.

## Testing

Run the complete standalone AI/ML suite:

```bash
pytest -q
```

Run static checks:

```bash
ruff check ml scripts tests
```

Dataset-dependent tests skip automatically when the local MVTec dataset is unavailable. Portable artifact tests verify that all 15 categories can be loaded without the excluded training checkpoints.

## Version-Control Policy

Committed:

- AI/ML source code and notebooks
- model metadata and calibrated portable artifacts
- shared ONNX feature extractor
- selected OpenVINO and ONNX runtimes
- AI/ML scripts and tests

Excluded:

- MVTec datasets
- environment files and credentials
- caches and generated reports
- Anomalib training runs
- large `.ckpt` and `.pth` training artifacts
- frontend, backend, database, and deployment changes owned by other team members
