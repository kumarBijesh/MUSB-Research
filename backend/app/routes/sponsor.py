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
from bson import ObjectId
from app.utils.email import notify_admin_new_study_inquiry
from app.utils.security import decrypt_data
from app.config import get_settings

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

    # If it's being submitted as an inquiry, set status to UNDER_REVIEW and notify admin
    is_inquiry = False
    if doc.get("status") in ("PUBLISHED", "UNDER_REVIEW"):
        doc["status"] = "UNDER_REVIEW"
        is_inquiry = True

    result = await db["studies"].insert_one(doc)
    created = await db["studies"].find_one({"_id": result.inserted_id})
    
    # Send Notification to Admin if it's a new inquiry
    if is_inquiry:
        settings = get_settings()
        admin_email = settings.SMTP_EMAIL # Default to system email for admin
        
        # Fetch sponsor name from DB
        sponsor_name = "A Sponsor"
        user_doc = await db["users"].find_one({"_id": ObjectId(current_user.user_id)})
        if user_doc:
            try:
                sponsor_name = decrypt_data(user_doc.get("name")) or "A Sponsor"
            except Exception:
                sponsor_name = "A Sponsor"

        # Save in-app notification for all admins to see on the bell icon
        study_title = study_in.title
        await db["notifications"].insert_one({
            "userId": "ADMIN",  # special target: all admin users see this
            "title": f"New Study Inquiry: {study_title}",
            "content": f"Sponsor {sponsor_name} ({current_user.email}) has submitted a study inquiry and is awaiting approval.",
            "type": "STUDY_INQUIRY",
            "status": "UNREAD",
            "studyId": str(result.inserted_id),
            "createdAt": doc["createdAt"],
        })

        await notify_admin_new_study_inquiry(
            admin_email=admin_email,
            sponsor_name=sponsor_name,
            sponsor_email=current_user.email,
            study_details=study_in.model_dump()
        )

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


# ─── Sponsor: Study Inquiry Lead ──────────────────────────────────────────────

from fastapi import File, UploadFile, Form
import json as _json

ROUTE_MAP = {
    "Biorepository": "biorepository@musbresearch.com",
    "Biomarker / Lab Support": "lab@musbresearch.com",
    "Not Sure – Need Guidance": "sales@musbresearch.com",
}
DEFAULT_ROUTE = "sales@musbresearch.com"
LEGAL_EMAIL   = "info@musbresearch.com"


@router.post("/lead")
async def submit_lead(
    data: str = Form(...),
    file: UploadFile = File(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Handle sponsor study inquiry leads (Step 1 = preliminary, Step 2 = qualified).
    Supports multipart (with optional file attachment).
    """
    try:
        payload = _json.loads(data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload in 'data' field.")

    step        = payload.get("step", 1)
    nda_req     = payload.get("ndaRequested", False)
    status      = payload.get("status", "PRELIMINARY_LEAD")
    step1_data  = payload.get("step1", {})
    step2_data  = payload.get("step2", {})
    nda_info    = payload.get("ndaInfo", {})
    now         = datetime.now(timezone.utc)

    # ── Determine routing email ───────────────────────────────────────────────
    route_email = DEFAULT_ROUTE
    if nda_req:
        route_email = LEGAL_EMAIL
    else:
        needs: list = step1_data.get("need", []) + step2_data.get("services", [])
        for need in needs:
            if need in ROUTE_MAP:
                route_email = ROUTE_MAP[need]
                break

    # ── Upsert the lead record ────────────────────────────────────────────────
    existing = await db["leads"].find_one({"sponsorUserId": current_user.user_id})
    lead_doc = {
        "sponsorUserId": current_user.user_id,
        "sponsorEmail": current_user.email,
        "step": step,
        "status": status,
        "ndaRequested": nda_req,
        "ndaInfo": nda_info,
        "step1": step1_data,
        "step2": step2_data,
        "routedTo": route_email,
        "updatedAt": now,
    }

    if existing:
        await db["leads"].update_one({"_id": existing["_id"]}, {"$set": lead_doc})
        lead_id = str(existing["_id"])
    else:
        lead_doc["createdAt"] = now
        res = await db["leads"].insert_one(lead_doc)
        lead_id = str(res.inserted_id)

    # ── Store file reference if uploaded ──────────────────────────────────────
    if file and file.filename:
        file_bytes = await file.read()
        await db["leadAttachments"].insert_one({
            "leadId": lead_id,
            "filename": file.filename,
            "contentType": file.content_type,
            "size": len(file_bytes),
            "uploadedAt": now,
        })

    # ── Admin in-app notification ─────────────────────────────────────────────
    product_name = step1_data.get("productName", "Unknown Product")
    notif_title = (
        f"NDA Requested: {product_name}" if nda_req and step == 1
        else f"Qualified Lead: {product_name}" if step == 2
        else f"New Preliminary Lead: {product_name}"
    )
    await db["notifications"].insert_one({
        "userId": "ADMIN",
        "title": notif_title,
        "content": (
            f"Sponsor {current_user.email} submitted a study inquiry "
            f"(Status: {status}). Routed to {route_email}."
        ),
        "type": "LEAD_SUBMISSION",
        "status": "UNREAD",
        "leadId": lead_id,
        "createdAt": now,
    })

    # ── Send email notification ───────────────────────────────────────────────
    settings = get_settings()
    email_subject = (
        f"MUSB Research: NDA Requested — {product_name}" if nda_req and step == 1
        else f"MUSB Research: New Qualified Study Lead — {product_name}"
    )
    nda_block = ""
    if nda_req and nda_info:
        nda_block = f"""
NDA REQUEST DETAILS:
  Company: {nda_info.get('companyName')}
  Signatory: {nda_info.get('signatoryName')}, {nda_info.get('title')}
  Address: {nda_info.get('address')}
"""
    email_body = f"""
New sponsor inquiry received.

SPONSOR: {current_user.email}
STATUS: {status}
ROUTED TO: {route_email}

PRODUCT: {step1_data.get('productName')} ({step1_data.get('productCategory')})
STAGE: {step1_data.get('stage')}
HEALTH FOCUS: {step1_data.get('healthFocus')}
TIMELINE: {step1_data.get('timeline')}
NEEDS: {', '.join(step1_data.get('need', []))}
{nda_block}
BUDGET: {step2_data.get('budget', 'N/A')}
SERVICES: {', '.join(step2_data.get('services', []))}

DESCRIPTION:
{step2_data.get('description', 'Not provided (Step 1 only)')}

Lead ID: {lead_id}
"""
    from app.utils.email import send_email_notification
    await send_email_notification(route_email, email_subject, email_body)

    return {
        "message": "Lead submitted successfully",
        "leadId": lead_id,
        "status": status,
        "routedTo": route_email,
    }

