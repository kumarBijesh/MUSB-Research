from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends
from bson import ObjectId

from app.database import get_db
from app.auth import require_coordinator_or_admin

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    """Get all notifications for admin users (includes ADMIN-targeted and personal)."""
    query = {
        "$or": [
            {"userId": "ADMIN"},         # Broadcast to all admins
            {"userId": current_user.user_id},  # Personal notifications
        ]
    }

    notifications = []
    async for doc in db["notifications"].find(query).sort("createdAt", -1).limit(50):
        notifications.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", "Notification"),
            "content": doc.get("content", ""),
            "type": doc.get("type", "INFO"),
            "status": doc.get("status", "UNREAD"),
            "studyId": doc.get("studyId"),
            "createdAt": doc.get("createdAt", datetime.now(timezone.utc)),
        })
    return notifications


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    """Mark a notification as read."""
    await db["notifications"].update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"status": "READ"}}
    )
    return {"message": "Marked as read"}


@router.patch("/mark-all-read")
async def mark_all_read(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db)
):
    """Mark all admin notifications as read."""
    await db["notifications"].update_many(
        {
            "$or": [
                {"userId": "ADMIN"},
                {"userId": current_user.user_id},
            ],
            "status": "UNREAD"
        },
        {"$set": {"status": "READ"}}
    )
    return {"message": "All marked as read"}
