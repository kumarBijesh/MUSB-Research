"""
Admin Data Export Routes — CSV downloads for CDISC SDTM compliance.
Endpoint: /api/export/{dataset}
"""
import csv
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.auth import require_admin, get_current_user, require_coordinator_or_admin
from app.models import UserRole
from app.utils.security import decrypt_data
from app.routes.audit import log_audit_event

router = APIRouter(prefix="/api/export", tags=["Data Export"])


def _csv_response(rows: list[dict], filename: str) -> StreamingResponse:
    """Convert a list of dicts to a streaming CSV download."""
    if not rows:
        output = io.StringIO()
        output.write("No data available\n")
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ── Demographics (DM) ─────────────────────────────────────────────────────────

@router.get("/demographics")
async def export_demographics(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db),
):
    """CDISC DM: Subject Demographics export."""
    rows = []
    async for doc in db["participants"].find({}).limit(5000):
        rows.append({
            "SUBJID": (str(doc["_id"]))[-8:].upper(),
            "STUDYID": doc.get("studyId", ""),
            "ARM": doc.get("studyArm", ""),
            "SEX": decrypt_data(doc.get("gender", "")) or "",
            "AGE": decrypt_data(doc.get("age", "")) or "",
            "COUNTRY": decrypt_data(doc.get("country", "")) or "",
            "ENRLDT": str(doc.get("enrolledAt", "")),
            "STATUS": doc.get("status", ""),
        })
    await log_audit_event(db, current_user.user_id, "EXPORT_CSV", "demographics")
    return _csv_response(rows, "demographics_DM.csv")


# ── ePRO / Assessments (QS) ───────────────────────────────────────────────────

@router.get("/epro")
async def export_epro(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db),
):
    """CDISC QS: ePRO and Assessment Data export."""
    rows = []
    async for doc in db["assessments"].find({}).limit(5000):
        rows.append({
            "SUBJID": doc.get("participantId", ""),
            "QSTEST": doc.get("type", ""),
            "QSCAT": doc.get("category", ""),
            "QSORRES": decrypt_data(doc.get("response", "")) or "",
            "QSDTC": str(doc.get("completedAt", doc.get("createdAt", ""))),
            "STATUS": doc.get("status", ""),
        })
    await log_audit_event(db, current_user.user_id, "EXPORT_CSV", "epro_assessments")
    return _csv_response(rows, "ePRO_assessment_QS.csv")


# ── Adverse Events (AE) ───────────────────────────────────────────────────────

@router.get("/adverse-events")
async def export_adverse_events(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db),
):
    """CDISC AE: Adverse Events safety export."""
    rows = []
    async for doc in db["adverseEvents"].find({}).limit(5000):
        rows.append({
            "SUBJID": doc.get("participantId", ""),
            "AETERM": decrypt_data(doc.get("description", "")) or "",
            "AESEV": doc.get("severity", ""),
            "AESTDTC": str(doc.get("onsetDate", "")),
            "AEENDDTC": str(doc.get("resolvedAt", "")),
            "AEOUT": doc.get("status", ""),
            "AEACN": decrypt_data(doc.get("actionTaken", "")) or "",
            "AERPTDT": str(doc.get("reportedAt", "")),
        })
    await log_audit_event(db, current_user.user_id, "EXPORT_CSV", "adverse_events")
    return _csv_response(rows, "adverse_events_AE.csv")


# ── Vital Signs & Device Data (VS) ────────────────────────────────────────────

@router.get("/vitals")
async def export_vitals(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db),
):
    """CDISC VS: Vital Signs and device data export."""
    rows = []
    async for doc in db["dataLogs"].find({"type": {"$in": ["VITALS", "SUPPLEMENT", "SLEEP", "MOOD"]}}).limit(5000):
        import json
        raw_data = doc.get("data", {})
        if isinstance(raw_data, str):
            try:
                from app.utils.security import decrypt_data as _dec
                raw_data = json.loads(_dec(raw_data))
            except Exception:
                raw_data = {}
        rows.append({
            "SUBJID": doc.get("participantId", ""),
            "VSTEST": doc.get("type", ""),
            "VSORRES": json.dumps(raw_data),
            "VSDTC": str(doc.get("loggedAt", "")),
            "NOTES": decrypt_data(doc.get("notes", "")) or "",
        })
    await log_audit_event(db, current_user.user_id, "EXPORT_CSV", "vitals_device_data")
    return _csv_response(rows, "vitals_device_VS.csv")


# ── Stats Summary ─────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_export_stats(
    current_user=Depends(require_coordinator_or_admin),
    db=Depends(get_db),
):
    """Return live record counts for the Data & Exports dashboard."""
    participants   = await db["participants"].count_documents({})
    assessments    = await db["assessments"].count_documents({})
    adverse_events = await db["adverseEvents"].count_documents({})
    data_logs      = await db["dataLogs"].count_documents({})
    total          = participants + assessments + adverse_events + data_logs

    # Data completeness: % of participants with at least one log entry
    with_logs = await db["dataLogs"].distinct("participantId")
    completeness = float(round(len(with_logs) / participants * 100, 1)) if participants > 0 else 0.0

    return {
        "totalRecords": total,
        "participants": participants,
        "assessments": assessments,
        "adverseEvents": adverse_events,
        "dataLogs": data_logs,
        "dataCompleteness": completeness,
        "lastSync": datetime.now(timezone.utc).isoformat(),
    }
