from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import get_db
from app.models import MessageCreate, MessageOut, ContactMessageCreate, ContactMessageOut
from app.auth import get_current_user
from app.utils.security import encrypt_data, decrypt_data

router = APIRouter(prefix="/api/messages", tags=["Messages"])


def _map_msg(doc: dict) -> MessageOut:
    return MessageOut(
        id=str(doc["_id"]),
        senderId=doc["senderId"],
        receiverId=doc.get("receiverId"),
        content=decrypt_data(doc["content"]),
        read=doc.get("read", False),
        createdAt=doc["createdAt"],
    )


@router.get("/", response_model=List[MessageOut])
async def get_my_messages(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get all messages for the current user (sent and received)."""
    query = {
        "$or": [
            {"senderId": current_user.user_id},
            {"receiverId": current_user.user_id}
        ]
    }
    result = []
    async for doc in db["messages"].find(query).sort("createdAt", -1).limit(100):
        result.append(_map_msg(doc))
    return result


from app.utils.email import notify_coordinator_new_message

@router.post("/", response_model=MessageOut)
async def send_message(
    body: MessageCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Send a message to another user."""
    # Verify receiver exists
    receiver = await db["users"].find_one({"_id": ObjectId(body.receiverId)})
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")

    now = datetime.now(timezone.utc)
    doc = {
        "senderId": current_user.user_id,
        "receiverId": body.receiverId,
        "studyId": body.studyId,
        "content": encrypt_data(body.content),
        "read": False,
        "createdAt": now,
    }
    result = await db["messages"].insert_one(doc)
    created = await db["messages"].find_one({"_id": result.inserted_id})

    # ── Real-time Notification Logic ──
    
    # 1. Create In-App Notification Record
    notification_doc = {
        "userId": body.receiverId,
        "title": f"New message from {current_user.email}",
        "content": body.content[:100],
        "type": "MESSAGE",
        "status": "UNREAD",
        "createdAt": now
    }
    await db["notifications"].insert_one(notification_doc)

    # 2. If receiver is COORDINATOR, send Gmail Remainder (Mocked)
    if receiver.get("role") == "COORDINATOR":
        # Decrypt sender name if available
        sender_name = decrypt_data(current_user.name) if getattr(current_user, "name", None) else current_user.email
        
        await notify_coordinator_new_message(
            coordinator_email=receiver["email"],
            coordinator_name=receiver.get("name", "Coordinator"),
            participant_name=sender_name,
            message_excerpt=body.content[:50]
        )

    return _map_msg(created)


@router.patch("/{message_id}/read")
async def mark_read(
    message_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Mark a message as read."""
    await db["messages"].update_one(
        {"_id": ObjectId(message_id), "receiverId": current_user.user_id},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}


# ─── Public Contact Form ──────────────────────────────────────────────────────

@router.post("/contact", response_model=ContactMessageOut)
async def submit_contact_form(
    body: ContactMessageCreate,
    db=Depends(get_db)
):
    """Public endpoint for 'Contact Us' form submissions."""
    now = datetime.now(timezone.utc)
    doc = body.model_dump()
    doc["message"] = encrypt_data(doc.get("message", ""))
    doc["createdAt"] = now
    doc["read"] = False
    
    result = await db["contact_messages"].insert_one(doc)
    created = await db["contact_messages"].find_one({"_id": result.inserted_id})
    
    return ContactMessageOut(
        id=str(created["_id"]),
        **{k: v for k, v in created.items() if k != "_id"}
    )


@router.get("/contact", response_model=List[ContactMessageOut])
async def get_contact_messages(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Admin only: Get all contact form submissions."""
    if current_user.role not in ["ADMIN", "COORDINATOR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = []
    async for doc in db["contact_messages"].find().sort("createdAt", -1):
        mapped = {k: v for k, v in doc.items() if k != "_id"}
        mapped["message"] = decrypt_data(mapped.get("message", ""))
        result.append(ContactMessageOut(
            id=str(doc["_id"]),
            **mapped
        ))
    return result
