import os
import csv


class ReportGenerator:

    def __init__(self):
        self.records = []

    def add_record(self,
                   category,
                   image_name,
                   original_shape,
                   processed_shape):

        self.records.append({

            "Category": category,

            "Image": image_name,

            "Original Size": f"{original_shape[1]}x{original_shape[0]}",

            "Processed Size": f"{processed_shape[1]}x{processed_shape[0]}"

        })

    def save(self, output_file):

        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file,
                  "w",
                  newline="") as csvfile:

            writer = csv.DictWriter(
                csvfile,
                fieldnames=[
                    "Category",
                    "Image",
                    "Original Size",
                    "Processed Size"
                ]
            )

            writer.writeheader()

            writer.writerows(self.records)

        print(f"\nReport saved to {output_file}")