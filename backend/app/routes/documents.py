from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/documents", tags=["Documents"])


class DocumentOut(BaseModel):
    id: str
    participantId: str
    uploadedBy: str
    filename: str
    url: str
    category: Optional[str] = None
    uploadedAt: datetime


class DocumentCreate(BaseModel):
    filename: str
    url: str
    category: Optional[str] = None  # "CONSENT", "LAB_RESULT", "PROTOCOL", "OTHER"


def _map_doc(doc: dict) -> DocumentOut:
    return DocumentOut(
        id=str(doc["_id"]),
        participantId=doc["participantId"],
        uploadedBy=doc.get("uploadedBy", ""),
        filename=doc["filename"],
        url=doc["url"],
        category=doc.get("category"),
        uploadedAt=doc["uploadedAt"],
    )


# ─── Participant: List My Documents ──────────────────────────────────────────

@router.get("/me", response_model=List[DocumentOut])
async def my_documents(
    category: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Participant: list all documents linked to my profile."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    query: dict = {"participantId": str(participant["_id"])}
    if category:
        query["category"] = category

    result = []
    async for doc in db["documents"].find(query).sort("uploadedAt", -1):
        result.append(_map_doc(doc))
    return result


# ─── Admin: Upload / Link a Document ─────────────────────────────────────────

@router.post("/{participant_id}", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    participant_id: str,
    body: DocumentCreate,
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    """Admin: attach a document to a participant's record."""
    participant = await db["participants"].find_one({"_id": ObjectId(participant_id)})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    now = datetime.now(timezone.utc)
    doc = {
        "participantId": participant_id,
        "uploadedBy": current_user.user_id,
        "filename": body.filename,
        "url": body.url,
        "category": body.category or "OTHER",
        "uploadedAt": now,
    }
    result = await db["documents"].insert_one(doc)
    created = await db["documents"].find_one({"_id": result.inserted_id})
    return _map_doc(created)


# ─── Admin: All Documents ─────────────────────────────────────────────────────

@router.get("/", response_model=List[DocumentOut])
async def list_all_documents(
    participant_id: Optional[str] = Query(None),
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    """Admin: list all documents, optionally filtered by participant."""
    query = {}
    if participant_id:
        query["participantId"] = participant_id

    result = []
    async for doc in db["documents"].find(query).sort("uploadedAt", -1).limit(200):
        result.append(_map_doc(doc))
    return result


# ─── Delete Document ──────────────────────────────────────────────────────────

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db),
):
    """Admin: remove a document record."""
    result = await db["documents"].delete_one({"_id": ObjectId(document_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
