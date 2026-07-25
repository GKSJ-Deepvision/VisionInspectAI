import os
from pathlib import Path
from PIL import Image
from tqdm import tqdm

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BASE_DIR / "dataset" / "bottle"
OUTPUT_DIR = BASE_DIR / "processed_dataset" / "bottle"

IMAGE_SIZE = (224, 224)

for root, dirs, files in os.walk(INPUT_DIR):
    relative_path = Path(root).relative_to(INPUT_DIR)
    output_folder = OUTPUT_DIR / relative_path
    output_folder.mkdir(parents=True, exist_ok=True)

    image_files = [
        f for f in files
        if f.lower().endswith((".png", ".jpg", ".jpeg"))
    ]

    for file in tqdm(image_files, desc=str(relative_path)):
        input_path = Path(root) / file
        output_path = output_folder / file

        try:
            img = Image.open(input_path).convert("RGB")
            img = img.resize(IMAGE_SIZE)
            img.save(output_path)

        except Exception as e:
            print(f"Error processing {input_path}: {e}")

print("\n✅ Dataset preprocessing completed successfully!")