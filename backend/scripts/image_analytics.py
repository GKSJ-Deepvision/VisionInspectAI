from pathlib import Path
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "processed_dataset" / "bottle"

summary = {}

for folder in ["train", "test"]:
    folder_path = DATASET / folder

    for category in folder_path.iterdir():
        if category.is_dir():
            count = len(list(category.glob("*.png")))
            summary[f"{folder}/{category.name}"] = count

print("=" * 40)
print("IMAGE ANALYTICS")
print("=" * 40)

total = 0

for key, value in summary.items():
    print(f"{key:<30} {value}")
    total += value

print("\nTotal Images:", total)

plt.figure(figsize=(10,5))
plt.bar(summary.keys(), summary.values())
plt.xticks(rotation=45)
plt.ylabel("Images")
plt.title("Bottle Dataset Analytics")
plt.tight_layout()
plt.savefig(BASE_DIR / "dataset_analytics.png")
plt.show()