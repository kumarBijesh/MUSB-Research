from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

from app.database import get_db
from app.models import UserCreate, UserOut, Token
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db=Depends(get_db)):
    """Register a new participant account."""
    # Check duplicate email
    existing = await db["users"].find_one({"email": user_in.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": user_in.name,
        "email": user_in.email,
        "passwordHash": get_password_hash(user_in.password),
        "role": "PARTICIPANT",
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db["users"].insert_one(user_doc)
    created = await db["users"].find_one({"_id": result.inserted_id})

    # Auto-create participant profile
    await db["participants"].insert_one({
        "userId": str(result.inserted_id),
        "status": "LEAD",
        "timezone": "UTC",
        "createdAt": now,
        "updatedAt": now,
    })

    return UserOut(
        id=str(created["_id"]),
        name=created.get("name"),
        email=created["email"],
        role=created["role"],
        createdAt=created["createdAt"],
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    """Login with email and password, returns a JWT access token."""
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
    })
    return Token(access_token=token, token_type="bearer", role=user["role"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get the currently authenticated user's profile."""
    user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
        id=str(user["_id"]),
        name=user.get("name"),
        email=user["email"],
        role=user["role"],
        createdAt=user["createdAt"],
    )


# ─── Google OAuth Upsert ─────────────────────────────────────────────────────

class GoogleUpsertRequest(BaseModel):
    email: str
    name: Optional[str] = None
    googleId: Optional[str] = None
    image: Optional[str] = None


class GoogleUpsertResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str
    role: str


@router.post("/google-upsert", response_model=GoogleUpsertResponse)
async def google_upsert(body: GoogleUpsertRequest, db=Depends(get_db)):
    """
    Called by NextAuth after a successful Google sign-in.
    Finds an existing user by email or creates a new PARTICIPANT account.
    Returns the user's id and role so NextAuth can populate the session.
    """
    now = datetime.now(timezone.utc)
    user = await db["users"].find_one({"email": body.email})

    if not user:
        # First-time Google login — create a new user
        user_doc = {
            "name": body.name,
            "email": body.email,
            "googleId": body.googleId,
            "image": body.image,
            "role": "PARTICIPANT",
            "passwordHash": None,
            "emailVerified": now,
            "createdAt": now,
            "updatedAt": now,
        }
        result = await db["users"].insert_one(user_doc)
        user = await db["users"].find_one({"_id": result.inserted_id})

        # Auto-create participant profile
        await db["participants"].insert_one({
            "userId": str(user["_id"]),
            "status": "LEAD",
            "timezone": "UTC",
            "createdAt": now,
            "updatedAt": now,
        })
    else:
        # Update Google metadata on repeat logins
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {
                "googleId": body.googleId,
                "image": body.image,
                "updatedAt": now,
            }}
        )

    return GoogleUpsertResponse(
        id=str(user["_id"]),
        name=user.get("name"),
        email=user["email"],
        role=user.get("role", "PARTICIPANT"),
    )
