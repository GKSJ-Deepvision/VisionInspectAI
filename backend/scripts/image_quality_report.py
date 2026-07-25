from pathlib import Path
import cv2
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "processed_dataset" / "bottle"

records = []

for image_path in DATASET.rglob("*.png"):

    img = cv2.imread(str(image_path))

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    brightness = gray.mean()
    contrast = gray.std()
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

    records.append({
        "Image": image_path.name,
        "Width": img.shape[1],
        "Height": img.shape[0],
        "Brightness": round(brightness,2),
        "Contrast": round(contrast,2),
        "Sharpness": round(sharpness,2)
    })

df = pd.DataFrame(records)

print(df.head())

output = BASE_DIR / "image_quality_report.csv"

df.to_csv(output,index=False)

print("\nReport Saved:", output)