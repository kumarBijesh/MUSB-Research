from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/sponsor", tags=["Sponsor"])


class SponsorStudyOut(BaseModel):
    id: str
    title: str
    status: str
    participantCount: int
    enrolledCount: int
    completedCount: int
    condition: Optional[str] = None
    createdAt: datetime


class SponsorStatsOut(BaseModel):
    totalStudies: int
    activeStudies: int
    totalParticipants: int
    enrolledParticipants: int
    completionRate: float


# ─── Sponsor: Dashboard Stats ─────────────────────────────────────────────────

@router.get("/stats", response_model=SponsorStatsOut)
async def sponsor_stats(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Sponsor: aggregate dashboard KPIs."""
    if current_user.role not in ("SPONSOR", "ADMIN", "COORDINATOR"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    total_studies = await db["studies"].count_documents({})
    active_studies = await db["studies"].count_documents({"status": {"$in": ["ACTIVE", "RECRUITING"]}})
    total_participants = await db["participants"].count_documents({})
    enrolled = await db["participants"].count_documents({"status": {"$in": ["ENROLLED", "ACTIVE", "COMPLETED"]}})
    completed = await db["participants"].count_documents({"status": "COMPLETED"})
    completion_rate = round((completed / total_participants * 100) if total_participants > 0 else 0, 1)

    return SponsorStatsOut(
        totalStudies=total_studies,
        activeStudies=active_studies,
        totalParticipants=total_participants,
        enrolledParticipants=enrolled,
        completionRate=completion_rate,
    )


# ─── Sponsor: Studies Overview ────────────────────────────────────────────────

@router.get("/studies", response_model=List[SponsorStudyOut])
async def sponsor_studies(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Sponsor: list all studies with participant counts."""
    if current_user.role not in ("SPONSOR", "ADMIN", "COORDINATOR"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    result = []
    async for study in db["studies"].find().sort("createdAt", -1).limit(50):
        study_id = str(study["_id"])
        total = await db["participants"].count_documents({"studyId": study_id})
        enrolled = await db["participants"].count_documents({
            "studyId": study_id,
            "status": {"$in": ["ENROLLED", "ACTIVE", "COMPLETED"]}
        })
        completed = await db["participants"].count_documents({
            "studyId": study_id,
            "status": "COMPLETED"
        })
        result.append(SponsorStudyOut(
            id=study_id,
            title=study["title"],
            status=study.get("status", "DRAFT"),
            participantCount=total,
            enrolledCount=enrolled,
            completedCount=completed,
            condition=study.get("condition"),
            createdAt=study.get("createdAt", datetime.now(timezone.utc)),
        ))
    return result
