from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.auth import get_current_user, require_admin
from app.utils.security import encrypt_data, decrypt_data
import json

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
    decrypted_data = {}
    raw_data = doc.get("data", "{}")
    if isinstance(raw_data, str):
        try:
            decrypted_data = json.loads(decrypt_data(raw_data))
        except Exception:
            decrypted_data = {}
    else:
        decrypted_data = raw_data

    return LogOut(
        id=str(doc["_id"]),
        participantId=doc["participantId"],
        type=doc["type"],
        data=decrypted_data,
        notes=decrypt_data(doc.get("notes")),
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
        "data": encrypt_data(json.dumps(body.data)),
        "notes": encrypt_data(body.notes),
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


# ─── Admin: All Logs (must be before /{participant_id} to avoid route conflict) ─
@router.get("/all", response_model=List[LogOut])
async def list_all_logs(
    type: Optional[str] = Query(None),
    limit: int = Query(200, le=500),
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    """Admin: view all data logs across the platform."""
    query = {}
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
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Admin/Coordinator: view all logs for a specific participant."""
    from bson import ObjectId

    # HIPAA: Verify coordinator can only access logs for participants from their assigned study
    if current_user.role == "COORDINATOR":
        # Find the participant first
        if ObjectId.is_valid(participant_id):
            participant = await db["participants"].find_one({"_id": ObjectId(participant_id)})
        else:
            participant = await db["participants"].find_one({"_id": participant_id})

        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")

        study_id = participant.get("studyId")
        if not study_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Check if coordinator is assigned to this study
        coordinator_user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
        assigned_studies = coordinator_user.get("assignedStudies", [])

        if study_id not in assigned_studies:
            raise HTTPException(status_code=403, detail="Access denied")

    query: dict = {"participantId": participant_id}
    if type:
        query["type"] = type

    result = []
    async for doc in db["dataLogs"].find(query).sort("loggedAt", -1).limit(200):
        result.append(_map_log(doc))
    return result
