&#x20;**PROJECT WORK FLOW**



Product Image

&#x20;     ↓

Image Acquisition / Upload

&#x20;     ↓

Dataset Loading

&#x20;     ↓

Preprocessing

&#x20;     ↓

Defect Detection Model

&#x20;     ↓

Prediction

&#x20;     ↓

Anomaly Score

&#x20;     ↓

Severity Score

&#x20;     ↓

Inspection Statistics

&#x20;     ↓

Inspection Report

&#x20;     ↓

Final Result

Good / Defect





**MILESTONE1 WORK FLOW**



VisionInspectAI

│

├── backend

│   ├── app.py                                 

│   ├── routes

│   ├── services                                  

│   ├── models

│   └── ...

│

├── anomaly\_detection

├── docs

└── requirements.txt



Image

&#x20;↓

Load

&#x20;↓

Preprocess





**MILESTONE2 WORK FLOW**



anomaly\_detection

&#x20;   model.py

&#x20;   inference.py

&#x20;   classifier.py

&#x20;   preprocessor.py





Image

&#x20;↓

Upload

&#x20;↓

Preprocess

&#x20;↓

Model

&#x20;↓

Prediction

&#x20;↓

Good / Defective





**MILESTONE3 WORK FLOW**



&#x20;                IMAGE

&#x20;                  ↓

&#x20;             PREPROCESS

&#x20;                  ↓

&#x20;               MODEL

&#x20;                  ↓

&#x20;             PREDICTION

&#x20;                  ↓

&#x20;            ANOMALY SCORE

&#x20;                  ↓

&#x20;         ┌────────┴────────┐

&#x20;         ↓                 ↓

&#x20;     SEVERITY          STATISTICS

&#x20;         ↓                 ↓

&#x20;    Low/Medium/High   Pass/Failure

&#x20;         └────────┬────────┘

&#x20;                  ↓

&#x20;               REPORT











