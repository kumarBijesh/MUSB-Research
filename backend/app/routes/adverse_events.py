from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
import logging

from app.database import get_db
from app.models import AdverseEventCreate, AdverseEventOut
from app.auth import get_current_user, require_admin
from app.utils.security import encrypt_data, decrypt_data
from app.utils.email import send_email_notification

logger = logging.getLogger(__name__)

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

    # Life-threatening events: Notify coordinator immediately
    if body.severity == "LIFE_THREATENING":
        try:
            # Get study info and coordinator
            study_id = participant.get("studyId")
            if study_id:
                # Try to find study by ID or slug
                if ObjectId.is_valid(study_id):
                    study = await db["studies"].find_one({"_id": ObjectId(study_id)})
                else:
                    study = await db["studies"].find_one({"slug": study_id})

                if study:
                    coordinator_id = study.get("coordinatorId")
                    if coordinator_id and ObjectId.is_valid(coordinator_id):
                        coordinator = await db["users"].find_one({"_id": ObjectId(coordinator_id)})
                        if coordinator and coordinator.get("email"):
                            # Send emergency notification to coordinator
                            subject = "🚨 CRITICAL: Life-Threatening Adverse Event Reported"
                            email_body = f"""
                            URGENT SAFETY ALERT

                            A LIFE-THREATENING adverse event has been reported in the {study.get('title', 'Unknown')} study.

                            Participant ID: {str(participant['_id'])}
                            Severity: LIFE-THREATENING
                            Reported At: {now.isoformat()}

                            EVENT DESCRIPTION:
                            [Details have been logged in the system]

                            ACTION REQUIRED:
                            Log in immediately to review the full report and take necessary action.

                            This is an automated urgent notification. Do not reply to this email.

                            - MUSB Research Safety System
                            """
                            await send_email_notification(
                                coordinator.get("email"),
                                subject,
                                email_body
                            )
                            logger.warning(f"Life-threatening AE alert sent to coordinator for participant {str(participant['_id'])}")
        except Exception as e:
            logger.error(f"Failed to send life-threatening AE notification: {str(e)}", exc_info=True)
            # Don't fail the API request if notification fails, but log the error

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
