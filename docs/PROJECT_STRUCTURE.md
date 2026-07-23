VisionInspect-AI/
│
├── ai/
│   │
│   ├── dataset/                      #ORIGINAL DATASET
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
│   ├── processed_dataset/                  # Preprocessed dataset
│   │
│   ├── outputs/
│   │   ├── models/                         # Trained model weights
│   │   ├── predictions/                    # Prediction results
│   │   ├── reports/                        # Evaluation reports
│   │   └── visualizations/                 # EDA plots, confusion matrix, heatmaps
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
│       │   ├── anomaly_model.py
│       │   ├── train.py
│       │   ├── evaluate.py
│       │   └── predict.py
│       │
│       └── metrics/
│           └── metrics.py
│
├── backend/
│   │
│   ├── app.py                              # Flask Entry Point
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
│   │   └── models.py
│   │
│   ├── uploads/
│   │
│   ├── utils/
│   │   └── helpers.py
│   │
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
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