import sys
from pathlib import Path
from PIL import Image
import numpy as np
import torch

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from anomaly_detection import predict_defect, load_autoencoder_model, load_classifier_model
from anomaly_detection import config
from anomaly_detection.api import get_analytics_trends, get_risk_assessment, get_production_report

def run_milestone3_verification():
    print("=" * 60)
    print("        MILESTONE 3 VERIFICATION: DEFECT CLASSIFICATION & ANALYTICS ")
    print("=" * 60)
    
    # 1. Test Standalone Python API (predict_defect)
    print("\n[STEP 1] Testing Standalone Python API (predict_defect)...")
    dataset_dir = Path(config.DATASET_DIR) / "bottle" / "test" / "broken_large"
    if not dataset_dir.exists():
        print(f"Dataset path not found: {dataset_dir}")
        return
        
    test_img_path = list(dataset_dir.glob("*.png"))[0]
    print(f"Loaded sample defective image: {test_img_path}")
    
    result = predict_defect(str(test_img_path), category="bottle", enable_yolo=True)
    
    print("\nInference Results:")
    print(f"  - Is Anomaly: {result['is_anomaly']}")
    print(f"  - Defect Result: {result['defect_result']}")
    print(f"  - Defect Class: {result['defect_class']}")
    print(f"  - Confidence Score: {result['confidence_score']}%")
    print(f"  - Anomaly Score: {result['anomaly_score']} (Threshold: {result['threshold']})")
    print(f"  - Severity Score: {result['severity_score']} ({result['severity_level']})")
    print(f"  - Recommended Action: {result['recommended_action']}")
    print(f"  - Heatmap Image Base64 length: {len(result['heatmap_image'])} chars")
    
    assert "is_anomaly" in result
    assert "defect_class" in result
    assert "confidence_score" in result
    assert "heatmap_image" in result
    print("✔ Standalone Python API check PASSED!")
    
    # 2. Test SSIM + MSE Hybrid Reconstruction
    print("\n[STEP 2] Verifying SSIM + MSE Hybrid Reconstruction...")
    autoencoder = load_autoencoder_model("bottle")
    dummy_input = torch.zeros((1, 3, 128, 128))
    recon, anomaly_map, score = autoencoder.compute_anomaly_map(dummy_input, use_ssim=True)
    print(f"  - Recon Tensor Shape: {recon.shape}")
    print(f"  - Anomaly Map Shape: {anomaly_map.shape}")
    print(f"  - Scalar Anomaly Score: {score.item():.6f}")
    assert recon.shape == (1, 3, 128, 128)
    print("✔ SSIM + MSE Hybrid Anomaly Map check PASSED!")
    
    # 3. Test Multi-Class Classifier Loading
    print("\n[STEP 3] Verifying DefectClassifier Model Loading...")
    classifier, class_list = load_classifier_model("bottle")
    print(f"  - Loaded Classifier for 'bottle': {classifier is not None}")
    print(f"  - Target Classes: {class_list}")
    assert class_list == ["good", "broken_large", "broken_small", "contamination"]
    print("✔ DefectClassifier model loading check PASSED!")
    
    # 4. Test Milestone 3 REST API Endpoint Handlers
    print("\n[STEP 4] Verifying Milestone 3 Manufacturing Analytics API Functions...")
    trends_res = get_analytics_trends()
    print(f"  - get_analytics_trends() (Time-series entries: {len(trends_res['time_series'])})")
    
    risk_res = get_risk_assessment()
    print(f"  - get_risk_assessment() (Risk categories: {len(risk_res['category_risk_levels'])})")
    
    prod_res = get_production_report()
    print(f"  - get_production_report() (Title: {prod_res['report_title']})")
    
    assert "time_series" in trends_res
    assert "category_risk_levels" in risk_res
    assert "report_title" in prod_res
    print("✔ Milestone 3 Analytics REST Endpoints check PASSED!")
    
    print("\n" + "=" * 60)
    print("   MILESTONE 3 ALL CHECKS PASSED SUCCESSFULLY! ")
    print("=" * 60)

if __name__ == "__main__":
    run_milestone3_verification()
