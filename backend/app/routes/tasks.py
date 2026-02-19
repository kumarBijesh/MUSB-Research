from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from app.database import get_db
from app.models import TaskInstanceOut
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _map_task(doc: dict, task_def: dict = None) -> TaskInstanceOut:
    title = task_def["title"] if task_def else "Unknown Task"
    desc = task_def.get("description") if task_def else None
    type_ = task_def.get("type", "FORM") if task_def else "FORM"
    return TaskInstanceOut(
        id=str(doc["_id"]),
        taskId=doc["taskId"],
        title=title,
        description=desc,
        type=type_,
        status=doc.get("status", "PENDING"),
        availableDate=doc["availableDate"],
        dueDate=doc["dueDate"],
        completedDate=doc.get("completedDate"),
    )


# ─── Participant: My Tasks ────────────────────────────────────────────────────

@router.get("/me", response_model=List[TaskInstanceOut])
async def my_tasks(
    status: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant: get all task instances assigned to me."""
    participant = await db["participants"].find_one({"userId": current_user.user_id})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant profile not found")

    query: dict = {"participantId": str(participant["_id"])}
    if status:
        query["status"] = status

    result = []
    async for doc in db["taskInstances"].find(query).sort("dueDate", 1):
        task_def = await db["tasks"].find_one({"_id": ObjectId(doc["taskId"])})
        result.append(_map_task(doc, task_def))
    return result


# ─── Participant: Complete a Task ─────────────────────────────────────────────

@router.patch("/{instance_id}/complete")
async def complete_task(
    instance_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Participant: mark a task instance as completed."""
    now = datetime.now(timezone.utc)
    result = await db["taskInstances"].update_one(
        {"_id": ObjectId(instance_id)},
        {"$set": {"status": "COMPLETED", "completedDate": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task instance not found")
    return {"message": "Task marked as completed"}


# ─── Admin: Create Task Instances for a Participant ───────────────────────────

@router.post("/generate/{participant_id}", status_code=201)
async def generate_tasks(
    participant_id: str,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    """Admin: generate task instances for a newly enrolled participant based on the study schedule."""
    participant = await db["participants"].find_one({"_id": ObjectId(participant_id)})
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    study_id = participant.get("studyId")
    if not study_id:
        raise HTTPException(status_code=400, detail="Participant is not assigned to a study")

    tasks = []
    async for task in db["tasks"].find({"studyId": study_id}):
        tasks.append(task)

    now = datetime.now(timezone.utc)
    enrolled_date = participant.get("enrolledAt", now)
    created_count = 0

    for task in tasks:
        available = enrolled_date + __import__("datetime").timedelta(days=task.get("dueDayOffset", 0))
        due = available + __import__("datetime").timedelta(days=task.get("windowDays", 3))
        instance = {
            "participantId": participant_id,
            "taskId": str(task["_id"]),
            "availableDate": available,
            "dueDate": due,
            "status": "PENDING",
            "createdAt": now,
        }
        await db["taskInstances"].insert_one(instance)
        created_count += 1

    return {"message": f"Generated {created_count} task instances for participant."}
