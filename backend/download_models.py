"""
Downloads PatchCore model checkpoints from Hugging Face Hub
if they are not already present locally.
Runs automatically before the Flask app starts.
"""
import os
from pathlib import Path
from huggingface_hub import snapshot_download

BASE_DIR = Path(__file__).resolve().parent.parent  # goes up to project root
TARGET_DIR = BASE_DIR / "AI" / "outputs" / "Patchcore" / "MVTecAD"

REPO_ID = "himabindhuravuri/visioninspect-patchcore-models"

def ensure_models_downloaded():
    # Quick check: does the bottle checkpoint already exist? If yes, assume all are present.
    sample_check = TARGET_DIR / "bottle" / "v0" / "weights" / "lightning" / "model.ckpt"
    if sample_check.exists():
        print("PatchCore models already present, skipping download.")
        return

    print("Downloading PatchCore models from Hugging Face...")
    snapshot_download(
        repo_id=REPO_ID,
        repo_type="model",
        local_dir=str(TARGET_DIR),
        allow_patterns=["**/weights/lightning/model.ckpt"],
    )
    print("Model download complete.")

if __name__ == "__main__":
    ensure_models_downloaded()