from src.dataset_loader import load_images
from src.pipeline import run_pipeline
from src.config import DATASET_PATH



# Change these while testing
CATEGORY = "wood"
SPLIT = "test"
DEFECT_TYPE = "good"


def main():

    print("=" * 50)
    print("VisionInspectAI")
    print("=" * 50)

    images = load_images(
        DATASET_PATH,
        category=CATEGORY,
        split=SPLIT,
        defect_type=DEFECT_TYPE
    )

    if not images:
        print("No images found.")
        return

    image_path = images[0]

    print(f"\nCategory : {CATEGORY}")
    print(f"Split    : {SPLIT}")
    print(f"Defect   : {DEFECT_TYPE}")
    print(f"Image    : {image_path.name}")

    run_pipeline(image_path)


if __name__ == "__main__":
    main()