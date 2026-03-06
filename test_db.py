import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def test_conn():
    load_dotenv('backend/.env')
    url = os.getenv('DATABASE_URL')
    name = os.getenv('DATABASE_NAME')
    print(f"Testing connection to: {url}")
    print(f"DB Name: {name}")
    try:
        client = AsyncIOMotorClient(url)
        # Try to list collections to verify connection
        db = client[name]
        collections = await db.list_collection_names()
        print(f"Collections in {name}: {collections}")
        print("Connection successful!")
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_conn())
