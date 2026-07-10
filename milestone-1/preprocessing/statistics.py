import os
import csv


class DatasetStatistics:

    def __init__(self):
        self.rows = []

    def analyze(self, dataset_path):

        categories = sorted(os.listdir(dataset_path))

        for category in categories:

            category_path = os.path.join(dataset_path, category)

            if not os.path.isdir(category_path):
                continue

            train_count = 0
            test_count = 0

            train_path = os.path.join(category_path, "train")
            test_path = os.path.join(category_path, "test")

            for root, _, files in os.walk(train_path):
                train_count += len(
                    [f for f in files if f.endswith(".png")]
                )

            for root, _, files in os.walk(test_path):
                test_count += len(
                    [f for f in files if f.endswith(".png")]
                )

            self.rows.append([
                category,
                train_count,
                test_count,
                train_count + test_count
            ])

    def save(self, output_file):

        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, "w", newline="") as file:

            writer = csv.writer(file)

            writer.writerow([
                "Category",
                "Train Images",
                "Test Images",
                "Total Images"
            ])

            writer.writerows(self.rows)

        print(f"Dataset statistics saved to {output_file}")