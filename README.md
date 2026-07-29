# VisionInspect AI - Backend & Model Overview

## Modified Files in This Update

If you already have the codebase set up and only need the latest backend changes, you can pull or checkout these specific files:

* **`backend/app/ml_engine/anomaly_detector.py`**  
  Updated threshold calculations and KNN prediction logic for anomaly detection.

* **`backend/app/ml_engine/feature_extractor.py`**  
  Updated multi-scale ResNet feature extractor setup.

* **`backend/train_model.py`**  
  Updated model training and evaluation script.

* **`backend/models/trained/`** *(Directory)*  
  Contains the updated `.npy` feature bank weights and `metadata.json`.

---

## Commands to Pull/Checkout Only Modified Files

If you want to update **only** these specific files in your local workspace without pulling everything else:

```bash
git fetch origin
git checkout origin/leela-sowmya -- backend/app/ml_engine/anomaly_detector.py backend/app/ml_engine/feature_extractor.py backend/train_model.py backend/models/trained/