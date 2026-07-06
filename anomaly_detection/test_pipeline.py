import os
import sys
from pathlib import Path
import torch
from torch.utils.data import Subset

# Adjust path to import from package
sys.path.append(str(Path(__file__).resolve().parent.parent))

from anomaly_detection import config
from anomaly_detection.dataset import MVTecDataset, get_dataloaders
from anomaly_detection.model import AnomalyAutoencoder
from anomaly_detection.train import train_model
from anomaly_detection.api import app

def run_tests():
    print("="*60)
    print("        VISIONINSPECT AI - ML PIPELINE VERIFICATION        ")
    print("="*60)
    
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
        print("Please check config.py and update DEFAULT_DATASET_DIR if needed.")
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
        
        # Pull a sample
        img, label, defect_type, img_path = train_dataset[0]
        print(f"Sample loaded successfully:")
        print(f"  - Image shape: {img.shape}")
        print(f"  - Label: {label} (0=Normal, 1=Anomalous)")
        print(f"  - Defect Type: {defect_type}")
        print(f"  - Image Path: {img_path}")
        print("Dataset loader checks PASSED.")
    except Exception as e:
        print(f"ERROR testing dataset loading: {e}")
        sys.exit(1)
        
    # 4. Test Model Forward Pass
    print("\n[STEP 4] Testing Autoencoder Model Forward Pass...")
    try:
        model = AnomalyAutoencoder()
        # Create a dummy batch of shape: [Batch, Channels, Height, Width]
        dummy_batch = torch.randn(2, 3, config.IMAGE_SIZE[0], config.IMAGE_SIZE[1])
        output = model(dummy_batch)
        print(f"Input batch shape: {dummy_batch.shape}")
        print(f"Output batch shape: {output.shape}")
        assert output.shape == dummy_batch.shape, "Model input and output shapes must match."
        print("Model forward pass checks PASSED.")
    except Exception as e:
        print(f"ERROR testing model: {e}")
        sys.exit(1)
        
    # 5. Run Fast Train test (1 Epoch, few samples)
    print("\n[STEP 5] Running 1-Epoch Mock Training to verify gradients & saving...")
    try:
        # Override epochs to 1 for quick validation
        train_model(num_epochs=1)
        print("Model training loop test PASSED.")
    except Exception as e:
        print(f"ERROR testing training loop: {e}")
        sys.exit(1)
        
    # 6. Test FastAPI Endpoint Client
    print("\n[STEP 6] Testing FastAPI Endpoint (Direct Call)...")
    try:
        import asyncio
        from fastapi import UploadFile
        import io
        from anomaly_detection.api import predict, get_status
        
        # Test get_status directly
        status = get_status()
        print(f"Status response: {status}")
        assert status["status"] == "online"
        
        # Test predict directly using a sample image from the test set
        sample_img_path = test_dataset.image_paths[0]
        print(f"Loading sample image for direct API function test: {sample_img_path}")
        
        with open(sample_img_path, "rb") as f:
            img_bytes = f.read()
            
        file_obj = io.BytesIO(img_bytes)
        upload_file = UploadFile(
            filename=os.path.basename(sample_img_path),
            file=file_obj,
            size=len(img_bytes)
        )
        
        # Call predict directly using asyncio
        pred_data = asyncio.run(predict(upload_file))
        
        print("API predict response:")
        for k in pred_data.keys():
            val = pred_data[k]
            # If the value is a long base64 string, print just its length and a short preview
            if isinstance(val, str) and val.startswith("data:image"):
                print(f"  - {k}: {val[:30]}... (length: {len(val)} chars)")
            else:
                print(f"  - {k}: {val}")
            
        assert "is_anomaly" in pred_data
        assert "anomaly_score" in pred_data
        assert "original_image" in pred_data
        assert "heatmap_image" in pred_data
        print("FastAPI prediction direct call check PASSED.")
    except Exception as e:
        print(f"ERROR testing FastAPI prediction call: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
        
    print("\n" + "="*60)
    print("   ALL PIPELINE CHECKS PASSED SUCCESSFULLY!")
    print("   The Anomaly Detection module is ready for team integration.")
    print("="*60)

if __name__ == "__main__":
    run_tests()
