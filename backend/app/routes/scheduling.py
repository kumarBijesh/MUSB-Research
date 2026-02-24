from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.database import get_db
from app.models import AppointmentCreate, AppointmentOut
from app.auth import require_admin, require_coordinator_or_admin
from app.utils.security import encrypt_data, decrypt_data

router = APIRouter(prefix="/api/scheduling", tags=["Scheduling"])

def _map_appointment(doc: dict) -> AppointmentOut:
    return AppointmentOut(
        id=str(doc["_id"]),
        participantId=doc["participantId"],
        coordinatorId=doc.get("coordinatorId"),
        scheduledAt=doc["scheduledAt"],
        type=doc.get("type", "Screening Call"),
        status=doc.get("status", "SCHEDULED"),
        notes=decrypt_data(doc.get("notes")),
        createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
    )

@router.get("/", response_model=List[AppointmentOut])
async def list_appointments(
    participantId: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None, alias="status"),
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    query = {}
    if participantId:
        query["participantId"] = participantId
    if status_val:
        query["status"] = status_val

    cursor = db["appointments"].find(query).sort("scheduledAt", 1).limit(100)
    appointments = []
    async for doc in cursor:
        appointments.append(_map_appointment(doc))
    return appointments

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appt_in: AppointmentCreate,
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    doc = appt_in.model_dump()
    doc["notes"] = encrypt_data(doc.get("notes"))
    doc["createdAt"] = datetime.now(timezone.utc)
    # automatically assign coordinator if self-scheduled or defaults
    if not doc.get("coordinatorId"):
        doc["coordinatorId"] = current_user.user_id
    
    result = await db["appointments"].insert_one(doc)
    created = await db["appointments"].find_one({"_id": result.inserted_id})
    return _map_appointment(created)

@router.patch("/{appointment_id}", response_model=AppointmentOut)
async def update_appointment(
    appointment_id: str,
    updates: dict,
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
        
    await db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": updates}
    )
    doc = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return _map_appointment(doc)
