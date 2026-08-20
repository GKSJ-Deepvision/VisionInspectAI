from pymongo import MongoClient
import os


# MongoDB Connection
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017/"
)

client = MongoClient(MONGODB_URI)


# Database
db = client["VisionInspectAI"]


# Collections
users_collection = db["users"]
history_collection = db["inspection_history"]