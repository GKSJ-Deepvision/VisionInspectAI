import os
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

from services.dataset import list_categories, list_split_files


dataset_bp = Blueprint("dataset", __name__)


def get_dataset_root() -> Path:
    root = current_app.config.get("DATASET_ROOT")
    if root:
        return Path(root)
    return Path(os.path.join(Path(__file__).resolve().parents[1].parent, "ai", "dataset"))


@dataset_bp.route("", methods=["GET"])
def categories():
    root = get_dataset_root()
    categories = list_categories(root)
    return jsonify({"dataset_root": str(root), "categories": categories}), 200


@dataset_bp.route("/<category>/files", methods=["GET"])
def category_files(category):
    split = request.args.get("split", "train")
    root = get_dataset_root()
    categories = list_categories(root)
    if category not in categories:
        return jsonify({"error": "category not found"}), 404

    files = list_split_files(root, category, split)
    return jsonify({"category": category, "split": split, "files": files}), 200
