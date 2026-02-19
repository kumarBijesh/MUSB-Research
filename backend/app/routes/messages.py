from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.database import get_db
from app.models import MessageCreate, MessageOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Messages"])


def _map_msg(doc: dict) -> MessageOut:
    return MessageOut(
        id=str(doc["_id"]),
        senderId=doc["senderId"],
        receiverId=doc.get("receiverId"),
        content=doc["content"],
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
        "content": body.content,
        "read": False,
        "createdAt": now,
    }
    result = await db["messages"].insert_one(doc)
    created = await db["messages"].find_one({"_id": result.inserted_id})
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
