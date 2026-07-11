import os
import matplotlib.pyplot as plt
from PIL import Image

folder_path = r"C:\Projects\VisionInspectAI\dataset_split\train"

images = []

for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.endswith((".png",".jpg",".jpeg")):
            images.append(os.path.join(root,file))

print("Total images:", len(images))

# Show only 9 images
sample_images = images[:9]

plt.figure(figsize=(10,10))

for i, img_path in enumerate(sample_images):
    img = Image.open(img_path)

    plt.subplot(3,3,i+1)
    plt.imshow(img)
    plt.title(os.path.basename(img_path))
    plt.axis("off")

plt.tight_layout()
plt.show()