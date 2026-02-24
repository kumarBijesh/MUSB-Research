from fastapi import APIRouter, Depends # type: ignore
from typing import Optional
from app.database import get_db # type: ignore
from app.auth import require_admin, require_coordinator_or_admin # type: ignore
from motor.motor_asyncio import AsyncIOMotorDatabase # type: ignore

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
    # In a real app, 'impressions' and 'clicks' would come from analytics.
    # Here we show the stage counts from our DB.
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
    from app.utils.security import decrypt_data # type: ignore
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
