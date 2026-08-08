from database.mongo_connection import get_mongo_db


db = get_mongo_db()

collection = db["inference_results"]


print("Documents in MongoDB:")

for doc in collection.find():
    print(doc)