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


# ─── Sponsor: Launch New Study ────────────────────────────────────────────────

from app.models import StudyCreate, StudyOut
import re

@router.post("/studies", response_model=StudyOut)
async def launch_study(
    study_in: StudyCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Sponsor: create or launch a new study."""
    if current_user.role not in ("SPONSOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only sponsors or admins can launch studies")

    # Generate slug from title if it looks like a placeholder
    slug = study_in.slug
    if not slug or slug == "auto":
        slug = re.sub(r'[^a-zA-Z0-9]', '-', study_in.title.lower()).strip('-')
        # Check uniqueness
        existing = await db["studies"].find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{int(datetime.now().timestamp())}"

    doc = study_in.model_dump()
    doc["slug"] = slug
    doc["sponsorId"] = current_user.user_id
    doc["createdAt"] = datetime.now(timezone.utc)
    doc["updatedAt"] = datetime.now(timezone.utc)

    # If it's being "Published", set status to ACTIVE
    if doc.get("status") == "PUBLISHED":
        doc["status"] = "ACTIVE"

    result = await db["studies"].insert_one(doc)
    created = await db["studies"].find_one({"_id": result.inserted_id})
    
    # Map _id to id for response
    created["id"] = str(created.pop("_id"))
    return created


@router.get("/studies/{slug}", response_model=StudyOut)
async def get_study_details(
    slug: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Sponsor: get full details of a study for management."""
    if current_user.role not in ("SPONSOR", "ADMIN", "COORDINATOR"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    study = await db["studies"].find_one({"slug": slug})
    if not study:
        # Fallback to ID
        from bson import ObjectId
        try:
            study = await db["studies"].find_one({"_id": ObjectId(slug)})
        except:
            study = None

    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    study["id"] = str(study.pop("_id"))
    return study


@router.patch("/studies/{slug}", response_model=StudyOut)
async def update_study(
    slug: str,
    study_update: dict,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Sponsor: update study parameters."""
    if current_user.role not in ("SPONSOR", "ADMIN"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Find study
    study = await db["studies"].find_one({"slug": slug})
    if not study:
        from bson import ObjectId
        try:
            study = await db["studies"].find_one({"_id": ObjectId(slug)})
        except:
            study = None
    
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    # Ensure it's THEIR study or they are admin
    if current_user.role != "ADMIN" and study.get("sponsorId") != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only manage your own studies")

    # Filter out immutable fields
    update_data = {k: v for k, v in study_update.items() if k not in ("id", "_id", "createdAt", "sponsorId")}
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    await db["studies"].update_one({"_id": study["_id"]}, {"$set": update_data})
    
    updated = await db["studies"].find_one({"_id": study["_id"]})
    updated["id"] = str(updated.pop("_id"))
    return updated
