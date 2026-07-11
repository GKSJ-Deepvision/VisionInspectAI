import os
import shutil
import random

source_folder = "../processed_dataset"
destination_folder = "../dataset_split"

train_ratio = 0.7
val_ratio = 0.15
test_ratio = 0.15

# Create folders
for split in ["train", "validation", "test"]:
    os.makedirs(os.path.join(destination_folder, split), exist_ok=True)

# Process each category
for category in os.listdir(source_folder):

    category_path = os.path.join(source_folder, category)

    if os.path.isdir(category_path):

        images = os.listdir(category_path)

        random.shuffle(images)

        total = len(images)

        train_count = int(total * train_ratio)
        val_count = int(total * val_ratio)

        train_images = images[:train_count]
        val_images = images[train_count:train_count + val_count]
        test_images = images[train_count + val_count:]

        for split_name, split_images in [
            ("train", train_images),
            ("validation", val_images),
            ("test", test_images)
        ]:

            split_category_folder = os.path.join(
                destination_folder,
                split_name,
                category
            )

            os.makedirs(split_category_folder, exist_ok=True)

            for image in split_images:

                source = os.path.join(category_path, image)
                destination = os.path.join(split_category_folder, image)

                shutil.copy(source, destination)

        print(category, "completed")

print("Dataset splitting completed")
import os
import matplotlib.pyplot as plt
from PIL import Image

folder_path = r"C:\Projects\VisionInspectAI\dataset_split\train"

for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.endswith((".png", ".jpg", ".jpeg")):
            image_path = os.path.join(root, file)

            print("Showing:", image_path)

            img = Image.open(image_path)

            plt.imshow(img)
            plt.title(file)
            plt.axis("off")
            plt.show()

            break
    break