import numpy as np
import pandas as pd
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

# gets defect statistics for a single category
def get_defect_statistics(dataset_path, category):
    """Return the number of test images for each category"""

    category_path = Path(dataset_path) / category / "test"
    statistics = {}

    for defect in sorted(category_path.iterdir()):
        if not defect.is_dir():
            continue
        statistics[defect.name] = count_images(defect)

    return statistics

# displays defect statistics for a single category
def display_defect_statistics(dataset_path, category):
    """Display image count for each defect type"""
    statistics = get_defect_statistics(dataset_path, category)

    print("\nDefect Statistics")
    print("-" * 30)

    for defect, count in statistics.items():
        print(f"{defect:<25}{count:>5}")

#  display defect percentage
def display_defect_percentages(dataset_path, category):
    """Display percentage of images for each defect type"""
    statistics = get_defect_statistics(dataset_path, category)
    total = sum(statistics.values()) 
    if total == 0:
        return

    print("\nDefect Percentage")
    print("-" * 30)

    for defect, count in statistics.items():
        percentage = (count / total) * 100
        print(f"{defect:<25}{percentage:>7.2f}%")

def generate_dataset_report(dataset_path):
    """
    Generate dataset analytics as a pandas DataFrame.
    """
    summary = get_dataset_summary(dataset_path)

    df = pd.DataFrame(summary)

    df["Total"] = (
        df["Train"]
        + df["Test"]
        + df["Ground Truth"]
    )
    return df

def calculate_dataset_metrics(dataset_path):
    """
    Calculate overall dataset metrics.
    """
    df = generate_dataset_report(dataset_path)

    metrics = {
        "Total Categories": len(df),
        "Total Training Images": int(df["Train"].sum()),
        "Total Testing Images": int(df["Test"].sum()),
        "Total Ground Truth Masks": int(df["Ground Truth"].sum()),
        "Total Images": int(df["Total"].sum()),
        "Largest Category": df.loc[
            df["Total"].idxmax(),
            "Category"
        ],
        "Smallest Category": df.loc[
            df["Total"].idxmin(),
            "Category"
        ]
    }
    return metrics

def display_dataset_metrics(dataset_path):
    """
    Display overall dataset metrics.
    """
    metrics = calculate_dataset_metrics(dataset_path)
    print("\n")
    print("=" * 50)
    print("DATASET ANALYTICS")
    print("=" * 50)

    for key, value in metrics.items():
        print(f"{key:<28}: {value}")

    print("=" * 50)   