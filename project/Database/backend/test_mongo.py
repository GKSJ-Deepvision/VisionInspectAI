from database.mongo_connection import get_mongo_db


db = get_mongo_db()

print("MongoDB Connected")

print(db.list_collection_names())