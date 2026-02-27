from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database import get_db
from app.models import AdverseEventCreate, AdverseEventOut
from app.auth import get_current_user, require_admin
from app.utils.security import encrypt_data, decrypt_data

router = APIRouter(prefix="/api/adverse-events", tags=["Safety / Adverse Events"])


def _map_ae(doc: dict) -> AdverseEventOut:
    return AdverseEventOut(
        id=str(doc["_id"]),
        participantId=doc["participantId"],
        description=decrypt_data(doc["description"]),
        severity=doc["severity"],
        onsetDate=doc["onsetDate"],
        actionTaken=decrypt_data(doc.get("actionTaken")),
        reportedAt=doc["reportedAt"],
        status=doc.get("status", "Under Review"),
    )


# ─── Participant: Report AE ───────────────────────────────────────────────────

@router.post("/", response_model=AdverseEventOut, status_code=status.HTTP_201_CREATED)
async def report_ae(
    body: AdverseEventCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant: report an adverse event or symptom."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    now = datetime.now(timezone.utc)
    doc = {
        "participantId": str(participant["_id"]),
        "description": encrypt_data(body.description),
        "severity": body.severity,
        "onsetDate": body.onsetDate,
        "actionTaken": encrypt_data(body.actionTaken),
        "reportedAt": now,
        "status": "Under Review",
        # Auto-escalate life-threatening events
        "escalated": body.severity == "LIFE_THREATENING",
    }

    result = await db["adverseEvents"].insert_one(doc)

    # TODO: If severity == LIFE_THREATENING, trigger notification to coordinator
    if body.severity == "LIFE_THREATENING":
        print(f"🚨 CRITICAL AE reported by participant {str(participant['_id'])} — escalating!")

    created = await db["adverseEvents"].find_one({"_id": result.inserted_id})
    return _map_ae(created)


# ─── Admin: List All AEs ─────────────────────────────────────────────────────

@router.get("/", response_model=List[AdverseEventOut])
async def list_aes(
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: view all adverse events across the platform."""
    result = []
    async for doc in db["adverseEvents"].find().sort("reportedAt", -1).limit(200):
        result.append(_map_ae(doc))
    return result


# ─── Admin: List All AEs (alias) ─────────────────────────────────────────────

@router.get("/all", response_model=List[AdverseEventOut])
async def list_all_aes(
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: alias endpoint for /all path used by the frontend."""
    result = []
    async for doc in db["adverseEvents"].find().sort("reportedAt", -1).limit(200):
        result.append(_map_ae(doc))
    return result



# ─── Admin: Update AE Status ─────────────────────────────────────────────────

@router.patch("/{ae_id}/status")
async def update_ae_status(
    ae_id: str,
    body: dict,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: update the review status of an adverse event."""
    new_status = body.get("status")
    allowed = ["Under Review", "Resolved", "Escalated", "Closed"]
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Allowed statuses: {allowed}")

    await db["adverseEvents"].update_one(
        {"_id": ObjectId(ae_id)},
        {"$set": {"status": new_status, "updatedAt": datetime.now(timezone.utc)}}
    )
    return {"message": f"AE status updated to {new_status}"}


# ─── Admin: Simple PATCH /{ae_id} for status update ──────────────────────────

@router.patch("/{ae_id}")
async def update_ae(
    ae_id: str,
    body: dict,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: update AE fields (status etc.) via simple PATCH body."""
    update_fields: dict = {"updatedAt": datetime.now(timezone.utc)}
    if "status" in body:
        allowed = ["Under Review", "RESOLVED", "Resolved", "PENDING", "Escalated", "Closed"]
        if body["status"] not in allowed:
            raise HTTPException(status_code=400, detail=f"Allowed statuses: {allowed}")
        update_fields["status"] = body["status"]
    if "actionTaken" in body:
        update_fields["actionTaken"] = encrypt_data(body["actionTaken"])
    await db["adverseEvents"].update_one(
        {"_id": ObjectId(ae_id)}, {"$set": update_fields}
    )
    return {"message": "AE updated"}


# ─── Participant: My AEs ──────────────────────────────────────────────────────

@router.get("/me", response_model=List[AdverseEventOut])
async def my_aes(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Participant: view own reported AEs."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    result = []
    async for doc in db["adverseEvents"].find({"participantId": str(participant["_id"])}).sort("reportedAt", -1):
        result.append(_map_ae(doc))
    return result
