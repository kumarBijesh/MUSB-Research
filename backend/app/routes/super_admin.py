"""
Super Admin Routes
==================
Full system-level control: users, studies, admins, sponsors, audit logs,
system settings, and platform-wide statistics.

Only users with role=SUPER_ADMIN may access these endpoints.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.auth import require_super_admin, get_password_hash
from app.utils.security import encrypt_data, decrypt_data

router = APIRouter(prefix="/api/super-admin", tags=["Super Admin"])


# ─── helpers ──────────────────────────────────────────────────────────────────

def _safe_id(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def get_platform_stats(
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Full platform-wide statistics visible only to Super Admin."""
    total_users      = await db["users"].count_documents({})
    total_admins     = await db["users"].count_documents({"role": {"$in": ["ADMIN", "SUPER_ADMIN"]}})
    total_sponsors   = await db["users"].count_documents({"role": "SPONSOR"})
    total_studies    = await db["studies"].count_documents({})
    active_studies   = await db["studies"].count_documents({"status": "ACTIVE"})
    total_parts      = await db["participants"].count_documents({})
    active_parts     = await db["participants"].count_documents({"status": {"$in": ["ACTIVE", "ENROLLED"]}})
    open_aes         = await db["adverseEvents"].count_documents({"status": {"$ne": "Resolved"}})
    collection_names = await db.list_collection_names()
    total_leads      = await db["leads"].count_documents({}) if "leads" in collection_names else 0
    audit_today      = await db["audit_logs"].count_documents({
        "timestamp": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)}
    })

    return {
        "totalUsers":       total_users,
        "totalAdmins":      total_admins,
        "totalSponsors":    total_sponsors,
        "totalStudies":     total_studies,
        "activeStudies":    active_studies,
        "totalParticipants": total_parts,
        "activeParticipants": active_parts,
        "openAdverseEvents": open_aes,
        "sponsorLeads":     total_leads,
        "auditEventsToday": audit_today,
    }


# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users")
async def list_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List every user in the platform with optional role/search filter."""
    query: dict = {}
    if role:
        query["role"] = role
    if search:
        query["email"] = {"$regex": search, "$options": "i"}

    users = []
    async for u in db["users"].find(query).sort("createdAt", -1).skip(skip).limit(limit):
        users.append({
            "id":        str(u["_id"]),
            "name":      decrypt_data(u.get("name")) or "",
            "email":     u.get("email", ""),
            "role":      u.get("role", "PARTICIPANT"),
            "createdAt": u.get("createdAt"),
            "updatedAt": u.get("updatedAt"),
            "emailVerified": u.get("emailVerified"),
            "mustChangePassword": u.get("mustChangePassword", False),
        })
    total = await db["users"].count_documents(query)
    return {"users": users, "total": total}


class CreateUserBody(BaseModel):
    name: str
    email: str
    password: str
    role: str = "COORDINATOR"


@router.post("/users")
async def create_user(
    body: CreateUserBody,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create any user account (Admin, Coordinator, Sponsor, etc.)."""
    if await db["users"].find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="Email already in use.")

    now = datetime.now(timezone.utc)
    doc = {
        "name":         encrypt_data(body.name),
        "email":        body.email,
        "passwordHash": get_password_hash(body.password),
        "role":         body.role,
        "createdAt":    now,
        "updatedAt":    now,
        "createdBy":    current_user.user_id,
    }
    result = await db["users"].insert_one(doc)
    return {"id": str(result.inserted_id), "message": "User created successfully."}


class UpdateUserBody(BaseModel):
    name:     Optional[str] = None
    role:     Optional[str] = None
    password: Optional[str] = None
    suspended: Optional[bool] = None


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    body: UpdateUserBody,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update any user's name, role, password, or suspension status."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    updates: dict = {"updatedAt": datetime.now(timezone.utc)}
    if body.name is not None:
        updates["name"] = encrypt_data(body.name)
    if body.role is not None:
        updates["role"] = body.role
    if body.password is not None:
        updates["passwordHash"] = get_password_hash(body.password)
    if body.suspended is not None:
        updates["suspended"] = body.suspended

    result = await db["users"].update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User updated successfully."}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Permanently delete a user account."""
    # Prevent self-deletion
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID.")

    result = await db["users"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted."}


# ─── Study Management ─────────────────────────────────────────────────────────

@router.get("/studies")
async def list_all_studies(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all studies with optional status filter."""
    query: dict = {}
    if status:
        query["status"] = status

    studies = []
    async for s in db["studies"].find(query).sort("createdAt", -1).skip(skip).limit(limit):
        studies.append({
            "id":          str(s["_id"]),
            "title":       s.get("title", ""),
            "slug":        s.get("slug", ""),
            "status":      s.get("status", "DRAFT"),
            "condition":   s.get("condition", ""),
            "location":    s.get("location", ""),
            "createdAt":   s.get("createdAt"),
            "targetParticipants": s.get("targetParticipants", 0),
        })
    total = await db["studies"].count_documents(query)
    return {"studies": studies, "total": total}


class StudyStatusBody(BaseModel):
    status: str  # DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED


@router.patch("/studies/{study_id}/status")
async def update_study_status(
    study_id: str,
    body: StudyStatusBody,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Change a study's status (activate, pause, archive, etc.)."""
    try:
        oid = ObjectId(study_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid study ID.")

    result = await db["studies"].update_one(
        {"_id": oid},
        {"$set": {"status": body.status, "updatedAt": datetime.now(timezone.utc), "updatedBy": current_user.user_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Study not found.")
    return {"message": f"Study status updated to {body.status}."}


@router.delete("/studies/{study_id}")
async def delete_study(
    study_id: str,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Permanently delete a study and all its associated data."""
    try:
        oid = ObjectId(study_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid study ID.")

    study = await db["studies"].find_one({"_id": oid})
    if not study:
        raise HTTPException(status_code=404, detail="Study not found.")

    # Cascade delete associated data
    sid = str(oid)
    await db["participants"].delete_many({"studyId": sid})
    await db["taskInstances"].delete_many({"studyId": sid})
    await db["studies"].delete_one({"_id": oid})

    return {"message": "Study and associated data permanently deleted."}


# ─── Sponsor / Lead Management ────────────────────────────────────────────────

@router.get("/sponsors")
async def list_sponsors(
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all sponsor users."""
    sponsors = []
    async for u in db["users"].find({"role": "SPONSOR"}).sort("createdAt", -1):
        sponsors.append({
            "id":        str(u["_id"]),
            "name":      decrypt_data(u.get("name")) or "",
            "email":     u.get("email", ""),
            "createdAt": u.get("createdAt"),
        })
    return sponsors


@router.get("/sponsor-leads")
async def list_sponsor_leads(
    status: Optional[str] = None,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all sponsor inquiry leads."""
    query: dict = {}
    if status:
        query["status"] = status

    leads = []
    async for lead in db["leads"].find(query).sort("createdAt", -1).limit(100):
        leads.append({
            "id":           str(lead["_id"]),
            "companyName":  lead.get("companyName", ""),
            "contactEmail": lead.get("contactEmail", ""),
            "status":       lead.get("status", "NEW"),
            "studyType":    lead.get("studyType", ""),
            "createdAt":    lead.get("createdAt"),
        })
    return leads


# ─── Audit Logs ──────────────────────────────────────────────────────────────

@router.get("/audit-logs")
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Full audit log access for compliance monitoring."""
    query: dict = {}
    if action:
        query["action"] = action
    if user_id:
        query["userId"] = user_id

    logs = []
    async for log in db["audit_logs"].find(query).sort("timestamp", -1).skip(skip).limit(limit):
        logs.append({
            "id":        str(log["_id"]),
            "userId":    log.get("userId", ""),
            "action":    log.get("action", ""),
            "resource":  log.get("resource", ""),
            "details":   log.get("details", ""),
            "ipAddress": log.get("ipAddress", ""),
            "timestamp": log.get("timestamp"),
        })
    total = await db["audit_logs"].count_documents(query)
    return {"logs": logs, "total": total}


# ─── System Settings ─────────────────────────────────────────────────────────

@router.get("/settings")
async def get_system_settings(
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get global system configuration."""
    doc = await db["settings"].find_one({"_id": "global"})
    if doc:
        doc.pop("_id", None)
    return doc or {}


@router.post("/settings")
async def update_system_settings(
    body: dict,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update global system configuration."""
    body.pop("_id", None)
    await db["settings"].update_one(
        {"_id": "global"},
        {"$set": {
            **body,
            "updatedAt": datetime.now(timezone.utc),
            "updatedBy": current_user.user_id,
        }},
        upsert=True,
    )
    return {"message": "System settings updated successfully."}


# ─── Platform Announcements ──────────────────────────────────────────────────

class AnnouncementBody(BaseModel):
    title:   str
    message: str
    target:  str = "ALL"   # ALL, ADMIN, PARTICIPANT, SPONSOR
    type:    str = "INFO"   # INFO, WARNING, CRITICAL


@router.post("/announcements")
async def create_announcement(
    body: AnnouncementBody,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Broadcast a system-wide announcement."""
    doc = {
        "title":     body.title,
        "message":   body.message,
        "target":    body.target,
        "type":      body.type,
        "createdBy": current_user.user_id,
        "createdAt": datetime.now(timezone.utc),
        "active":    True,
    }
    result = await db["announcements"].insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Announcement created."}


@router.get("/announcements")
async def list_announcements(
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all platform announcements."""
    items = []
    async for a in db["announcements"].find().sort("createdAt", -1).limit(50):
        items.append({
            "id":        str(a["_id"]),
            "title":     a.get("title", ""),
            "message":   a.get("message", ""),
            "target":    a.get("target", "ALL"),
            "type":      a.get("type", "INFO"),
            "active":    a.get("active", True),
            "createdAt": a.get("createdAt"),
        })
    return items


@router.delete("/announcements/{ann_id}")
async def delete_announcement(
    ann_id: str,
    current_user=Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete an announcement."""
    try:
        oid = ObjectId(ann_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID.")
    result = await db["announcements"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    return {"message": "Announcement deleted."}
