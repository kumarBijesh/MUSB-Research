"""
Seed Script — Creates default test accounts for development.
Run with: python seed.py

Accounts Created:
  Participant : test@participant.com / Participant@123
  Admin       : admin@musbresearch.com / Admin@123456
  Coordinator : coordinator@musbresearch.com / Coord@123456
"""

import asyncio
import bcrypt
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# ─── Config ──────────────────────────────────────────────────────────────────

MONGO_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DATABASE_NAME", "musb_research")



# ─── Accounts ────────────────────────────────────────────────────────────────

SEED_USERS = [
    {
        "name"     : "Test Participant",
        "email"    : "test@participant.com",
        "password" : "Participant@123",
        "role"     : "PARTICIPANT",
    },
    {
        "name"     : "Admin User",
        "email"    : "admin@musbresearch.com",
        "password" : "Admin@123456",
        "role"     : "ADMIN",
    },
    {
        "name"     : "Study Coordinator",
        "email"    : "coordinator@musbresearch.com",
        "password" : "Coord@123456",
        "role"     : "COORDINATOR",
    },
    {
        "name"     : "Sponsor Partner",
        "email"    : "sponsor@musbresearch.com",
        "password" : "Sponsor@123456",
        "role"     : "SPONSOR",
    },
]

# ─── Seeder ──────────────────────────────────────────────────────────────────

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    now = datetime.now(timezone.utc)

    print(f"\n🌱  Seeding database: {DB_NAME}\n{'─'*40}")

    for account in SEED_USERS:
        existing = await db["users"].find_one({"email": account["email"]})
        if existing:
            print(f"⚠️  Skipped  → {account['email']} (already exists)")
            continue

        # Insert user
        user_doc = {
            "name"         : account["name"],
            "email"        : account["email"],
            "passwordHash" : bcrypt.hashpw(account["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            "role"         : account["role"],
            "emailVerified": now,
            "createdAt"    : now,
            "updatedAt"    : now,
        }
        result = await db["users"].insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Auto-create participant profile for PARTICIPANT role
        if account["role"] == "PARTICIPANT":
            await db["participants"].insert_one({
                "userId"    : user_id,
                "status"    : "ACTIVE",
                "timezone"  : "UTC",
                "createdAt" : now,
                "updatedAt" : now,
            })

        print(f"✅  Created  → [{account['role']}] {account['email']}  |  pass: {account['password']}")

    print(f"\n{'─'*40}")
    print("🎉  Seeding complete!\n")
    print("  Participant login:")
    print("    Email    : test@participant.com")
    print("    Password : Participant@123\n")
    print("  Admin login:")
    print("    Email    : admin@musbresearch.com")
    print("    Password : Admin@123456\n")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
