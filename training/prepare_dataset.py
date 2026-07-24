import os
import shutil
import random
from pathlib import Path

# =====================================================
# PATHS
# =====================================================

SOURCE_DATASET = Path("../dataset/mvtec_anomaly_detection")
OUTPUT_DATASET = Path("../prepared_dataset")

TRAIN_DIR = OUTPUT_DATASET / "train"
VAL_DIR = OUTPUT_DATASET / "validation"
TEST_DIR = OUTPUT_DATASET / "test"

random.seed(42)

# =====================================================
# CREATE FOLDERS
# =====================================================

for folder in [
    TRAIN_DIR / "No_Defect",
    TRAIN_DIR / "Defective",
    VAL_DIR / "No_Defect",
    VAL_DIR / "Defective",
    TEST_DIR / "No_Defect",
    TEST_DIR / "Defective",
]:
    folder.mkdir(parents=True, exist_ok=True)

# =====================================================
# IMAGE EXTENSIONS
# =====================================================

IMAGE_EXTENSIONS = (
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
)

# =====================================================
# COLLECT IMAGES
# =====================================================

good_images = []
defect_images = []

categories = sorted(
    [
        folder
        for folder in SOURCE_DATASET.iterdir()
        if folder.is_dir()
    ]
)

print(f"\nFound {len(categories)} categories\n")

for category in categories:

    print(f"Processing : {category.name}")

    train_good = category / "train" / "good"

    if train_good.exists():

        for img in train_good.iterdir():

            if img.suffix.lower() in IMAGE_EXTENSIONS:
                good_images.append(img)

    test_folder = category / "test"

    if test_folder.exists():

        for defect_folder in test_folder.iterdir():

            if defect_folder.name == "good":
                for img in defect_folder.iterdir():

                    if img.suffix.lower() in IMAGE_EXTENSIONS:
                        good_images.append(img)

            else:

                for img in defect_folder.iterdir():

                    if img.suffix.lower() in IMAGE_EXTENSIONS:
                        defect_images.append(img)

print("\n============================")
print("Total Good Images :", len(good_images))
print("Total Defect Images :", len(defect_images))
print("============================\n")

# =====================================================
# SHUFFLE
# =====================================================

random.shuffle(good_images)
random.shuffle(defect_images)

# =====================================================
# SPLIT FUNCTION
# =====================================================

def split_images(images):

    total = len(images)

    train = int(total * 0.70)
    val = int(total * 0.15)

    train_imgs = images[:train]
    val_imgs = images[train:train + val]
    test_imgs = images[train + val:]

    return train_imgs, val_imgs, test_imgs

good_train, good_val, good_test = split_images(good_images)

def_train, def_val, def_test = split_images(defect_images)

# =====================================================
# COPY FUNCTION
# =====================================================

def copy_images(images, destination):

    for img in images:

        category = img.parents[2].name

        filename = f"{category}_{img.name}"

        shutil.copy2(
            img,
            destination / filename
        )

# =====================================================
# COPY GOOD
# =====================================================

print("Copying No Defect Images...")

copy_images(
    good_train,
    TRAIN_DIR / "No_Defect"
)

copy_images(
    good_val,
    VAL_DIR / "No_Defect"
)

copy_images(
    good_test,
    TEST_DIR / "No_Defect"
)

# =====================================================
# COPY DEFECT
# =====================================================

print("Copying Defect Images...")

copy_images(
    def_train,
    TRAIN_DIR / "Defective"
)

copy_images(
    def_val,
    VAL_DIR / "Defective"
)

copy_images(
    def_test,
    TEST_DIR / "Defective"
)

# =====================================================
# FINAL COUNT
# =====================================================

print("\nDataset Preparation Completed Successfully!\n")

print("TRAIN")
print("No Defect :", len(good_train))
print("Defective :", len(def_train))

print("\nVALIDATION")
print("No Defect :", len(good_val))
print("Defective :", len(def_val))

print("\nTEST")
print("No Defect :", len(good_test))
print("Defective :", len(def_test))

print("\nPrepared Dataset Location:")
print(OUTPUT_DATASET.resolve())