from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request # type: ignore
from app.database import get_db # type: ignore
from app.auth import get_current_user # type: ignore
from app.models import AuditLogCreate, AuditLogOut, UserRole # type: ignore
from app.utils.security import encrypt_data, decrypt_data # type: ignore

router = APIRouter(prefix="/api/audit", tags=["HIPAA Audit Logs"])

# ---------------------------------------------------------------------------
# Helper: Write Audit Log (Internal Use)
# ---------------------------------------------------------------------------

async def log_audit_event(
    db,
    user_id: str,
    action: str,
    resource: str,
    details: Optional[str] = None,
    request: Optional[Request] = None,
):
    """
    Core function to record sensitive actions for HIPAA compliance.
    """
    ip_address = request.client.host if request else "unknown"
    user_agent = request.headers.get("user-agent") if request else "unknown"

    log_entry = {
        "userId": user_id,
        "action": action,
        "resource": resource,
        "details": encrypt_data(str(details)) if details is not None else None,
        "ipAddress": ip_address,
        "userAgent": user_agent,
        "timestamp": datetime.now(timezone.utc),
    }

    await db["audit_logs"].insert_one(log_entry)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[AuditLogOut])
async def get_audit_logs(
    limit: int = 100,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Compliance Officer View: Retrieve audit trails.
    Strictly limited to ADMIN or PI roles.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.PI, UserRole.SPONSOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Compliance Officers can view audit logs.",
        )

    query = {}
    if action:
        query["action"] = action
    if user_id:
        query["userId"] = user_id

    logs = []
    cursor = db["audit_logs"].find(query).sort("timestamp", -1).limit(limit)
    async for doc in cursor:
        logs.append(AuditLogOut(
            id=str(doc["_id"]),
            userId=doc["userId"],
            action=doc["action"],
            resource=doc["resource"],
            details=decrypt_data(doc.get("details")),
            ipAddress=doc.get("ipAddress"),
            userAgent=doc.get("userAgent"),
            timestamp=doc["timestamp"],
        ))
    
    return logs
