from typing import Optional
from pymongo import AsyncMongoClient

from app.config import settings

client: Optional[AsyncMongoClient] = None


def get_client() -> AsyncMongoClient:
    global client
    if client is None:
        client = AsyncMongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000)
    return client


def get_database():
    return get_client()[settings.mongodb_database]


async def ping_database() -> bool:
    c = get_client()
    await c.admin.command("ping")
    return True


async def close_database() -> None:
    global client
    if client is not None:
        await client.close()
        client = None

