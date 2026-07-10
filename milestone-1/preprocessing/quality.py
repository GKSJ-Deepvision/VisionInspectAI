import os
import cv2
import csv
import numpy as np


class ImageQuality:

    def __init__(self):
        self.records = []

    def analyze(self, dataset_path):

        valid_extensions = (".png", ".jpg", ".jpeg", ".bmp")

        for root, _, files in os.walk(dataset_path):

            for file in files:

                if not file.lower().endswith(valid_extensions):
                    continue

                path = os.path.join(root, file)

                image = cv2.imread(path)

                if image is None:
                    continue

                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

                height, width = gray.shape

                brightness = np.mean(gray)

                contrast = np.std(gray)

                self.records.append({
                    "Image": path,
                    "Width": width,
                    "Height": height,
                    "Brightness": round(float(brightness), 2),
                    "Contrast": round(float(contrast), 2)
                })

    def save(self, output_file):

        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, "w", newline="") as csvfile:

            writer = csv.DictWriter(
                csvfile,
                fieldnames=[
                    "Image",
                    "Width",
                    "Height",
                    "Brightness",
                    "Contrast"
                ]
            )

            writer.writeheader()

            writer.writerows(self.records)

        print(f"\nQuality report saved to {output_file}")