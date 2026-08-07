import sys
from pathlib import Path

# Add backend directory to python path if needed to support local imports
sys.path.append(str(Path(__file__).parent.parent))

from ai.predictor import predict_defect

def main():
    """
    Command line utility to test the predictor pipeline offline.
    Usage: python backend/ai/test_predictor.py <image_path> <category>
    """
    if len(sys.argv) < 3:
        print("\n[ERROR] Missing arguments.")
        print("Usage: python backend/ai/test_predictor.py <image_path> <category_name>")
        print("Example: python backend/ai/test_predictor.py datasets/mvtec/bottle/test/broken_large/000.png bottle\n")
        sys.exit(1)
        
    image_path = sys.argv[1]
    category = sys.argv[2]
    
    img_path = Path(image_path)
    if not img_path.exists():
        print(f"\n[ERROR] Target image path does not exist: {img_path.resolve()}\n")
        sys.exit(1)
        
    print("\n=======================================================")
    print("      VisionInspect AI - Predictor Test Terminal       ")
    print("=======================================================")
    print(f"Target Image: {img_path.resolve()}")
    print(f"Category    : {category}")
    print("Running hybrid anomaly detection + classification...\n")
    
    try:
        results = predict_defect(str(img_path), category)
        
        print("=== Inspection Telemetry ===")
        print(f"• Prediction Decision : {results['prediction']}")
        print(f"• Confidence Score    : {results['confidence']:.4f}")
        print(f"• Defect Class Type   : {results['defect_type']}")
        print(f"• Defect Size (Pixels): {results['size_percentage']}%")
        print(f"• Location Score      : {results['location_score']}")
        print(f"• Severity Score      : {results['severity_score']}/100")
        print(f"• Severity Rating     : {results['severity']}")
        print(f"• Heatmap Path        : {results['mask_filepath']}")
        print("============================\n")
        
        print("[SUCCESS] Inference completed cleanly.")
    except Exception as e:
        print(f"\n[CRITICAL ERROR] Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        print("")

if __name__ == "__main__":
    main()
