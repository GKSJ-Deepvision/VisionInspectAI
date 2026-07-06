from pathlib import Path
from src.utils import count_images

# gets stats for a single category
def get_category_statistics(category_path):
    """Return statistics for a single category."""

    train = count_images(category_path / "train")
    test = count_images(category_path / "test")
    ground_truth = count_images(category_path / "ground_truth")

    return {
        "Category": category_path.name,
        "Train": train,
        "Test": test,
        "Ground Truth": ground_truth,
    }

# gets stats for all categories
def get_dataset_summary(dataset_path):
    """Return statistics for all categories."""

    dataset = Path(dataset_path)

    summary = []

    for category in sorted(dataset.iterdir()):
        if category.is_dir():
            summary.append(get_category_statistics(category))

    return summary

# prints stats in a table format
def display_dataset_summary(dataset_path):
    """Print dataset summary in table format."""

    summary = get_dataset_summary(dataset_path)

    print("\n")
    print("-" * 55)
    print(f"{'Category':<15}{'Train':>10}{'Test':>10}{'GT':>10}")
    print("-" * 55)

    for item in summary:
        print(
            f"{item['Category']:<15}"
            f"{item['Train']:>10}"
            f"{item['Test']:>10}"
            f"{item['Ground Truth']:>10}"
        )

    print("-" * 55)