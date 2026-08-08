import os
from pathlib import Path
from typing import List
def list_categories(dataset_root: Path) -> List[str]:
    """List all product categories in the dataset"""
    if not dataset_root.exists() or not dataset_root.is_dir():
        return []
    return sorted([entry.name for entry in dataset_root.iterdir() if entry.is_dir()])


def list_split_files(dataset_root: Path, category: str, split: str) -> List[str]:
    """List all files in a specific split of a category"""
    split_dir = dataset_root / category / split
    if not split_dir.exists() or not split_dir.is_dir():
        return []
    return sorted([str(path.name) for path in split_dir.iterdir() if path.is_file()])


def get_category_stats(category_path: Path) -> dict:
    """Get statistics for a category (number of images per split)"""
    stats = {}
    for split in ["train", "test"]:
        split_dir = category_path / split
        count = 0
        if split_dir.exists():
            count = sum(1 for _ in split_dir.iterdir() if _.is_file())
        stats[split] = count
    return stats
