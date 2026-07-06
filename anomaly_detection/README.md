# Anomaly Detection Module (Unsupervised Autoencoder)

This folder contains the **AI/ML Model Training and Inference Pipeline** for the VisionInspect AI Quality Inspection System. 
This module focuses on unsupervised anomaly detection using Convolutional Autoencoders trained exclusively on normal product images.

---

## 🛠️ Folder Structure

```
anomaly_detection/
├── __init__.py        # Module entrypoint
├── config.py          # Hyperparameters, paths, and device settings
├── dataset.py         # MVTec AD PyTorch Dataset and Dataloaders
├── model.py           # Convolutional Autoencoder network architecture
├── train.py           # Model training loop and threshold calibration
├── api.py             # FastAPI service wrapping the inference pipeline
├── test_pipeline.py   # Integration verification script
└── README.md          # This documentation file
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure your local environment has the required dependencies. You can install them using the `requirements.txt` file in the repository root:
```bash
pip install -r requirements.txt
```

### 2. Dataset Setup
The module uses the standard **MVTec Anomaly Detection Dataset**.
The default directory configured is:
`E:/Infosys Internship - 2 months/mvtec_anomaly_detection`

You can change the dataset directory or the target product category in `config.py` or override them with environment variables:
```bash
# Windows PowerShell
$env:MVTEC_DATASET_DIR="E:/Path/To/mvtec_anomaly_detection"
$env:MVTEC_CATEGORY="bottle"
```

---

## ⚙️ How it Works

1. **Training (Unsupervised)**: The autoencoder is trained using *only* normal (defect-free) images of a product category (e.g. from the `train/good` folder). It learns to compress and reconstruct normal textures and shapes.
2. **Inference**: When presented with an image during testing or production:
   - The model reconstructs the image.
   - It computes a pixel-wise reconstruction error map: $E(x) = (x - \hat{x})^2$.
   - The mean value of this error map is the **Anomaly Score**.
   - If the score exceeds the calibrated **Anomaly Threshold**, the product is classified as **Anomalous**.
   - A visual **Heatmap Overlay** is produced indicating where the reconstruction error (defect) is located.

---

## 🏃 Run the Verification Pipeline

To verify that the dataset loads, the model architecture is valid, training runs for 1 epoch, and the FastAPI client successfully yields predictions, run:

```bash
python -m anomaly_detection.test_pipeline
```

---

## 🔌 API Documentation

To launch the inference server locally:

```bash
uvicorn anomaly_detection.api:app --reload --port 8000
```

### Endpoints

#### 1. Server Status
* **URL**: `/status`
* **Method**: `GET`
* **Response**:
  ```json
  {
    "status": "online",
    "category": "bottle",
    "device": "cpu",
    "model_loaded": true,
    "anomaly_threshold": 0.05
  }
  ```

#### 2. Image Anomaly Detection
* **URL**: `/predict`
* **Method**: `POST`
* **Form-Data**: `file` (Image Upload)
* **Response**:
  ```json
  {
    "is_anomaly": true,
    "anomaly_score": 0.062145,
    "threshold": 0.05,
    "category": "bottle",
    "original_image": "data:image/jpeg;base64,...",
    "reconstructed_image": "data:image/jpeg;base64,...",
    "heatmap_image": "data:image/jpeg;base64,...",
    "overlay_image": "data:image/jpeg;base64,..."
  }
  ```
  *(Note: Visual outputs are returned as base64-encoded Data URIs ready to be directly source-bound in HTML `<img>` elements or React frontends)*
