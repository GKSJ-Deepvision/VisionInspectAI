import os
import cv2
import shutil
import random
import numpy as np

# ==================================================
# PATHS
# ==================================================

DATASET_PATH = "../dataset/mvtec_anomaly_detection"

OUTPUT_PATH = "yolo_dataset"

TRAIN_IMAGES = os.path.join(OUTPUT_PATH, "images", "train")
VAL_IMAGES = os.path.join(OUTPUT_PATH, "images", "val")

TRAIN_LABELS = os.path.join(OUTPUT_PATH, "labels", "train")
VAL_LABELS = os.path.join(OUTPUT_PATH, "labels", "val")

os.makedirs(TRAIN_IMAGES, exist_ok=True)
os.makedirs(VAL_IMAGES, exist_ok=True)

os.makedirs(TRAIN_LABELS, exist_ok=True)
os.makedirs(VAL_LABELS, exist_ok=True)

# ==================================================
# CATEGORY LIST
# ==================================================

categories = sorted([
    d for d in os.listdir(DATASET_PATH)
    if os.path.isdir(os.path.join(DATASET_PATH, d))
])

print("="*40)
print("CATEGORIES")
print("="*40)

for i,c in enumerate(categories):
    print(i,c)

print("="*40)

# ==================================================
# FUNCTION
# ==================================================

def create_label(mask_path,label_path,class_id):

    mask=cv2.imread(mask_path,0)

    if mask is None:
        return False

    _,mask=cv2.threshold(mask,10,255,cv2.THRESH_BINARY)

    contours,_=cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if len(contours)==0:
        return False

    h,w=mask.shape

    with open(label_path,"w") as f:

        for cnt in contours:

            if cv2.contourArea(cnt)<20:
                continue

            x,y,bw,bh=cv2.boundingRect(cnt)

            xc=(x+bw/2)/w
            yc=(y+bh/2)/h

            bw=bw/w
            bh=bh/h

            f.write(
                f"{class_id} "
                f"{xc:.6f} "
                f"{yc:.6f} "
                f"{bw:.6f} "
                f"{bh:.6f}\n"
            )

    return True


# ==================================================
# COPY GOOD IMAGES
# ==================================================

train_count=0
val_count=0

random.seed(42)

for class_id,category in enumerate(categories):

    print("\nProcessing :",category)

    category_path=os.path.join(DATASET_PATH,category)

    # ----------------------------------------------
    # GOOD TRAIN IMAGES
    # ----------------------------------------------

    good_dir=os.path.join(
        category_path,
        "train",
        "good"
    )

    good_images=[
        f for f in os.listdir(good_dir)
        if f.endswith(".png")
    ]

    random.shuffle(good_images)

    split=int(len(good_images)*0.8)

    train_good=good_images[:split]
    val_good=good_images[split:]

    for img in train_good:

        src=os.path.join(good_dir,img)

        dst=os.path.join(
            TRAIN_IMAGES,
            f"{category}_{img}"
        )

        shutil.copy(src,dst)

        txt=os.path.join(
            TRAIN_LABELS,
            f"{category}_{img.replace('.png','.txt')}"
        )

        open(txt,"w").close()

        train_count+=1

    for img in val_good:

        src=os.path.join(good_dir,img)

        dst=os.path.join(
            VAL_IMAGES,
            f"{category}_{img}"
        )

        shutil.copy(src,dst)

        txt=os.path.join(
            VAL_LABELS,
            f"{category}_{img.replace('.png','.txt')}"
        )

        open(txt,"w").close()

        val_count+=1

    # ----------------------------------------------
    # DEFECT TYPES
    # ----------------------------------------------

    test_dir=os.path.join(category_path,"test")

    gt_dir=os.path.join(category_path,"ground_truth")

    if not os.path.exists(test_dir):
        continue

    defect_types=[
        d for d in os.listdir(test_dir)
        if d!="good"
    ]

    for defect in defect_types:

        img_dir=os.path.join(test_dir,defect)

        mask_dir=os.path.join(gt_dir,defect)

        if not os.path.exists(mask_dir):
            continue

        images=sorted([
            f for f in os.listdir(img_dir)
            if f.endswith(".png")
        ])

        random.shuffle(images)

        split=int(len(images)*0.8)

        train_imgs=images[:split]
        val_imgs=images[split:]

        # ---------------- TRAIN ----------------

        for img in train_imgs:

            src=os.path.join(img_dir,img)

            dst=os.path.join(
                TRAIN_IMAGES,
                f"{category}_{defect}_{img}"
            )

            shutil.copy(src,dst)

            mask_name=img.replace(".png","_mask.png")

            mask_path=os.path.join(
                mask_dir,
                mask_name
            )

            label_path=os.path.join(
                TRAIN_LABELS,
                f"{category}_{defect}_{img.replace('.png','.txt')}"
            )

            create_label(
                mask_path,
                label_path,
                class_id
            )

            train_count+=1

        # ---------------- VAL ----------------

        for img in val_imgs:

            src=os.path.join(img_dir,img)

            dst=os.path.join(
                VAL_IMAGES,
                f"{category}_{defect}_{img}"
            )

            shutil.copy(src,dst)

            mask_name=img.replace(".png","_mask.png")

            mask_path=os.path.join(
                mask_dir,
                mask_name
            )

            label_path=os.path.join(
                VAL_LABELS,
                f"{category}_{defect}_{img.replace('.png','.txt')}"
            )

            create_label(
                mask_path,
                label_path,
                class_id
            )

            val_count+=1

# ==================================================
# DATA YAML
# ==================================================

yaml_text=f"""
path: {os.path.abspath(OUTPUT_PATH)}

train: images/train
val: images/val

names:
"""

for i,c in enumerate(categories):
    yaml_text+=f"  {i}: {c}\n"

with open("dataset.yaml","w") as f:
    f.write(yaml_text)

print("\n"+"="*40)
print("DATASET CREATED")
print("="*40)
print("Train Images :",train_count)
print("Validation Images :",val_count)
print("dataset.yaml created")
print("="*40)