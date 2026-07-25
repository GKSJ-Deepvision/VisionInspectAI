from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "processed_dataset" / "bottle"

total = 0

print("=" * 50)
print("DATASET SUMMARY")
print("=" * 50)

for folder in ["train", "test"]:
    folder_path = DATASET / folder

    print(f"\n{folder.upper()}")

    for cls in folder_path.iterdir():
        if cls.is_dir():
            count = len(list(cls.glob("*.png")))
            total += count
            print(f"{cls.name:<20} {count}")

print("\nTotal Images :", total)