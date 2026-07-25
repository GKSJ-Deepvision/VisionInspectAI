import random
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SOURCE = BASE_DIR / "processed_dataset" / "bottle"
DEST = BASE_DIR / "training_dataset"

TRAIN_GOOD = DEST / "train" / "good"
TRAIN_DEFECT = DEST / "train" / "defect"

VAL_GOOD = DEST / "val" / "good"
VAL_DEFECT = DEST / "val" / "defect"

for folder in [TRAIN_GOOD, TRAIN_DEFECT, VAL_GOOD, VAL_DEFECT]:
    folder.mkdir(parents=True, exist_ok=True)

# -------------------------
# GOOD IMAGES
# -------------------------
good_images = list((SOURCE / "train" / "good").glob("*.png"))

random.shuffle(good_images)

split = int(len(good_images) * 0.8)

train_good = good_images[:split]
val_good = good_images[split:]

for img in train_good:
    shutil.copy(img, TRAIN_GOOD / img.name)

for img in val_good:
    shutil.copy(img, VAL_GOOD / img.name)

# -------------------------
# DEFECT IMAGES
# -------------------------
defect_images = []

for folder in [
    "broken_large",
    "broken_small",
    "contamination"
]:
    defect_images.extend(
        list((SOURCE / "test" / folder).glob("*.png"))
    )

random.shuffle(defect_images)

split = int(len(defect_images) * 0.8)

train_defect = defect_images[:split]
val_defect = defect_images[split:]

for img in train_defect:
    shutil.copy(img, TRAIN_DEFECT / img.name)

for img in val_defect:
    shutil.copy(img, VAL_DEFECT / img.name)

print("\nTraining dataset created successfully!\n")

print(f"Train Good    : {len(train_good)}")
print(f"Train Defect  : {len(train_defect)}")
print(f"Val Good      : {len(val_good)}")
print(f"Val Defect    : {len(val_defect)}")
