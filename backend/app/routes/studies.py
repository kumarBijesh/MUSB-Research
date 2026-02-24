from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.database import get_db
from app.models import StudyCreate, StudyOut
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/studies", tags=["Studies"])


def _map_study(doc: dict) -> StudyOut:
    return StudyOut(
        id=str(doc["_id"]),
        title=doc.get("title", "Untitled Study"),
        slug=doc.get("slug", ""),
        description=doc.get("description", ""),
        condition=doc.get("condition"),
        location=doc.get("location"),
        locationType=doc.get("locationType", "Remote"),
        compensation=doc.get("compensation"),
        duration=doc.get("duration"),
        timeCommitment=doc.get("timeCommitment"),
        age=doc.get("age"),
        status=doc.get("status", "DRAFT"),
        overview=doc.get("overview"),
        timeline=doc.get("timeline") if isinstance(doc.get("timeline"), list) else [],
        kits=doc.get("kits"),
        safety=doc.get("safety"),
        designType=doc.get("designType", "Parallel"),
        arms=doc.get("arms") if isinstance(doc.get("arms"), list) else [],
        eligibilityRules=doc.get("eligibilityRules") if isinstance(doc.get("eligibilityRules"), list) else [],
        timepoints=doc.get("timepoints") if isinstance(doc.get("timepoints"), list) else [],
        randomizationEnabled=doc.get("randomizationEnabled", False),
        country=doc.get("country", "Global"),
        createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
    )


@router.get("", response_model=List[StudyOut])
async def list_studies(
    status: Optional[str] = Query(None, description="Filter by status"),
    condition: Optional[str] = Query(None),
    db=Depends(get_db)
):
    """Public endpoint: list all publicly visible studies."""
    query: dict = {"status": {"$in": ["RECRUITING", "ACTIVE"]}}
    if status:
        query["status"] = status
    if condition:
        query["condition"] = {"$regex": condition, "$options": "i"}

    cursor = db["studies"].find(query).sort("createdAt", -1).limit(50)
    studies = []
    async for doc in cursor:
        try:
            studies.append(_map_study(doc))
        except Exception as e:
            # Skip malformed documents — do NOT crash the whole list response
            print(f"Warning: Skipping study {doc.get('_id')} due to mapping error: {str(e)}")
            continue
    return studies


@router.get("/{study_id}", response_model=StudyOut)
async def get_study(study_id: str, db=Depends(get_db)):
    """Get a single study by ID or slug."""
    query = {"_id": ObjectId(study_id)} if ObjectId.is_valid(study_id) else {"slug": study_id}
    doc = await db["studies"].find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Study not found")
    return _map_study(doc)


@router.post("/", response_model=StudyOut, status_code=status.HTTP_201_CREATED)
async def create_study(
    study_in: StudyCreate,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin only: Create a new study."""
    now = datetime.now(timezone.utc)
    doc = study_in.model_dump()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    doc["createdBy"] = current_user.user_id
    result = await db["studies"].insert_one(doc)
    created = await db["studies"].find_one({"_id": result.inserted_id})
    return _map_study(created)


@router.patch("/{study_id}", response_model=StudyOut)
async def update_study(
    study_id: str,
    updates: dict,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin only: Update a study."""
    updates["updatedAt"] = datetime.now(timezone.utc)
    await db["studies"].update_one(
        {"_id": ObjectId(study_id)},
        {"$set": updates}
    )
    doc = await db["studies"].find_one({"_id": ObjectId(study_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Study not found")
    return _map_study(doc)


@router.delete("/{study_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study(
    study_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin only: Delete (close) a study."""
    await db["studies"].update_one(
        {"_id": ObjectId(study_id)},
        {"$set": {"status": "CLOSED", "updatedAt": datetime.now(timezone.utc)}}
    )
