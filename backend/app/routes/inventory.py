from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from app.database import get_db
from app.models import KitInstanceCreate, KitInstanceOut
from app.auth import require_admin, require_coordinator_or_admin

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

def _map_kit(doc: dict) -> KitInstanceOut:
    return KitInstanceOut(
        id=str(doc["_id"]),
        sku=doc["sku"],
        type=doc["type"],
        lotNumber=doc["lotNumber"],
        expirationDate=doc["expirationDate"],
        status=doc.get("status", "AVAILABLE"),
        assignedTo=doc.get("assignedTo"),
        shippedAt=doc.get("shippedAt"),
    )

@router.get("/", response_model=List[KitInstanceOut])
async def list_kits(
    status_val: Optional[str] = Query(None, alias="status"),
    type_val: Optional[str] = Query(None, alias="type"),
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    query = {}
    if status_val:
        query["status"] = status_val
    if type_val:
        query["type"] = type_val

    cursor = db["inventory"].find(query).sort("expirationDate", 1).limit(200)
    kits = []
    async for doc in cursor:
        kits.append(_map_kit(doc))
    return kits

@router.post("/", response_model=KitInstanceOut, status_code=status.HTTP_201_CREATED)
async def create_kit(
    kit_in: KitInstanceCreate,
    current_user=Depends(require_admin), # Only admins create kit inventory
    db=Depends(get_db)
):
    doc = kit_in.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc)
    result = await db["inventory"].insert_one(doc)
    created = await db["inventory"].find_one({"_id": result.inserted_id})
    return _map_kit(created)

@router.patch("/{kit_id}/ship", response_model=KitInstanceOut)
async def ship_kit(
    kit_id: str,
    participantId: str,
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    if not ObjectId.is_valid(kit_id):
        raise HTTPException(status_code=400, detail="Invalid Kit ID")
        
    await db["inventory"].update_one(
        {"_id": ObjectId(kit_id)},
        {"$set": {
            "status": "SHIPPED",
            "assignedTo": participantId,
            "shippedAt": datetime.now(timezone.utc)
        }}
    )
    doc = await db["inventory"].find_one({"_id": ObjectId(kit_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Kit not found")
    return _map_kit(doc)
