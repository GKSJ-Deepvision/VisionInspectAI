from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "processed_dataset" / "bottle"

folders = [
    ("train", "good"),
    ("test", "good"),
    ("test", "broken_large"),
    ("test", "broken_small"),
    ("test", "contamination"),
]

plt.figure(figsize=(15, 8))

for i, (folder, category) in enumerate(folders, start=1):
    image_folder = DATASET / folder / category
    image_path = sorted(image_folder.glob("*.png"))[0]

    image = Image.open(image_path)

    plt.subplot(2, 3, i)
    plt.imshow(image)
    plt.title(f"{folder}/{category}")
    plt.axis("off")

plt.tight_layout()
plt.show()