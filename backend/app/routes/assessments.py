from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database import get_db
from app.models import (
    AssessmentCreate, AssessmentOut, 
    FormResponseCreate, FormResponseOut
)
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

def _map_assessment(doc: dict) -> AssessmentOut:
    return AssessmentOut(
        id=str(doc["_id"]),
        title=doc["title"],
        description=doc.get("description"),
        category=doc.get("category", "General"),
        fields=doc.get("fields", []),
        createdAt=doc.get("createdAt", datetime.now(timezone.utc))
    )

def _map_response(doc: dict) -> FormResponseOut:
    return FormResponseOut(
        id=str(doc["_id"]),
        assessmentId=doc["assessmentId"],
        participantId=doc["participantId"],
        studyId=doc["studyId"],
        responses=doc["responses"],
        status=doc.get("status", "COMPLETED"),
        submittedAt=doc.get("submittedAt", datetime.now(timezone.utc))
    )

# --- Assessment Templates ---

@router.get("", response_model=List[AssessmentOut])
async def list_assessments(db=Depends(get_db)):
    """List all available assessment templates."""
    cursor = db["assessments"].find().sort("createdAt", -1)
    return [_map_assessment(doc) async for doc in cursor]

@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_in: AssessmentCreate,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: Create a new assessment template."""
    doc = assessment_in.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc)
    result = await db["assessments"].insert_one(doc)
    created = await db["assessments"].find_one({"_id": result.inserted_id})
    return _map_assessment(created)

# --- Form Responses (must be BEFORE /{assessment_id} to avoid route conflict) ---

@router.post("/responses", response_model=FormResponseOut, status_code=status.HTTP_201_CREATED)
async def submit_response(
    response_in: FormResponseCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant: Submit answers for an assessment."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
         raise HTTPException(status_code=403, detail="Not a trial participant")

    doc = response_in.model_dump()
    doc["participantId"] = str(participant["_id"])
    doc["submittedAt"] = datetime.now(timezone.utc)
    
    result = await db["form_responses"].insert_one(doc)
    created = await db["form_responses"].find_one({"_id": result.inserted_id})
    return _map_response(created)

@router.get("/responses/{participant_id}", response_model=List[FormResponseOut])
async def get_participant_responses(
    participant_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all submissions for a specific participant (Admin or the participant themselves)."""
    participant = await db["participants"].find_one({"_id": ObjectId(participant_id)})
    if not participant:
         raise HTTPException(status_code=404, detail="Participant not found")
    
    if current_user.role != "ADMIN" and participant["userId"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    cursor = db["form_responses"].find({"participantId": participant_id}).sort("submittedAt", -1)
    return [_map_response(doc) async for doc in cursor]

# --- Single Assessment (must be LAST to avoid capturing 'responses' as an ID) ---

@router.get("/{assessment_id}", response_model=AssessmentOut)
async def get_assessment(assessment_id: str, db=Depends(get_db)):
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(status_code=400, detail="Invalid Assessment ID")
    doc = await db["assessments"].find_one({"_id": ObjectId(assessment_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return _map_assessment(doc)
