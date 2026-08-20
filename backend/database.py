from pymongo import MongoClient
import os


# =========================================================
# MONGODB CONNECTION
# =========================================================

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017/"
)


client = MongoClient(
    MONGODB_URI,
    tls=True,
    serverSelectionTimeoutMS=30000
)


# =========================================================
# DATABASE
# =========================================================

db = client["VisionInspectAI"]


# =========================================================
# COLLECTIONS
# =========================================================

users_collection = db["users"]

history_collection = db["inspection_history"]
