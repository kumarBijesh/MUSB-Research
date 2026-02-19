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
        title=doc["title"],
        description=doc["description"],
        condition=doc.get("condition"),
        location=doc.get("location"),
        compensation=doc.get("compensation"),
        status=doc.get("status", "DRAFT"),
        createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
    )


@router.get("/", response_model=List[StudyOut])
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
        studies.append(_map_study(doc))
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
