from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.database import get_db
from app.models import ParticipantOut, ScreenerSubmit, ScreenerOut
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/participants", tags=["Participants"])


def _map_participant(p: dict, user: dict = None) -> ParticipantOut:
    out = ParticipantOut(
        id=str(p["_id"]),
        userId=p["userId"],
        studyId=p.get("studyId"),
        status=p.get("status", "LEAD"),
        phone=p.get("phone"),
        timezone=p.get("timezone", "UTC"),
        notes=p.get("notes"),
    )
    if user:
        out.name = user.get("name")
        out.email = user.get("email")
    return out


# ─── Admin: List All ─────────────────────────────────────────────────────────

@router.get("/", response_model=List[ParticipantOut])
async def list_participants(
    study_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: list all participants, optionally filtered."""
    query = {}
    if study_id:
        query["studyId"] = study_id
    if status:
        query["status"] = status

    result = []
    async for p in db["participants"].find(query).sort("createdAt", -1).limit(100):
        user = await db["users"].find_one({"_id": ObjectId(p["userId"])})
        result.append(_map_participant(p, user))
    return result


# ─── Admin: Single Participant ────────────────────────────────────────────────

@router.get("/{participant_id}", response_model=ParticipantOut)
async def get_participant(
    participant_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    p = await db["participants"].find_one({"_id": ObjectId(participant_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    user = await db["users"].find_one({"_id": ObjectId(p["userId"])})
    return _map_participant(p, user)


# ─── Admin: Update Status ────────────────────────────────────────────────────

@router.patch("/{participant_id}/status")
async def update_participant_status(
    participant_id: str,
    body: dict,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: Update a participant's status (e.g., LEAD → ENROLLED)."""
    new_status = body.get("status")
    allowed = ["LEAD", "SCREENED", "CONSENTED", "ENROLLED", "ACTIVE", "COMPLETED", "WITHDRAWN"]
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {allowed}")

    await db["participants"].update_one(
        {"_id": ObjectId(participant_id)},
        {"$set": {"status": new_status, "updatedAt": datetime.now(timezone.utc)}}
    )
    return {"message": f"Status updated to {new_status}"}


# ─── Screener Submission ──────────────────────────────────────────────────────

@router.post("/screener", response_model=ScreenerOut, status_code=status.HTTP_201_CREATED)
async def submit_screener(
    body: ScreenerSubmit,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant submits their eligibility screener answers."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="No participant profile for this user.")

    # Simple eligibility logic (customize per study)
    responses = body.responses
    is_eligible = (
        int(responses.get("age", 0)) >= 18 and
        responses.get("smoker", "yes") == "no"
    )

    now = datetime.now(timezone.utc)
    screener_doc = {
        "participantId": str(participant["_id"]),
        "studyId": body.studyId,
        "responses": responses,
        "isEligible": is_eligible,
        "completedAt": now,
    }
    result = await db["screenerResponses"].insert_one(screener_doc)

    # Update participant status
    new_status = "SCREENED" if is_eligible else "LEAD"
    await db["participants"].update_one(
        {"_id": participant["_id"]},
        {"$set": {"status": new_status, "studyId": body.studyId, "updatedAt": now}}
    )

    return ScreenerOut(
        id=str(result.inserted_id),
        participantId=str(participant["_id"]),
        isEligible=is_eligible,
        completedAt=now,
    )


# ─── My Profile (Participant self) ───────────────────────────────────────────

@router.get("/me/profile", response_model=ParticipantOut)
async def my_profile(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Participant: view own profile."""
    p = await db["participants"].find_one({"userId": current_user.user_id})
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
    return _map_participant(p, user)
