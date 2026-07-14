from pathlib import Path
import cv2

from config import (
    DATASET_ROOT,
    IMAGE_EXTENSIONS,
    LINE,
    SUBLINE,
)

def get_image_files(folder: Path):
    if not folder.exists():
        return []

    return [
        file
        for file in folder.iterdir()
        if file.is_file()
        and file.suffix.lower() in IMAGE_EXTENSIONS
    ]


def inspect_sample_image(folder: Path):
    image_files = get_image_files(folder)

    if not image_files:
        return "-", "-", "-", 0

    corrupted_images = 0

    for image_path in image_files:
        image = cv2.imread(str(image_path))

        if image is None:
            corrupted_images += 1
            continue

        height, width = image.shape[:2]

        if len(image.shape) == 2:
            channels = "Grayscale"
        else:
            channels = f"{image.shape[2]} Channels"

        return (
            width,
            height,
            channels,
            corrupted_images,
        )

    return "-", "-", "-", corrupted_images


def explore_dataset():

    if not DATASET_ROOT.exists():
        raise FileNotFoundError(
            f"Dataset folder not found:\n{DATASET_ROOT}"
        )

    categories = sorted(
        folder
        for folder in DATASET_ROOT.iterdir()
        if folder.is_dir()
    )

    total_train = 0
    total_test = 0
    total_masks = 0
    total_good = 0
    total_defective = 0
    total_corrupted = 0

    for category_path in categories:

        category = category_path.name

        train_path = category_path / "train"
        test_path = category_path / "test"
        gt_path = category_path / "ground_truth"

        train_images = 0
        test_images = 0
        good_images = 0
        defective_images = 0
        mask_count = 0

        defect_types = {}

        image_width = "-"
        image_height = "-"
        image_channels = "-"

        corrupted_images = 0

        # Training Images

        if train_path.exists():

            for folder in sorted(train_path.iterdir()):

                if not folder.is_dir():
                    continue

                train_images += len(
                    get_image_files(folder)
                )
       
        # Testing Images

        if test_path.exists():

            for folder in sorted(test_path.iterdir()):

                if not folder.is_dir():
                    continue

                images = get_image_files(folder)

                test_images += len(images)

                if folder.name == "good":
                    good_images += len(images)
                else:
                    defective_images += len(images)
                    defect_types[folder.name] = len(images)

        # Ground Truth Masks

        if gt_path.exists():

            for folder in sorted(gt_path.iterdir()):

                if not folder.is_dir():
                    continue

                mask_count += len(
                    get_image_files(folder)
                )

        # Sample Image Information

        sample_folder = train_path / "good"

        if sample_folder.exists():

            (
                image_width,
                image_height,
                image_channels,
                corrupted_images,
            ) = inspect_sample_image(sample_folder)

        total_train += train_images
        total_test += test_images
        total_good += good_images
        total_defective += defective_images
        total_masks += mask_count
        total_corrupted += corrupted_images

        print("\n" + LINE)
        print(f"Category : {category}")
        print(SUBLINE)

        print(f"Training Images       : {train_images}")
        print(f"Good Test Images      : {good_images}")
        print(f"Defective Test Images : {defective_images}")
        print(f"Total Test Images     : {test_images}")
        print(f"Ground Truth Masks    : {mask_count}")

        print(f"Image Resolution      : {image_width} × {image_height}")
        print(f"Color Channels        : {image_channels}")
        print(f"Corrupted Images      : {corrupted_images}")

        print("\nDefect Types:")

        if not defect_types:
            print("None")
        else:
            for defect, count in defect_types.items():
                print(f"{defect}: {count}")

    print("\n" + LINE)
    print("Overall Dataset Summary".center(len(LINE)))

    print(f"Total Categories      : {len(categories)}")
    print(f"Training Images       : {total_train}")
    print(f"Testing Images        : {total_test}")
    print(f"Good Test Images      : {total_good}")
    print(f"Defective Test Images : {total_defective}")
    print(f"Ground Truth Masks    : {total_masks}")
    print(f"Corrupted Images      : {total_corrupted}")
    print(f"Total Images          : {total_train + total_test}")


def main():
    explore_dataset()
if __name__ == "__main__":
    main()