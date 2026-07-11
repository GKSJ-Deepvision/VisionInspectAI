import os
import matplotlib.pyplot as plt
from PIL import Image

base_path = r"C:\Projects\VisionInspectAI\dataset_split"

folders = [
    ("Train", "train"),
    ("Validation", "validation"),
    ("Test", "test")
]

plt.figure(figsize=(12,8))

index = 1

for name, folder in folders:

    folder_path = os.path.join(base_path, folder, "bottle")

    images = []

    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith((".png",".jpg",".jpeg")):
                images.append(os.path.join(root,file))

    for img_path in images[:3]:

        img = Image.open(img_path)

        plt.subplot(3,3,index)
        plt.imshow(img)
        plt.title(name)
        plt.axis("off")

        index += 1


plt.tight_layout()
plt.show()