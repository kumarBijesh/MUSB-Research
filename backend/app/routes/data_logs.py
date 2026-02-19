from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/logs", tags=["Data Logs"])


# ─── Models ───────────────────────────────────────────────────────────────────

class LogCreate(BaseModel):
    type: str                    # "SUPPLEMENT", "VITALS", "SYMPTOM", "SURVEY"
    data: dict[str, Any]         # Flexible payload: dose, bp, hr, etc.
    notes: Optional[str] = None
    loggedAt: Optional[datetime] = None


class LogOut(BaseModel):
    id: str
    participantId: str
    type: str
    data: dict[str, Any]
    notes: Optional[str] = None
    loggedAt: datetime


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _map_log(doc: dict) -> LogOut:
    return LogOut(
        id=str(doc["_id"]),
        participantId=doc["participantId"],
        type=doc["type"],
        data=doc.get("data", {}),
        notes=doc.get("notes"),
        loggedAt=doc["loggedAt"],
    )


# ─── Participant: Submit a Log Entry ─────────────────────────────────────────

@router.post("/", response_model=LogOut, status_code=status.HTTP_201_CREATED)
async def submit_log(
    body: LogCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Participant: submit a supplement dose, vitals reading, or symptom log."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    allowed_types = ["SUPPLEMENT", "VITALS", "SYMPTOM", "SURVEY", "MOOD", "SLEEP"]
    if body.type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Log type must be one of: {allowed_types}")

    now = datetime.now(timezone.utc)
    doc = {
        "participantId": str(participant["_id"]),
        "userId": current_user.user_id,
        "type": body.type,
        "data": body.data,
        "notes": body.notes,
        "loggedAt": body.loggedAt or now,
        "createdAt": now,
    }
    result = await db["dataLogs"].insert_one(doc)
    created = await db["dataLogs"].find_one({"_id": result.inserted_id})
    return _map_log(created)


# ─── Participant: My Logs ─────────────────────────────────────────────────────

@router.get("/me", response_model=List[LogOut])
async def my_logs(
    type: Optional[str] = Query(None, description="Filter by log type"),
    limit: int = Query(50, le=200),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Participant: retrieve own data logs."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    query: dict = {"participantId": str(participant["_id"])}
    if type:
        query["type"] = type

    result = []
    async for doc in db["dataLogs"].find(query).sort("loggedAt", -1).limit(limit):
        result.append(_map_log(doc))
    return result


# ─── Admin: All Logs for a Participant ───────────────────────────────────────

@router.get("/{participant_id}", response_model=List[LogOut])
async def participant_logs(
    participant_id: str,
    type: Optional[str] = Query(None),
    current_user=Depends(get_current_user),   # require_admin removed to allow data managers too
    db=Depends(get_db),
):
    """Admin/Coordinator: view all logs for a specific participant."""
    query: dict = {"participantId": participant_id}
    if type:
        query["type"] = type

    result = []
    async for doc in db["dataLogs"].find(query).sort("loggedAt", -1).limit(200):
        result.append(_map_log(doc))
    return result
