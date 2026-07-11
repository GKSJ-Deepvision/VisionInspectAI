import os
import cv2
import matplotlib.pyplot as plt

dataset_path = "../dataset"
output_path = "../processed_dataset"

image_size = (224, 224)

os.makedirs(output_path, exist_ok=True)

count = 0

for category in os.listdir(dataset_path):

    category_path = os.path.join(dataset_path, category)

    if os.path.isdir(category_path):

        print("Processing category:", category)

        for root, folders, files in os.walk(category_path):

            for file in files:

                if file.lower().endswith((".png", ".jpg", ".jpeg")):

                    image_path = os.path.join(root, file)

                    img = cv2.imread(image_path)

                    if img is None:
                        continue

                    # Resize
                    resized_img = cv2.resize(img, image_size)

                    # Normalize
                    normalized_img = resized_img / 255.0

                    # Create category folder
                    save_folder = os.path.join(output_path, category)
                    os.makedirs(save_folder, exist_ok=True)

                    save_path = os.path.join(save_folder, file)

                    cv2.imwrite(save_path, resized_img)

                    count += 1

                    if count == 1:
                        plt.imshow(cv2.cvtColor(resized_img, cv2.COLOR_BGR2RGB))
                        plt.title("Preprocessed Image")
                        plt.axis("off")
                        plt.show()

print("Total processed images:", count)
print("Preprocessing completed")