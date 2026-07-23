"""Lazy MongoDB Atlas connection helpers for inference logging."""

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def get_mongo_client():
    """Return a cached Mongo client, or None when MongoDB is not configured."""
    mongo_uri = os.getenv("MONGO_URI", "").strip()
    if not mongo_uri:
        return None

    try:
        from pymongo import MongoClient
    except ImportError:
        return None

    return MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)


def get_inference_collection():
    """Return the inference-results collection when MongoDB is configured."""
    client = get_mongo_client()
    if client is None:
        return None

    database_name = os.getenv("MONGO_DB_NAME", "visioninspect_ai").strip() or "visioninspect_ai"
    return client[database_name]["inference_results"]
