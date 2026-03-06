import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_users():
    load_dotenv('backend/.env')
    client = AsyncIOMotorClient(os.getenv('DATABASE_URL'))
    db = client[os.getenv('DATABASE_NAME')]
    users = await db['users'].find().to_list(10)
    print(f"Found {len(users)} users.")
    for u in users:
        print(f"ID: {u.get('_id')}, Email: {u.get('email')}, Role: {u.get('role')}, HasPass: {bool(u.get('passwordHash'))}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
