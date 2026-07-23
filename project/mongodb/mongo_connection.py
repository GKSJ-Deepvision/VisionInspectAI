import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
 
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "visioninspect_ai")
 
_client = None
_db = None
 
def get_mongo_db():
    """Returns a singleton MongoDB database handle."""
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
        _db = _client[MONGO_DB_NAME]
        _client.admin.command("ping")
    return _db
