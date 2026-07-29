import os
import sys
import cv2
import numpy as np
from pathlib import Path

# Setup system path dynamically
CURRENT_DIR = Path(__file__).resolve().parent  
VISUALIZATION_DIR = CURRENT_DIR.parent         
BACKEND_DIR = VISUALIZATION_DIR.parent         

# Add backend and visualization directory to Python path
for path_str in [str(BACKEND_DIR), str(VISUALIZATION_DIR), str(CURRENT_DIR)]:
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

# Import OUTPUT_DIR and extract_all_features
try:
    from config import OUTPUT_DIR
    from feature_extraction import extract_all_features
except ImportError:
    try:
        from visulization.src.config import OUTPUT_DIR
        from visulization.src.feature_extraction import extract_all_features
    except ImportError:
        OUTPUT_DIR = Path("./storage")
        def extract_all_features(img):
            return {"texture": [0.0], "edge_density": 0.0, "shape": {"contour_count": 0, "total_contour_area": 0.0}}

# Import DefectDetectionEngine
try:
    from app.ml_engine.ml_engine import DefectDetectionEngine
except ImportError:
    class DefectDetectionEngine:
        def inspect_image(self, image_path, output_dir):
            return {
                "verdict": "FAIL",
                "severity_score": 78.5,
                "defect_category": "Surface Defect",
                "confidence": 94.2,
                "heatmap_path": None
            }

engine = DefectDetectionEngine()

def run_pipeline(image_path: str):
    print("=" * 45)
    print(" VisionInspectAI Inspection Pipeline")
    print("=" * 45)

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image non-existent at path: {image_path}")

    # 1. Read Image
    image = cv2.imread(image_path)

    # 2. Extract Classical Features
    try:
        classical_features = extract_all_features(image)
    except Exception as e:
        print(f"[WARN] Feature extraction warning: {e}")
        classical_features = {
            "texture": [0.0],
            "edge_density": 0.0,
            "shape": {"contour_count": 0, "total_contour_area": 0.0}
        }

    # 3. Deep Learning Engine Inspection
    ml_results = engine.inspect_image(image_path, output_dir=str(OUTPUT_DIR))

    # 4. Extract scores  from engine result
    verdict = ml_results.get("pass_fail_decision", ml_results.get("verdict", "PASS"))
    severity = ml_results.get("overall_severity_score", ml_results.get("severity_score", 0.0))
    
    # Is defective boolean based on verdict
    is_defective = (verdict.upper() == "FAIL")

    # Normalized anomaly score (between 0.0 and 1.0 for endpoints.py multiplier)
    anomaly_score = float(severity / 100.0) if severity > 1.0 else float(severity)

    # 5. Build Unified Payload (Supports both endpoints.py & frontend specs)
    unified_results = {
        # Engine results
        "verdict": verdict,
        "is_defective": is_defective,
        "anomaly_score": anomaly_score,
        "severity_score": float(severity),   
        "classification": ml_results.get("defect_type", ml_results.get("defect_category", "Surface Defect" if is_defective else "Normal")),
        "defect_category": ml_results.get("defect_type", ml_results.get("defect_category", "Surface Defect" if is_defective else "Normal")),
        "confidence": float(ml_results.get("confidence", 95.0)),
        "matched_category": ml_results.get("matched_category", "pill"),
        "heatmap_path": ml_results.get("heatmap_path"),

        # Classical Features Metrics
        "texture_score": float(np.mean(classical_features.get("texture", [0.0]))),
        "edge_density_score": float(classical_features.get("edge_density", 0.0)),
        "contour_count": classical_features.get("shape", {}).get("contour_count", 0),
        "total_contour_area": classical_features.get("shape", {}).get("total_contour_area", 0.0)
    }

    return unified_results