from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from bson import ObjectId
import json

from app.database import get_db
from app.models import ParticipantOut, ScreenerSubmit, ScreenerOut, ConsentSign, ConsentOut
from app.auth import get_current_user, require_admin, require_coordinator_or_admin
from app.utils.security import encrypt_data, decrypt_data
from app.utils.randomization import randomize_participant
from app.routes.audit import log_audit_event

router = APIRouter(prefix="/api/participants", tags=["Participants"])


async def _map_participant(p: dict, db, user: Optional[dict] = None) -> ParticipantOut:
    study_title = None
    coordinator_id = None
    coordinator_name = None
    
    if p.get("studyId"):
        study_id_str = p["studyId"]
        study = None
        if ObjectId.is_valid(study_id_str):
            study = await db["studies"].find_one({"_id": ObjectId(study_id_str)})
        if not study:
            study = await db["studies"].find_one({"slug": study_id_str})
            
        if study:
            study_title = study.get("title")
            coordinator_id = study.get("coordinatorId")
            
            if coordinator_id and ObjectId.is_valid(coordinator_id):
                coord_user = await db["users"].find_one({"_id": ObjectId(coordinator_id)})
                if coord_user:
                    coordinator_name = decrypt_data(coord_user.get("name"))

    out = ParticipantOut(
        id=str(p["_id"]),
        userId=p["userId"],
        studyId=p.get("studyId"),
        studyTitle=study_title,
        coordinatorId=coordinator_id,
        coordinatorName=coordinator_name,
        status=p.get("status", "LEAD"),
        phone=decrypt_data(p.get("phone")),
        timezone=p.get("timezone", "UTC"),
        notes=decrypt_data(p.get("notes")),
        armId=p.get("armId"),
        consentedAt=p.get("consentedAt"),
    )
    if user:
        out.name = decrypt_data(user.get("name"))
        out.email = user.get("email") # Email kept plain for lookup/login logic
    return out


# ─── Admin: List All ─────────────────────────────────────────────────────────

@router.get("", response_model=List[ParticipantOut])
async def list_participants(
    study_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user=Depends(require_coordinator_or_admin),
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
        user_id_str = p.get("userId")
        user = None
        if user_id_str and ObjectId.is_valid(user_id_str):
            user = await db["users"].find_one({"_id": ObjectId(user_id_str)})
        item = await _map_participant(p, db, user)
        result.append(item)
    return result


# ─── Admin: Single Participant ────────────────────────────────────────────────

@router.get("/{participant_id}", response_model=ParticipantOut)
async def get_participant(
    participant_id: str,
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    if not ObjectId.is_valid(participant_id):
        raise HTTPException(status_code=400, detail="Invalid participant ID")
        
    p = await db["participants"].find_one({"_id": ObjectId(participant_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
        
    user_id_str = p.get("userId")
    user = None
    if user_id_str and ObjectId.is_valid(user_id_str):
        user = await db["users"].find_one({"_id": ObjectId(user_id_str)})
    return await _map_participant(p, db, user)


# ─── Admin: Update Status ────────────────────────────────────────────────────

@router.patch("/{participant_id}/status")
async def update_participant_status(
    participant_id: str,
    body: dict,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: Update a participant's status (e.g., LEAD → ENROLLED)."""
    if not ObjectId.is_valid(participant_id):
        raise HTTPException(status_code=400, detail="Invalid participant ID")
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

    responses = body.responses
    is_eligible = (
        int(responses.get("age", 0)) >= 18 and
        responses.get("smoker", "yes") == "no"
    )

    responses_str = json.dumps(body.responses)
    
    now = datetime.now(timezone.utc)
    screener_doc = {
        "participantId": str(participant["_id"]),
        "studyId": body.studyId,
        "responses": encrypt_data(responses_str),
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


@router.get("/screener/{participant_id}")
async def get_screener_responses(
    participant_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: Get decrypted screener responses for a participant."""
    doc = await db["screenerResponses"].find_one({"participantId": participant_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Screener responses not found")
    
    raw_responses = decrypt_data(doc.get("responses"))
    try:
        responses = json.loads(raw_responses)
    except Exception:
        responses = {}
        
    return {
        "id": str(doc["_id"]),
        "participantId": doc["participantId"],
        "studyId": doc["studyId"],
        "responses": responses,
        "isEligible": doc["isEligible"],
        "completedAt": doc["completedAt"]
    }


# ─── My Profile (Participant self) ───────────────────────────────────────────

@router.get("/me/profile", response_model=ParticipantOut)
async def my_profile(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Participant: view own profile."""
    p = await db["participants"].find_one({"userId": current_user.user_id})
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    user = None
    if current_user.user_id and ObjectId.is_valid(current_user.user_id):
        user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
    return await _map_participant(p, db, user)


@router.patch("/me/profile")
async def update_my_profile(
    body: dict,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant: update own profile (e.g., timezone)."""
    p = await db["participants"].find_one({"userId": current_user.user_id})
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = {}
    if "timezone" in body:
        update_data["timezone"] = body["timezone"]
    if "phone" in body:
        update_data["phone"] = encrypt_data(body["phone"])
    if "notes" in body:
        update_data["notes"] = encrypt_data(body["notes"])

    if update_data:
        update_data["updatedAt"] = datetime.now(timezone.utc)
        await db["participants"].update_one(
            {"userId": current_user.user_id},
            {"$set": update_data}
        )

    return {"message": "Profile updated successfully"}


# ─── Participant: Consent ─────────────────────────────────────────────────────

@router.post("/consent", response_model=ConsentOut)
async def sign_consent(
    body: ConsentSign,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant signs the informed consent form."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    now = datetime.now(timezone.utc)
    consent_doc = {
        "participantId": str(participant["_id"]),
        "studyId": body.studyId,
        "signatureData": encrypt_data(body.signatureData), # Encrypt signature for PII
        "signedAt": now,
        "ipAddress": body.ipAddress,
    }
    result = await db["consents"].insert_one(consent_doc)
    
    # Update participant status
    await db["participants"].update_one(
        {"_id": participant["_id"]},
        {"$set": {"status": "CONSENTED", "consentedAt": now, "studyId": body.studyId}}
    )
    
    return ConsentOut(
        id=str(result.inserted_id),
        participantId=str(participant["_id"]),
        studyId=body.studyId,
        signedAt=now
    )


# ─── Participant/Admin: Enrollment & Randomization ───────────────────────────

@router.post("/me/enroll")
async def enroll_me(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Finalize enrollment for the current authenticated participant.
    """
    p = await db["participants"].find_one({"userId": current_user.user_id})
    if not p:
        raise HTTPException(status_code=404, detail="Participant profile not found")
    return await _enroll_logic(p, db)

@router.post("/{participant_id}/enroll")
async def enroll_participant(
    participant_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Finalize enrollment via participant ID.
    """
    if not ObjectId.is_valid(participant_id):
        raise HTTPException(status_code=400, detail="Invalid participant ID")
    p = await db["participants"].find_one({"_id": ObjectId(participant_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return await _enroll_logic(p, db)

async def _enroll_logic(p: dict, db):
    if p.get("status") not in ["CONSENTED", "SCREENED"]:
        raise HTTPException(status_code=400, detail="Participant must have signed consent and passed screening.")

    study_id = p.get("studyId")
    if not study_id:
        raise HTTPException(status_code=400, detail="Participant is not assigned to a study")
    study = None
    if ObjectId.is_valid(study_id):
        study = await db["studies"].find_one({"_id": ObjectId(study_id)})
    if not study:
        study = await db["studies"].find_one({"slug": study_id})
    if not study:
        raise HTTPException(status_code=404, detail="Assigned study not found")

    # Randomization Logic
    arm_id = None
    if study.get("randomizationEnabled") and study.get("arms"):
        arm_id = randomize_participant(study["arms"])
    
    now = datetime.now(timezone.utc)
    await db["participants"].update_one(
        {"_id": p["_id"]},
        {"$set": {
            "status": "ENROLLED",
            "armId": arm_id,
            "enrolledAt": now,
            "updatedAt": now
        }}
    )

    return {
        "message": "Participant enrolled successfully",
        "armId": arm_id,
        "randomized": arm_id is not None
    }

# ─── Participant: Withdrawal (GDPR/Compliance) ────────────────────────────────

@router.post("/me/withdraw")
async def withdraw_me(
    request: Request,
    reason: Optional[str] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant: Withdraw from the study (GDPR Right to Withdraw)."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    now = datetime.now(timezone.utc)
    await db["participants"].update_one(
        {"_id": participant["_id"]},
        {"$set": {
            "status": "WITHDRAWN",
            "withdrawalReason": encrypt_data(reason),
            "withdrawnAt": now,
            "updatedAt": now
        }}
    )

    
    await log_audit_event(
        db=db,
        user_id=current_user.user_id,
        action="WITHDRAW",
        resource=f"Participant:{participant['_id']}",
        details=f"Reason: {reason if reason else 'No reason provided'}",
        request=request
    )
    
    return {"message": "You have successfully withdrawn from the study. Your data will be handled according to policy."}


# ─── Participant Engagement: Reports (Section 4.4) ───────────────────────────

@router.get("/me/report")
async def get_my_report(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Generate a summary report for the participant."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Gather some stats for the report
    completed_tasks = await db["taskInstances"].count_documents({
        "participantId": str(participant["_id"]),
        "status": "COMPLETED"
    })
    
    pending_tasks = await db["taskInstances"].count_documents({
        "participantId": str(participant["_id"]),
        "status": {"$in": ["PENDING", "OVERDUE"]}
    })
    
    study = None
    if participant.get("studyId"):
        study_id_str = participant["studyId"]
        if ObjectId.is_valid(study_id_str):
            study = await db["studies"].find_one({"_id": ObjectId(study_id_str)})
        if not study:
            study = await db["studies"].find_one({"slug": study_id_str})

    user = None
    if current_user.user_id and ObjectId.is_valid(current_user.user_id):
        user = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
    name = decrypt_data(user.get("name")) if user and user.get("name") else "Participant"

    return {
        "participantName": name,
        "reportGeneratedAt": datetime.now(timezone.utc),
        "studyTitle": study["title"] if study else "Not Enrolled",
        "progress": {
            "completedTasks": completed_tasks,
            "pendingTasks": pending_tasks,
            "complianceScore": int((completed_tasks / max(completed_tasks + pending_tasks, 1)) * 100)
        },
        "message": "Thank you for your valuable contribution to clinical research."
    }
