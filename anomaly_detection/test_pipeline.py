import os
import sys
from pathlib import Path
from PIL import Image
import torch


# Adjust path to import from package
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.dataset import MVTecDataset, get_dataloaders
from anomaly_detection.model import PaDiM
from anomaly_detection.train import train_model
from anomaly_detection.api import app

def run_tests():
    print("="*65)
    print("        VISIONINSPECT AI - PaDiM ML PIPELINE VERIFICATION        ")
    print("="*65)

    # 1. Environment and Library Checks
    print("\n[STEP 1] Checking Python and CUDA Environment...")
    print(f"Python Version: {sys.version}")
    print(f"PyTorch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA Device: {torch.cuda.get_device_name(0)}")
    print(f"Target Device: {config.DEVICE}")
    print("Environment checks PASSED.")

    # 2. Dataset checks
    print(f"\n[STEP 2] Verifying MVTec Dataset at: {config.DATASET_DIR}")
    if not config.DATASET_DIR.exists():
        print(f"ERROR: Dataset directory not found at: {config.DATASET_DIR}")
        sys.exit(1)

    print(f"Dataset category: '{config.CATEGORY}'")
    category_dir = config.DATASET_DIR / config.CATEGORY
    if not category_dir.exists():
        print(f"ERROR: Category directory '{config.CATEGORY}' not found in {config.DATASET_DIR}")
        sys.exit(1)

    print("Dataset directory is VALID.")

    # 3. Test Dataset Loading
    print("\n[STEP 3] Testing PyTorch Dataset & Dataloaders...")
    try:
        train_dataset = MVTecDataset(split="train")
        test_dataset = MVTecDataset(split="test")

        print(f"Training dataset size: {len(train_dataset)}")
        print(f"Testing dataset size: {len(test_dataset)}")

        img, label, defect_type, img_path = train_dataset[0]
        print(f"Sample loaded successfully:")
        print(f"  - Image shape: {img.shape}")
        print(f"  - Label: {label} (0=Normal, 1=Anomalous)")
        print(f"  - Defect Type: {defect_type}")
        print("Dataset loader checks PASSED.")
    except Exception as e:
        print(f"ERROR testing dataset loading: {e}")
        sys.exit(1)

    # 4. Test PaDiM Model Feature Extraction & Forward Pass
    print("\n[STEP 4] Testing PaDiM Feature Extractor & Anomaly Map Generation...")
    try:
        model = PaDiM(
            backbone=config.PADIM_BACKBONE,
            layer_names=config.PADIM_LAYERS,
            d_dim=config.PADIM_DIM,
            sigma=config.PADIM_SIGMA,
            epsilon=config.PADIM_EPSILON,
            device=config.DEVICE
        )

        dummy_loader, _ = get_dataloaders(category=config.CATEGORY, batch_size=4)
        model.fit(dummy_loader)

        dummy_batch = torch.randn(2, 3, config.IMAGE_SIZE[0], config.IMAGE_SIZE[1]).to(config.DEVICE)
        anomaly_map = model.predict_anomaly_map(dummy_batch)

        print(f"Input batch shape: {dummy_batch.shape}")
        print(f"Predicted anomaly map shape: {anomaly_map.shape}")
        assert anomaly_map.shape == (2, 1, config.IMAGE_SIZE[0], config.IMAGE_SIZE[1]), "Anomaly map spatial dimensions must match input."
        print("PaDiM forward pass checks PASSED.")
    except Exception as e:
        print(f"ERROR testing PaDiM model: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    # 5. Test PaDiM Model Saving and Loading
    print("\n[STEP 5] Testing PaDiM Model Persistence (Save & Load)...")
    try:
        test_save_path = config.MODEL_DIR / "padim_mock_test.pth"
        model.save(test_save_path)

        loaded_model = PaDiM(device=config.DEVICE)
        success = loaded_model.load(test_save_path)
        assert success, "Failed to load saved PaDiM model."

        if test_save_path.exists():
            test_save_path.unlink()
        print("PaDiM save/load checks PASSED.")
    except Exception as e:
        print(f"ERROR testing model save/load: {e}")
        sys.exit(1)

    # 6. Test FastAPI Endpoint Client
    print("\n[STEP 6] Testing FastAPI Prediction Endpoint...")
    try:
        import asyncio
        from fastapi import UploadFile
        import io
        from anomaly_detection.api import predict_image_internal, get_status


        sample_img_path = test_dataset.image_paths[0]
        print(f"Loading sample image for API predict test: {sample_img_path}")
        sample_pil = Image.open(sample_img_path).convert("RGB")
        pred_data = predict_image_internal(
            pil_img=sample_pil,
            filename=os.path.basename(sample_img_path),
            category=config.CATEGORY,
            enable_yolo=True
        )



        print("API predict response fields:")
        for k in ["defect_result", "defect_class", "confidence_pct", "anomaly_score", "threshold", "defect_count", "bounding_boxes"]:
            print(f"  - {k}: {pred_data.get(k)}")

        assert "is_anomaly" in pred_data
        assert "anomaly_score" in pred_data
        assert "heatmap_image" in pred_data
        assert "overlay_image" in pred_data
        assert "mask_image" in pred_data
        print("FastAPI prediction check PASSED.")
    except Exception as e:
        print(f"ERROR testing FastAPI prediction call: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print("\n" + "="*65)
    print("   ALL PaDiM PIPELINE CHECKS PASSED SUCCESSFULLY!")
    print("="*65)

if __name__ == "__main__":
    run_tests()
