from pathlib import Path
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "processed_dataset" / "bottle"

classes = {}

for folder in ["train", "test"]:
    folder_path = DATASET / folder

    for class_dir in folder_path.iterdir():
        if class_dir.is_dir():
            image_count = len(list(class_dir.glob("*.png")))
            classes[f"{folder}/{class_dir.name}"] = image_count

print("\nDataset Summary")
print("-" * 30)

for key, value in classes.items():
    print(f"{key:<30} {value}")

plt.figure(figsize=(10,5))
plt.bar(classes.keys(), classes.values())
plt.xticks(rotation=45)
plt.ylabel("Number of Images")
plt.title("Bottle Dataset Distribution")
plt.tight_layout()
plt.show()