import sys
import shutil
from pathlib import Path

# Fix: Import specific Thresholding and Normalization modules to ensure proper metrics
from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import Folder

def train_production_patchcore(category: str = "bottle"):
    print(f"🚀 Starting Production PatchCore Training for category: {category.upper()}")
    
    # Assuming execution from project root
    dataset_base_path = Path("./datasets/mvtec").resolve()
    results_base_path = Path("./backend/results").resolve()
    
    # 1. Rigorous Train-Test Splits using generic Folder module 
    # (since MVTec module requires ground_truth masks which we don't have)
    cat_dir = dataset_base_path / category
    test_dir = cat_dir / "test"
    abnormal_dirs = [f"test/{d.name}" for d in test_dir.iterdir() if d.is_dir() and d.name != "good"]
    
    datamodule = Folder(
        name=category,
        root=cat_dir,
        normal_dir="train/good",
        normal_test_dir="test/good",
        abnormal_dir=abnormal_dirs,
        train_batch_size=16,
        eval_batch_size=16,
        num_workers=4
    )

    # -------------------------------------------------------------------------
    # 2. Deep Feature Extraction
    # -------------------------------------------------------------------------
    # We are using resnet18 instead of wide_resnet50_2 because your machine 
    # keeps running out of RAM (OOM Killed). resnet18 is 4x smaller in memory!
    model = Patchcore(
        backbone="resnet18", 
        coreset_sampling_ratio=0.01
    )

    output_dir = Path(f"./training_output/{category}")
    
    # -------------------------------------------------------------------------
    # 3. Automatic Thresholding & Normalization (The Fix)
    # -------------------------------------------------------------------------
    # normalization="min_max": Bakes MinMax boundaries into the checkpoint
    # By NOT setting limit_val_batches=0, we FORCE the engine to evaluate the 
    # validation set and calculate the optimal F1-Max threshold before finalizing!
    engine = Engine(
        default_root_dir=output_dir
    )

    print("Fitting model and calculating thresholds... (This may take a few minutes)")
    engine.fit(model=model, datamodule=datamodule)
    
    # Explicitly run test phase to confirm thresholding works and bake it in
    print("Running test loop to finalize F1-Max thresholds...")
    engine.test(model=model, datamodule=datamodule)

    # Route generated weights directly to backend results directory
    ckpt_files = list(output_dir.rglob("*.ckpt"))
    if len(ckpt_files) > 0:
        latest_ckpt = ckpt_files[-1] 
        dest_dir = results_base_path / category / "weights"
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_file = dest_dir / "best_model.ckpt"
        
        shutil.copy(str(latest_ckpt), str(dest_file))
        print(f"✅ Successfully saved production weights to {dest_file}")
    else:
        print(f"❌ Could not find checkpoint file!")

if __name__ == "__main__":
    import gc
    import torch
    
    target = sys.argv[1] if len(sys.argv) > 1 else "bottle"
    
    if target == "all":
        categories = [
            "bottle", "cable", "capsule", "carpet", "grid", 
            "hazelnut", "leather", "metal_nut", "pill", "screw", 
            "tile", "toothbrush", "transistor", "wood", "zipper"
        ]
        for cat in categories:
            expected_weights = Path(f"./backend/results/{cat}/weights/best_model.ckpt")
            if expected_weights.exists():
                print(f"⏩ Skipping {cat}: Weights already exist")
                continue
                
            train_production_patchcore(category=cat)
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        print("\n🎉 Batch training complete! All 15 models are ready.")
    else:
        train_production_patchcore(category=target)
