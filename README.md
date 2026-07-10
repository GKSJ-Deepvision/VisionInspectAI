# VisionInspect AI

VisionInspect AI is an AI-powered industrial quality inspection project that detects defects in manufacturing products using Computer Vision and Deep Learning.

The project uses the **MVTec Anomaly Detection (MVTec AD)** dataset to perform Exploratory Data Analysis (EDA), image preprocessing, and anomaly detection using the **PatchCore** model.

---

## Project Goals

- Perform Exploratory Data Analysis (EDA)
- Build an image preprocessing pipeline
- Implement PatchCore for anomaly detection
- Generate anomaly heatmaps
- Integrate the AI module into the complete application

---

## Current Progress

### ✅ Completed

- Environment Setup
- Datase
- Exploratory Data Analysis (EDA)
- Image Preprocessing

### 🚧 In Progress

- PatchCore Model Configuration

### ⏳ Upcoming

- Feature Extraction
- Model Training
- Model Evaluation
- Prediction Pipeline

---

## Tech Stack

- Python
- OpenCV
- NumPy
- Pandas
- Matplotlib
- Jupyter Notebook
- Visual Studio Code
- Git & GitHub

**Upcoming**

- PyTorch
- PatchCore
- Anomalib

---

## Project Structure

```text
VisionInspectAI/
│
├── dataset/
│   └── mvtec_anomaly_detection/
│
├── output_charts/
│
├── src/
│   └── notebooks/
│       └── MVTec_AD_EDA.ipynb
│
├── README.md
├── requirements.txt
├── .gitignore
└── LICENSE
```

---

## Dataset

This project uses the **MVTec AD** dataset, which contains:

- 15 industrial categories
- Normal and defective images
- Pixel-level ground truth masks
- High-resolution RGB images

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd VisionInspectAI
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment:

**Windows**

```bash
.venv\Scripts\activate
```

**Linux / macOS**

```bash
source .venv/bin/activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

---

## Roadmap

- [x] Environment Setup
- [x] Dataset Exploration (EDA)
- [x] Image Preprocessing
- [ ] PatchCore Configuration
- [ ] Feature Extraction
- [ ] Model Training
- [ ] Model Evaluation
- [ ] Prediction

---

## Future Work

- Complete PatchCore implementation
- Train and evaluate the model
- Generate anomaly heatmaps
- Integrate backend and frontend