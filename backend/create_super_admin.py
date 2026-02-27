"""
Create Super Admin Account
==========================
Run this script once to create the first SUPER_ADMIN account.

Usage:
    python create_super_admin.py --email admin@example.com --password YourSecurePassword123!
"""

import asyncio
import argparse
import bcrypt
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
from app.utils.security import encrypt_data

settings = get_settings()


async def create_super_admin(email: str, password: str, name: str = "Super Administrator"):
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]

    # Check if already exists
    existing = await db["users"].find_one({"email": email})
    if existing:
        if existing.get("role") == "SUPER_ADMIN":
            print(f"✅ Super Admin already exists: {email}")
        else:
            # Promote existing user
            await db["users"].update_one(
                {"_id": existing["_id"]},
                {"$set": {"role": "SUPER_ADMIN", "updatedAt": datetime.now(timezone.utc)}}
            )
            print(f"✅ Promoted existing user to SUPER_ADMIN: {email}")
        client.close()
        return

    # Hash password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    now = datetime.now(timezone.utc)
    doc = {
        "email":        email,
        "name":         encrypt_data(name),
        "passwordHash": hashed,
        "role":         "SUPER_ADMIN",
        "emailVerified": now,
        "createdAt":    now,
        "updatedAt":    now,
        "createdBy":    "SYSTEM_INIT",
    }
    result = await db["users"].insert_one(doc)
    print(f"✅ Super Admin created!")
    print(f"   ID:    {result.inserted_id}")
    print(f"   Email: {email}")
    print(f"   Role:  SUPER_ADMIN")
    print()
    print("🔐 Login at: /super-admin/login")
    client.close()


def main():
    parser = argparse.ArgumentParser(description="Create a Super Admin user account")
    parser.add_argument("--email",    required=True,  help="Super Admin email address")
    parser.add_argument("--password", required=True,  help="Super Admin password (min 12 chars recommended)")
    parser.add_argument("--name",     default="Super Administrator", help="Display name")
    args = parser.parse_args()

    if len(args.password) < 8:
        print("❌ Password must be at least 8 characters.")
        return

    asyncio.run(create_super_admin(args.email, args.password, args.name))


if __name__ == "__main__":
    main()
