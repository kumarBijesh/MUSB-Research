from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

from app.database import get_db
from app.models import UserCreate, UserOut, Token, VerificationRequest, VerificationCheck, UpdatePassword, PasswordResetRequest
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_modules_for_role,
)
from app.config import get_settings
from app.routes.audit import log_audit_event
from app.utils.security import encrypt_data, decrypt_data
from app.utils.otp import generate_otp, verify_otp
from app.utils.email import send_email_notification

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(request: Request, user_in: UserCreate, db=Depends(get_db)):
    """Register a new participant account."""
    # Check duplicate email
    existing = await db["users"].find_one({"email": user_in.email})
    if existing:
        # HIPAA Audit: Log failed registration attempt
        await log_audit_event(
            db=db,
            user_id="SYSTEM",
            action="REGISTER_FAILED",
            resource="System:Auth",
            details=f"Registration failed: Email {user_in.email} already exists",
            request=request
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Section 5.4: Device fingerprinting / Duplicate prevention
    if user_in.deviceFingerprint:
        fp_exists = await db["users"].find_one({"deviceFingerprint": user_in.deviceFingerprint})
        if fp_exists:
             await log_audit_event(
                db=db,
                user_id="SYSTEM",
                action="REGISTER_REJECTED",
                resource="System:Auth",
                details=f"Registration rejected: Duplicate device fingerprint detected",
                request=request
            )
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate registration attempt detected from this device."
            )

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": encrypt_data(user_in.name),
        "email": user_in.email,
        "passwordHash": get_password_hash(user_in.password),
        "role": "PARTICIPANT",
        "deviceFingerprint": user_in.deviceFingerprint,
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

    # HIPAA Audit: Log successful registration
    await log_audit_event(
        db=db,
        user_id=str(created["_id"]),
        action="REGISTER",
        resource="System:Auth",
        details="New participant account created",
        request=request
    )

    return UserOut(
        id=str(created["_id"]),
        name=decrypt_data(created.get("name")),
        email=created["email"],
        role=created["role"],
        createdAt=created["createdAt"],
        deviceFingerprint=created.get("deviceFingerprint")
    )
@router.post("/login", response_model=Token)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
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
        "modules": get_modules_for_role(user["role"]),
    })
    
    # HIPAA Audit: Log successful login
    await log_audit_event(
        db=db,
        user_id=str(user["_id"]),
        action="LOGIN",
        resource="System:Auth",
        details="User logged in via Password",
        request=request
    )

    return Token(access_token=token, token_type="bearer", role=user["role"])


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get the currently authenticated user's profile."""
    user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
        id=str(user["_id"]),
        name=decrypt_data(user.get("name")),
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
    access_token: Optional[str] = None


@router.post("/google-upsert", response_model=GoogleUpsertResponse)
async def google_upsert(request: Request, body: GoogleUpsertRequest, db=Depends(get_db)):
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
            "name": encrypt_data(body.name),
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

    
    # HIPAA Audit: Log Google Login
    await log_audit_event(
        db=db,
        user_id=str(user["_id"]),
        action="LOGIN",
        resource="System:Auth",
        details="User logged in via Google OAuth",
        request=request
    )

    # Generate access token so NextAuth can use it for subsequent API calls
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "PARTICIPANT"),
            "modules": get_modules_for_role(user.get("role", "PARTICIPANT")),
        }
    )

    return GoogleUpsertResponse(
        id=str(user["_id"]),
        name=decrypt_data(user.get("name")),
        email=user["email"],
        role=user.get("role", "PARTICIPANT"),
        access_token=access_token
    )

# ─── Identity Verification (OTP) ──────────────────────────────────────────────

@router.post("/verify/send")
async def send_verification(request: Request, body: VerificationRequest, db=Depends(get_db)):
    """Send a verification code via Email or Phone."""
    
    # Check user existence based on action purpose
    user = await db["users"].find_one({"email": body.identifier})
    
    if body.purpose == "LOGIN":
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Account not found. Please sign up or sign in with Google."
            )
    elif body.purpose == "REGISTER":
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Account already exists. Please sign in instead."
            )
    elif body.purpose == "RESET":
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with that email address."
            )

    otp = generate_otp(body.identifier, body.purpose)
    
    channel = "Phone" if body.type == "PHONE" else "Email"
    if channel == "Email":
        subject = f"Your MUSB {body.purpose.title()} Verification Code"
        email_body = f"Hello,\n\nYour 6-digit verification code for {body.purpose.lower()} is: {otp}\n\nPlease enter this code to securely proceed. This code will expire in 10 minutes.\n\nBest,\nThe MUSB Research Team"
        await send_email_notification(body.identifier, subject, email_body)
    else:
        print(f"DEBUG: Sending OTP {otp} to {body.identifier} via {channel} for {body.purpose}")
    
    await log_audit_event(
        db=db,
        user_id="SYSTEM",
        action="VERIFY_SEND",
        resource=f"Identity:{body.identifier}",
        details=f"OTP sent via {channel} (Purpose: {body.purpose})",
        request=request
    )
    
    return {"message": f"Verification code sent to {body.identifier}"}


@router.post("/verify/check")
async def check_verification(request: Request, body: VerificationCheck, db=Depends(get_db)):
    """Check a verification code and update user/participant status."""
    is_valid = verify_otp(body.identifier, body.code, body.purpose)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")

    now = datetime.now(timezone.utc)
    
    # Update verification status in DB if user/participant exists
    user = await db["users"].find_one({"email": body.identifier})
    if user:
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"emailVerified": now, "updatedAt": now}}
        )
    
    # Check if it's a phone number (identifier doesn't have @)
    if "@" not in body.identifier:
        participant = await db["participants"].find_one({"phone": encrypt_data(body.identifier)})
        if participant:
            await db["participants"].update_one(
                {"_id": participant["_id"]},
                {"$set": {"phoneVerified": now, "updatedAt": now}}
            )

    await log_audit_event(
        db=db,
        user_id="SYSTEM",
        action="VERIFY_SUCCESS",
        resource=f"Identity:{body.identifier}",
        details="Identity verified successfully",
        request=request
    )

    return {"message": "Identity verified successfully"}


@router.post("/update-password")
async def update_password(
    request: Request,
    body: UpdatePassword,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Securely update the user's password with current password verification and optional OTP."""
    user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Block OAuth users from direct password manipulation
    if not user.get("passwordHash"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accounts managed via Google cannot update passwords directly. Please use Google Account settings."
        )

    # Verify Current Password
    if not verify_password(body.currentPassword, user["passwordHash"]):
         raise HTTPException(
             status_code=status.HTTP_401_UNAUTHORIZED, 
             detail="Current password incorrect."
         )

    # Optional OTP Verification for high-security action
    if body.code:
        if not verify_otp(user["email"], body.code, "LOGIN"):
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST, 
                 detail="Invalid or expired verification code."
             )

    # Update Password
    new_hash = get_password_hash(body.newPassword)
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {
            "passwordHash": new_hash, 
            "updatedAt": datetime.now(timezone.utc),
            "emailVerified": datetime.now(timezone.utc) # Mark verified as side effect of successful path
        }}
    )

    # HIPAA Audit
    await log_audit_event(
        db=db,
        user_id=str(user["_id"]),
        action="PASSWORD_UPDATE",
        resource="User:Credentials",
        details="User successfully updated account password securely",
        request=request
    )

    return {"message": "Password updated successfully."}


@router.post("/reset-password")
async def reset_password(request: Request, body: PasswordResetRequest, db=Depends(get_db)):
    """Reset a forgotten password using an OTP sent to email."""
    # 1. Verify the OTP
    is_valid = verify_otp(body.email, body.code, "RESET")
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    # 2. Find the user
    user = await db["users"].find_one({"email": body.email})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    # 3. Hash new password and update
    new_hash = get_password_hash(body.newPassword)
    now = datetime.now(timezone.utc)
    
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"passwordHash": new_hash, "updatedAt": now}}
    )

    # 4. Audit Log
    await log_audit_event(
        db=db,
        user_id=str(user["_id"]),
        action="RESET_PASSWORD",
        resource="System:Auth",
        details="User successfully reset forgotten password via OTP",
        request=request
    )

    return {"message": "Password reset successfully. You can now sign in."}


@router.get("/public-key")
async def get_public_key():
    """Returns the RS256 public key so external services (e.g. Django SSO) can verify JWTs."""
    settings = get_settings()
    return {"public_key": settings.PUBLIC_KEY}
