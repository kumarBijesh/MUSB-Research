from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.auth import require_admin, require_coordinator_or_admin
from app.utils.security import decrypt_data

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(
    current_user=Depends(require_coordinator_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get aggregated statistics for the coordinator console.
    """
    total_leads = await db["participants"].count_documents({})
    screened = await db["participants"].count_documents({"status": "SCREENED"})
    consented = await db["participants"].count_documents({"status": "CONSENTED"})
    enrolled = await db["participants"].count_documents({"status": "ENROLLED"})
    active = await db["participants"].count_documents({"status": "ACTIVE"})
    
    # Calculate global compliance
    completed = await db["taskInstances"].count_documents({"status": "COMPLETED"})
    total_tasks = await db["taskInstances"].count_documents({})
    compliance_rate = round((completed / max(total_tasks, 1)) * 100, 1) if total_tasks > 0 else 0
    
    # Get open adverse events
    open_aes = await db["adverseEvents"].count_documents({"status": {"$ne": "Resolved"}})
    
    return {
        "totalLeads": total_leads,
        "screened": screened,
        "consented": consented,
        "enrolled": enrolled,
        "activeParticipants": active + enrolled,
        "openAEs": open_aes,
        "complianceRate": compliance_rate
    }

@router.get("/recruitment-funnel")
async def get_recruitment_funnel(
    current_user=Depends(require_coordinator_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get data for the recruitment funnel chart.
    """
    leads = await db["participants"].count_documents({})
    screened = await db["participants"].count_documents({"status": {"$in": ["SCREENED", "CONSENTED", "ENROLLED", "ACTIVE", "COMPLETED"]}})
    consented = await db["participants"].count_documents({"status": {"$in": ["CONSENTED", "ENROLLED", "ACTIVE", "COMPLETED"]}})
    enrolled = await db["participants"].count_documents({"status": {"$in": ["ENROLLED", "ACTIVE", "COMPLETED"]}})
    
    return [
        {"label": "Started Inquiry", "value": leads, "color": "bg-cyan-500", "width": "100%"},
        {"label": "Completed Screener", "value": screened, "color": "bg-cyan-600", "width": f"{int((screened/max(leads,1))*100)}%"},
        {"label": "Signed Consent", "value": consented, "color": "bg-cyan-700", "width": f"{int((consented/max(leads,1))*100)}%"},
        {"label": "Finalized Enrollment", "value": enrolled, "color": "bg-emerald-500", "width": f"{int((enrolled/max(leads,1))*100)}%"},
    ]

@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    current_user=Depends(require_coordinator_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get a list of all users for team management.
    """
    query = {}
    if role:
        query["role"] = role

    users = []
    async for u in db["users"].find(query).sort("createdAt", -1).limit(100):
        users.append({
            "id": str(u["_id"]),
            "name": decrypt_data(u.get("name")),
            "email": u["email"],
            "role": u.get("role", "PARTICIPANT"),
            "createdAt": u["createdAt"]
        })
    return users

@router.post("/studies/{study_id}/approve")
async def approve_study(
    study_id: str,
    current_user=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Approve a study that is currently UNDER_REVIEW.
    Sets status to ACTIVE.
    """
    # Search by ID or Slug
    study = None
    try:
        study = await db["studies"].find_one({"_id": ObjectId(study_id)})
    except Exception:
        study = await db["studies"].find_one({"slug": study_id})

    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    await db["studies"].update_one(
        {"_id": study["_id"]},
        {"$set": {
            "status": "ACTIVE",
            "updatedAt": datetime.now(timezone.utc),
            "approvedAt": datetime.now(timezone.utc),
            "approvedBy": current_user.user_id
        }}
    )
    
    return {"status": "success", "message": "Study approved and is now ACTIVE"}


# ─── Admin: Invite Staff ──────────────────────────────────────────────────────

from pydantic import BaseModel
from app.utils.security import encrypt_data as _enc
from app.auth import get_password_hash as _hash_pw

class InviteBody(BaseModel):
    email: str
    name: str = ""
    role: str = "COORDINATOR"

@router.post("/invite")
async def invite_staff(
    body: InviteBody,
    current_user=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin: create a placeholder staff account."""
    existing = await db["users"].find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists.")

    import secrets
    temp_password = secrets.token_urlsafe(12)
    # Use bcrypt (same as the login verify_password) so the invited user can actually log in
    hashed = _hash_pw(temp_password)

    now = datetime.now(timezone.utc)
    doc = {
        "email": body.email,
        "name": _enc(body.name) if body.name else None,
        "role": body.role,
        "passwordHash": hashed,
        "mustChangePassword": True,
        "invitedBy": current_user.user_id,
        "createdAt": now,
        "updatedAt": now,
    }
    await db["users"].insert_one(doc)
    return {"message": f"Staff account created for {body.email}", "tempPassword": temp_password}


# ─── Admin: Save Settings ─────────────────────────────────────────────────────

@router.post("/settings")
async def save_settings(
    body: dict,
    current_user=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin: persist global system configuration settings."""
    await db["settings"].update_one(
        {"_id": "global"},
        {"$set": {
            "updatedAt": datetime.now(timezone.utc),
            "updatedBy": current_user.user_id,
            **body,
        }},
        upsert=True,
    )
    return {"message": "Settings saved successfully"}
