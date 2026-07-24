from pymongo import MongoClient

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")

# Database
db = client["VisionInspectAI"]

# Collections
users_collection = db["users"]
history_collection = db["inspection_history"]
