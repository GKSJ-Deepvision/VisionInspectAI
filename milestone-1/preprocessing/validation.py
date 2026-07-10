import os
import cv2
import csv


class ImageValidator:

    def __init__(self):
        self.records = []

    def validate(self, dataset_path):

        valid_extensions = (".png", ".jpg", ".jpeg", ".bmp")

        for root, _, files in os.walk(dataset_path):

            for file in files:

                path = os.path.join(root, file)

                status = "Valid"

                # Check extension
                if not file.lower().endswith(valid_extensions):
                    status = "Invalid Extension"

                # Check zero-byte file
                elif os.path.getsize(path) == 0:
                    status = "Empty File"

                else:
                    image = cv2.imread(path)

                    if image is None:
                        status = "Corrupted"

                self.records.append([
                    path,
                    status
                ])

    def save(self, output_file):

        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, "w", newline="") as csvfile:

            writer = csv.writer(csvfile)

            writer.writerow([
                "Image Path",
                "Status"
            ])
            writer.writerows(self.records)

        print(f"Validation report saved to {output_file}")