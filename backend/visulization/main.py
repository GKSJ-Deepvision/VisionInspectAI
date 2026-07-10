from pathlib import Path

from src.dataset_info import display_dataset_info
from src.preprocessing import preprocess_image
from src.visualization import show_image
from src.eda import (
    display_defect_types,
    show_sample_image,
    show_ground_truth,
    get_image_shape,
    get_defect_types,
    plot_defect_statistics,
)
from src.statistics import (
    display_dataset_summary,
    display_defect_statistics,
    display_defect_percentages,
)

DATASET_PATH = Path("../../data/mvtec_ad")

# Automatically detect all available categories
ALL_CATEGORIES = sorted(
    folder.name
    for folder in DATASET_PATH.iterdir()
    if folder.is_dir()
)

# Change this while testing if needed
CATEGORIES = ALL_CATEGORIES

def main():
    # Display overall dataset information
    display_dataset_info(DATASET_PATH)

    # Display dataset summary
    display_dataset_summary(DATASET_PATH)

    # Explore each category
    for category in CATEGORIES:

        print("\n" + "=" * 50)
        print(f"Category : {category.upper()}")
        print("=" * 50)

        # Display defect types
        display_defect_types(DATASET_PATH, category)
        # Display defect statistics
        display_defect_statistics(DATASET_PATH, category)
        # Display defect percentages
        display_defect_percentages(DATASET_PATH, category)
        # Plotting the chart
        plot_defect_statistics(DATASET_PATH, category)
        # Display original image shape
        shape = get_image_shape(DATASET_PATH, category)
        print(f"\nOriginal Image Shape : {shape}")
        # Display one sample good image
        show_sample_image(DATASET_PATH, category)
        # Display one sample ground truth image
        defects = get_defect_types(DATASET_PATH, category)

        for defect in defects:
            if defect != "good":
                show_ground_truth(DATASET_PATH, category, defect)
                break

        # Preprocess one training image
        image_folder = DATASET_PATH / category / "train" / "good"
        image_files = sorted(image_folder.glob("*.png"))

        if not image_files:
            print(f"No training images found for {category}")
            continue

        processed = preprocess_image(image_files[0])

        print("\nProcessed Image")
        print(f"Shape : {processed.shape}")
        print(f"Dtype : {processed.dtype}")
        print(f"Min   : {processed.min():.4f}")
        print(f"Max   : {processed.max():.4f}")

        show_image(processed, f"{category} - Preprocessed")

if __name__ == "__main__":
    main()