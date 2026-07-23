"""Persistence helpers for MongoDB inference results."""

from datetime import datetime, timezone

from database.mongo_connection import get_inference_collection


def save_inference_result(result):
    """Save an inference payload and return its MongoDB id, or None if disabled."""
    collection = get_inference_collection()
    if collection is None:
        return None

    document = dict(result)
    document["created_at"] = datetime.now(timezone.utc)
    inserted = collection.insert_one(document)
    return str(inserted.inserted_id)


def get_inference_result(result_id):
    """Read an inference result by MongoDB id, returning None when absent or invalid."""
    collection = get_inference_collection()
    if collection is None:
        return None

    try:
        from bson import ObjectId

        document = collection.find_one({"_id": ObjectId(result_id)})
    except Exception:
        return None

    if document is None:
        return None

    document["_id"] = str(document["_id"])
    if isinstance(document.get("created_at"), datetime):
        document["created_at"] = document["created_at"].isoformat()
    return document
