import os
import gc
import shutil
import torch
from pathlib import Path
from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import Folder

import sys

def train_all_models(target_categories=None):
    print("🚀 Starting Optimized Batch Unsupervised Training Pipeline...")
    
    if target_categories:
        categories = target_categories
    else:
        categories = [
            "bottle", "cable", "capsule", "carpet", "grid", 
            "hazelnut", "leather", "metal_nut", "pill", "screw", 
            "tile", "toothbrush", "transistor", "wood", "zipper"
        ]
    
    dataset_base_path = Path("/home/user/visioninspect-ai/datasets/mvtec")
    results_base_path = Path("/home/user/visioninspect-ai/backend/results")
    
    for category in categories:
        print(f"\n==================================================")
        print(f"🔄 Training model for: {category.upper()}")
        print(f"==================================================")
        
        category_path = dataset_base_path / category
        
        if not category_path.exists():
            print(f"⚠️ Directory not found for {category}. Skipping...")
            continue
            
        # 📉 Optimized Datamodule: Lower batch size and 0 workers to save RAM
        datamodule = Folder(
            name=category,
            root=category_path,
            normal_dir="train/good", 
            train_batch_size=4, 
            num_workers=0
        )

        # 📉 Optimized Model: Keep only 1% of feature patches
        model = Patchcore(coreset_sampling_ratio=0.01)

        output_dir = Path(f"./training_output/{category}")
        
        engine = Engine(
            default_root_dir=output_dir,
            limit_val_batches=0, 
            limit_test_batches=0 
        )

        # Train the model
        engine.fit(model=model, datamodule=datamodule)
        
        # Route generated weights directly to backend results directory
        print(f"📦 Locating generated weights for {category}...")
        ckpt_files = list(output_dir.rglob("*.ckpt"))
        
        if len(ckpt_files) > 0:
            latest_ckpt = ckpt_files[-1] 
            dest_dir = results_base_path / category / "weights"
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest_file = dest_dir / "best_model.ckpt"
            
            shutil.copy(str(latest_ckpt), str(dest_file))
            print(f"✅ Successfully saved weights to {dest_file}")
        else:
            print(f"❌ Could not find checkpoint file for {category}!")

        # 🧹 Aggressive Memory Cleanup before the next loop iteration
        del model, engine, datamodule
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
    print("\n🎉 Batch training complete! All 15 models are ready.")

if __name__ == "__main__":
    import sys
    target = sys.argv[1:] if len(sys.argv) > 1 else None
    train_all_models(target_categories=target)
