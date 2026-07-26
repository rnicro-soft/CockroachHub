from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_admin
from app.database import get_db
import json as json_mod
from app.helpline_sync import sync_helpline_data
from app.models import Admin, Alert, Announcement, AuditLog, Detainee, EmergencyContact, FactCheck, IPBlacklist, LegalRight, LoginAttempt, MetroDisruption, MetroStation, Post, PushSubscription, SafeZone, Submission
from app.push import send_push_notification
from app.schemas import (
    AdminOut,
    AlertCreate,
    AlertOut,
    AlertUpdate,
    AnnouncementCreate,
    AnnouncementOut,
    ContactCreate,
    ContactOut,
    ContactUpdate,
    DetaineeCreate,
    DetaineeUpdate,
    FactCheckCreate,
    FactCheckOut,
    FactCheckUpdate,
    IPBlacklistCreate,
    LegalRightCreate,
    LegalRightOut,
    LegalRightUpdate,
    MetroDisruptionCreate,
    MetroDisruptionOut,
    MetroDisruptionUpdate,
    MetroStationOut,
    PostCreate,
    PostOut,
    PostUpdate,
    SafeZoneCreate,
    SafeZoneOut,
    SafeZoneUpdate,
    SubmissionOut,
    SubmissionReview,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def _log_action(
    db: AsyncSession,
    admin_id: int,
    action: str,
    resource_type: str,
    resource_id: int | None = None,
    details: str | None = None,
):
    db.add(AuditLog(
        admin_id=admin_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    ))
    # Not committed — caller handles commit


# --- Dashboard Stats ---
@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    r1 = await db.execute(select(func.count(Alert.id)).where(Alert.is_active == True))
    r2 = await db.execute(select(func.count(Submission.id)).where(Submission.status == "pending"))
    r3 = await db.execute(select(func.count(FactCheck.id)).where(FactCheck.is_published == True))
    r4 = await db.execute(select(func.count(EmergencyContact.id)))
    r5 = await db.execute(select(func.count(Admin.id)))
    return {
        "active_alerts": r1.scalar(),
        "pending_submissions": r2.scalar(),
        "published_checks": r3.scalar(),
        "total_contacts": r4.scalar(),
        "total_admins": r5.scalar(),
    }


# --- Submissions ---
@router.get("/submissions")
async def list_submissions(
    status_filter: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(Submission).order_by(Submission.created_at.desc())
    count_q = select(func.count(Submission.id))
    if status_filter:
        query = query.where(Submission.status == status_filter)
        count_q = count_q.where(Submission.status == status_filter)
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [SubmissionOut.model_validate(s) for s in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.patch("/submissions/{submission_id}", response_model=SubmissionOut)
async def review_submission(
    submission_id: int,
    body: SubmissionReview,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    submission.status = body.status
    submission.reviewed_by = current_admin.id
    submission.reviewed_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "review", "submission", submission_id, f"status={body.status}")
    await db.commit()
    await db.refresh(submission)
    print(f"[ADMIN] {current_admin.email} reviewed submission #{submission_id} → {body.status}")
    return SubmissionOut.model_validate(submission)


@router.post("/submissions/{submission_id}/publish", response_model=AlertOut, status_code=201)
async def approve_and_publish(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already reviewed")

    alert = Alert(
        type=submission.type,
        title=f"Field Report: {submission.type.title()} Update",
        description=submission.description,
        severity="yellow",
        location=submission.location,
        created_by=current_admin.id,
    )
    db.add(alert)

    submission.status = "approved"
    submission.reviewed_by = current_admin.id
    submission.reviewed_at = datetime.now(timezone.utc)

    await _log_action(db, current_admin.id, "publish", "submission", submission_id, f"created alert #{alert.id}")
    await db.commit()
    await db.refresh(alert)
    print(f"[ADMIN] {current_admin.email} published submission #{submission_id} as alert #{alert.id}")
    return AlertOut.model_validate(alert)


# --- Alerts ---
@router.get("/alerts")
async def list_alerts(
    all: bool = False,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(Alert).order_by(Alert.created_at.desc())
    count_q = select(func.count(Alert.id))
    if not all:
        query = query.where(Alert.is_active == True)
        count_q = count_q.where(Alert.is_active == True)
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [AlertOut.model_validate(a) for a in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/alerts", response_model=AlertOut, status_code=201)
async def create_alert(
    body: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    alert = Alert(**body.model_dump(), created_by=current_admin.id)
    db.add(alert)
    await _log_action(db, current_admin.id, "create", "alert", alert.id)
    await db.commit()
    await db.refresh(alert)

    # Send push notification for high-severity alerts
    if body.severity in ("yellow", "red"):
        try:
            sent = await send_push_notification(
                db,
                title=f"CockroachHub Alert: {body.title}",
                body=body.description[:200],
                url="/live-feed",
            )
            print(f"Push sent to {sent} subscribers")
        except Exception as e:
            print(f"Push failed: {e}")

    print(f"[ADMIN] {current_admin.email} created alert #{alert.id}: {body.title}")
    return AlertOut.model_validate(alert)


@router.put("/alerts/{alert_id}", response_model=AlertOut)
async def update_alert(
    alert_id: int,
    body: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)
    alert.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "update", "alert", alert_id)
    await db.commit()
    await db.refresh(alert)
    print(f"[ADMIN] {current_admin.email} updated alert #{alert_id}")
    return AlertOut.model_validate(alert)


@router.patch("/alerts/{alert_id}/feature", response_model=AlertOut)
async def feature_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.featured = not alert.featured
    alert.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "feature", "alert", alert_id, f"featured={alert.featured}")
    await db.commit()
    await db.refresh(alert)
    print(f"[ADMIN] {current_admin.email} {'featured' if alert.featured else 'unfeatured'} alert #{alert_id}")
    return AlertOut.model_validate(alert)


@router.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    await _log_action(db, current_admin.id, "delete", "alert", alert_id)
    print(f"[ADMIN] {current_admin.email} deleted alert #{alert_id}")
    await db.delete(alert)
    await db.commit()


# --- FactChecks ---
@router.get("/fact-checks")
async def list_fact_checks(
    all: bool = False,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(FactCheck).order_by(FactCheck.created_at.desc())
    count_q = select(func.count(FactCheck.id))
    if not all:
        query = query.where(FactCheck.is_published == True)
        count_q = count_q.where(FactCheck.is_published == True)
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [FactCheckOut.model_validate(c) for c in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/fact-checks", response_model=FactCheckOut, status_code=201)
async def create_fact_check(
    body: FactCheckCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    fact_check = FactCheck(**body.model_dump(), created_by=current_admin.id, is_published=True)
    db.add(fact_check)
    await _log_action(db, current_admin.id, "create", "fact_check", fact_check.id)
    await db.commit()
    await db.refresh(fact_check)
    print(f"[ADMIN] {current_admin.email} created fact check #{fact_check.id}: {body.title}")
    return FactCheckOut.model_validate(fact_check)


@router.put("/fact-checks/{check_id}", response_model=FactCheckOut)
async def update_fact_check(
    check_id: int,
    body: FactCheckUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(FactCheck).where(FactCheck.id == check_id))
    check = result.scalar_one_or_none()
    if not check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fact check not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(check, field, value)
    check.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "update", "fact_check", check_id)
    await db.commit()
    await db.refresh(check)
    return FactCheckOut.model_validate(check)


@router.delete("/fact-checks/{check_id}", status_code=204)
async def delete_fact_check(
    check_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(FactCheck).where(FactCheck.id == check_id))
    check = result.scalar_one_or_none()
    if not check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fact check not found")
    await _log_action(db, current_admin.id, "delete", "fact_check", check_id)
    await db.delete(check)
    await db.commit()


# --- Emergency Contacts ---
@router.get("/contacts")
async def list_contacts(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(EmergencyContact).order_by(EmergencyContact.category, EmergencyContact.name)
    total = (await db.execute(select(func.count(EmergencyContact.id)))).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [ContactOut.model_validate(c) for c in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/contacts", response_model=ContactOut, status_code=201)
async def create_contact(body: ContactCreate, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    contact = EmergencyContact(**body.model_dump())
    db.add(contact)
    await _log_action(db, current_admin.id, "create", "contact", contact.id)
    await db.commit()
    await db.refresh(contact)
    print(f"[ADMIN] {current_admin.email} added contact: {body.name}")
    return ContactOut.model_validate(contact)


@router.put("/contacts/{contact_id}", response_model=ContactOut)
async def update_contact(contact_id: int, body: ContactUpdate, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(EmergencyContact).where(EmergencyContact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    await _log_action(db, current_admin.id, "update", "contact", contact_id)
    await db.commit()
    await db.refresh(contact)
    return ContactOut.model_validate(contact)


@router.delete("/contacts/{contact_id}", status_code=204)
async def delete_contact(contact_id: int, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(EmergencyContact).where(EmergencyContact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    await _log_action(db, current_admin.id, "delete", "contact", contact_id)
    await db.delete(contact)
    await db.commit()


# --- Legal Rights ---
@router.get("/rights")
async def list_rights(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(LegalRight).order_by(LegalRight.sort_order)
    total = (await db.execute(select(func.count(LegalRight.id)))).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [LegalRightOut.model_validate(r) for r in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/rights", response_model=LegalRightOut, status_code=201)
async def create_right(body: LegalRightCreate, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    right = LegalRight(**body.model_dump())
    db.add(right)
    await _log_action(db, current_admin.id, "create", "legal_right", right.id)
    await db.commit()
    await db.refresh(right)
    print(f"[ADMIN] {current_admin.email} created legal right: {body.title}")
    return LegalRightOut.model_validate(right)


@router.put("/rights/{right_id}", response_model=LegalRightOut)
async def update_right(right_id: int, body: LegalRightUpdate, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(LegalRight).where(LegalRight.id == right_id))
    right = result.scalar_one_or_none()
    if not right:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Legal right not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(right, field, value)
    await _log_action(db, current_admin.id, "update", "legal_right", right_id)
    await db.commit()
    await db.refresh(right)
    return LegalRightOut.model_validate(right)


@router.delete("/rights/{right_id}", status_code=204)
async def delete_right(right_id: int, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(LegalRight).where(LegalRight.id == right_id))
    right = result.scalar_one_or_none()
    if not right:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Legal right not found")
    await _log_action(db, current_admin.id, "delete", "legal_right", right_id)
    await db.delete(right)
    await db.commit()

# --- Announcements ---
@router.get("/announcements")
async def list_announcements(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(Announcement).order_by(Announcement.created_at.desc())
    total = (await db.execute(select(func.count(Announcement.id)))).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [AnnouncementOut.model_validate(a) for a in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/announcements", response_model=AnnouncementOut, status_code=201)
async def create_announcement(
    body: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    a = Announcement(message=body.message)
    db.add(a)
    await _log_action(db, current_admin.id, "create", "announcement", a.id)
    await db.commit()
    await db.refresh(a)
    print(f"[ADMIN] {current_admin.email} created announcement #{a.id}")
    return AnnouncementOut.model_validate(a)


@router.delete("/announcements/{announcement_id}", status_code=204)
async def delete_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    await _log_action(db, current_admin.id, "delete", "announcement", announcement_id)
    await db.delete(a)
    await db.commit()


@router.patch("/announcements/{announcement_id}/toggle", response_model=AnnouncementOut)
async def toggle_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    await db.execute(Announcement.__table__.update().values(is_active=False))
    a.is_active = True
    await _log_action(db, current_admin.id, "toggle", "announcement", announcement_id)
    await db.commit()
    await db.refresh(a)
    return AnnouncementOut.model_validate(a)

# --- Audit Log ---
@router.get("/audit-log")
async def list_audit_log(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    admin_id: int | None = Query(None),
    action: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(AuditLog).order_by(AuditLog.created_at.desc())
    count_q = select(func.count(AuditLog.id))
    if admin_id:
        query = query.where(AuditLog.admin_id == admin_id)
        count_q = count_q.where(AuditLog.admin_id == admin_id)
    if action:
        query = query.where(AuditLog.action == action)
        count_q = count_q.where(AuditLog.action == action)
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    from app.schemas import AuditLogOut
    items = [AuditLogOut.model_validate(a) for a in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


# --- Login Attempts ---
@router.get("/login-attempts")
async def list_login_attempts(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    success: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    if not current_admin.is_super:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    query = select(LoginAttempt).order_by(LoginAttempt.created_at.desc())
    count_q = select(func.count(LoginAttempt.id))
    if success is not None:
        query = query.where(LoginAttempt.success == success)
        count_q = count_q.where(LoginAttempt.success == success)
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    from app.schemas import LoginAttemptOut
    items = [LoginAttemptOut.model_validate(a) for a in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


# --- IP Blacklist ---
@router.get("/ip-blacklist")
async def list_ip_blacklist(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    from app.schemas import IPBlacklistOut
    query = select(IPBlacklist).order_by(IPBlacklist.created_at.desc())
    total = (await db.execute(select(func.count(IPBlacklist.id)))).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [IPBlacklistOut.model_validate(b) for b in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/ip-blacklist", status_code=201)
async def add_ip_blacklist(
    body: IPBlacklistCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    from app.schemas import IPBlacklistOut
    existing = await db.execute(select(IPBlacklist).where(IPBlacklist.ip_address == body.ip_address))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="IP already blacklisted")
    entry = IPBlacklist(**body.model_dump(), created_by=current_admin.id)
    db.add(entry)
    await _log_action(db, current_admin.id, "create", "ip_blacklist", entry.id, f"IP: {entry.ip_address}")
    await db.commit()
    await db.refresh(entry)
    print(f"[ADMIN] {current_admin.email} blacklisted IP: {entry.ip_address}")
    return IPBlacklistOut.model_validate(entry)


@router.delete("/ip-blacklist/{entry_id}", status_code=204)
async def remove_ip_blacklist(entry_id: int, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(IPBlacklist).where(IPBlacklist.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await _log_action(db, current_admin.id, "delete", "ip_blacklist", entry_id)
    await db.delete(entry)
    await db.commit()


# --- Detainees ---
@router.get("/detainees")
async def list_detainees(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    from app.schemas import DetaineeOut
    query = select(Detainee).order_by(Detainee.created_at.desc())
    count_q = select(func.count(Detainee.id))
    if status:
        query = query.where(Detainee.status == status)
        count_q = count_q.where(Detainee.status == status)
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [DetaineeOut.model_validate(d) for d in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/detainees", status_code=201)
async def create_detainee(
    body: DetaineeCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    from app.schemas import DetaineeOut
    d = Detainee(**body.model_dump(), reported_by=current_admin.id)
    db.add(d)
    await _log_action(db, current_admin.id, "create", "detainee", d.id)
    await db.commit()
    await db.refresh(d)
    print(f"[ADMIN] {current_admin.email} added detainee: {body.name}")
    return DetaineeOut.model_validate(d)


@router.put("/detainees/{detainee_id}")
async def update_detainee(
    detainee_id: int,
    body: DetaineeUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    from app.schemas import DetaineeOut
    result = await db.execute(select(Detainee).where(Detainee.id == detainee_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(d, field, value)
    d.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "update", "detainee", detainee_id)
    await db.commit()
    await db.refresh(d)
    return DetaineeOut.model_validate(d)


@router.delete("/detainees/{detainee_id}", status_code=204)
async def delete_detainee(detainee_id: int, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(Detainee).where(Detainee.id == detainee_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await _log_action(db, current_admin.id, "delete", "detainee", detainee_id)
    await db.delete(d)
    await db.commit()


# --- Expanded Stats ---
@router.get("/expanded-stats")
async def get_expanded_stats(db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    from sqlalchemy import cast, Date
    # Submissions per day for last 30 days
    thirty_days = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(
            cast(Submission.created_at, Date).label("day"),
            func.count(Submission.id).label("count")
        ).where(
            cast(Submission.created_at, Date) >= thirty_days
        ).group_by("day").order_by("day")
    )
    # Actually let's do simpler stats
    # Type breakdown
    type_breakdown = {}
    for t in ["medical", "legal", "safety", "general"]:
        c = (await db.execute(select(func.count(Submission.id)).where(Submission.type == t))).scalar()
        type_breakdown[t] = c
    
    # Approval rate
    total_reviewed = (await db.execute(select(func.count(Submission.id)).where(Submission.status != "pending"))).scalar()
    total_approved = (await db.execute(select(func.count(Submission.id)).where(Submission.status == "approved"))).scalar()
    approval_rate = round((total_approved / total_reviewed * 100) if total_reviewed > 0 else 0)
    
    # Alert severity breakdown
    severity = {}
    for s in ["green", "yellow", "red"]:
        c = (await db.execute(select(func.count(Alert.id)).where(Alert.is_active == True, Alert.severity == s))).scalar()
        severity[s] = c
    
    # Push subscribers
    push_subs = (await db.execute(select(func.count(PushSubscription.id)))).scalar()
    
    return {
        "type_breakdown": type_breakdown,
        "approval_rate": approval_rate,
        "severity": severity,
        "push_subscribers": push_subs,
    }


# --- Emergency Broadcast ---
@router.post("/broadcast")
async def emergency_broadcast(
    body: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    alert = Alert(**body.model_dump(), created_by=current_admin.id)
    db.add(alert)
    sent = 0
    try:
        sent = await send_push_notification(
            db,
            title=f"🚨 CJP Alert: {body.title}",
            body=body.description[:200],
            url="/live-feed",
        )
    except Exception as e:
        print(f"Broadcast push failed: {e}")
    await _log_action(db, current_admin.id, "broadcast", "alert", alert.id, f"push={sent}")
    await db.commit()
    await db.refresh(alert)
    print(f"[BROADCAST] {current_admin.email} broadcast '{body.title}' → {sent} devices")
    return {"alert_id": alert.id, "push_sent": sent, "severity": body.severity}


# --- CSV Export ---
@router.get("/export/{resource}")
async def export_csv(
    resource: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    import csv, io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    if resource == "contacts":
        writer.writerow(["ID", "Name", "Phone", "Category", "Description", "City", "Verified"])
        result = await db.execute(select(EmergencyContact).order_by(EmergencyContact.category, EmergencyContact.name))
        for c in result.scalars().all():
            writer.writerow([c.id, c.name, c.phone, c.category, c.description, c.city, c.is_verified])
        filename = "emergency-contacts.csv"
    elif resource == "submissions":
        writer.writerow(["ID", "Type", "Description", "Location", "Status", "IP", "Created"])
        result = await db.execute(select(Submission).order_by(Submission.created_at.desc()))
        for s in result.scalars().all():
            writer.writerow([s.id, s.type, s.description, s.location, s.status, s.ip_address, s.created_at.isoformat()])
        filename = "submissions.csv"
    elif resource == "alerts":
        writer.writerow(["ID", "Type", "Title", "Severity", "Location", "Active", "Created"])
        result = await db.execute(select(Alert).order_by(Alert.created_at.desc()))
        for a in result.scalars().all():
            writer.writerow([a.id, a.type, a.title, a.severity, a.location, a.is_active, a.created_at.isoformat()])
        filename = "alerts.csv"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown resource")
    
    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# --- Helper: check blacklist middleware ---
@router.post("/check-ip")
async def check_ip(ip: str, db: AsyncSession = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    result = await db.execute(select(IPBlacklist).where(IPBlacklist.ip_address == ip))
    return {"blacklisted": result.scalar_one_or_none() is not None}


class BatchReviewItem(BaseModel):
    id: int
    status: str = "approved"


@router.post("/submissions/batch-review")
async def batch_review_submissions(
    body: list[BatchReviewItem],
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    now = datetime.now(timezone.utc)
    count = 0
    for item in body:
        result = await db.execute(select(Submission).where(Submission.id == item.id))
        sub = result.scalar_one_or_none()
        if sub and sub.status == "pending":
            sub.status = item.status
            sub.reviewed_by = current_admin.id
            sub.reviewed_at = now
            count += 1
    await db.commit()
    if count:
        await _log_action(db, current_admin.id, "batch_review", "submission", details=f"{count} reviewed")
    await db.commit()
    print(f"[ADMIN] {current_admin.email} batch-reviewed {count} submissions")
    return {"reviewed": count}


@router.post("/sync-helpline")
async def trigger_sync(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Download docx from Google Docs, parse, and upsert data."""
    from app.docx_sync import sync_from_docx
    result = await sync_from_docx()
    status = "error" if result.get("errors") else "synced"
    if result["errors"]:
        print(f"[SYNC] Errors: {'; '.join(result['errors'])}")
    print(f"[SYNC] Contacts: {result['contacts']} · MH: {result['mental_health']} · Aid: {result['aid_orgs']} · News: {result['news']}")
    return {"status": status, **result}


# --- Metro Admin ---
@router.get("/metro/stations", response_model=list[MetroStationOut])
async def admin_list_metro_stations(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(MetroStation).order_by(MetroStation.name))
    stations = result.scalars().all()
    out = []
    for s in stations:
        d = {"id": s.id, "name": s.name, "lines": json_mod.loads(s.lines), "interchange": s.interchange, "type": s.type, "area": s.area, "alternatives": json_mod.loads(s.alternatives), "lat": s.lat, "lng": s.lng}
        out.append(MetroStationOut(**d))
    return out


@router.patch("/metro/stations/{station_id}")
async def toggle_metro_station(
    station_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(MetroStation).where(MetroStation.id == station_id))
    station = result.scalar_one_or_none()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    station.is_active = not station.is_active
    await db.commit()
    return {"id": station.id, "is_active": station.is_active}


@router.get("/metro/disruptions")
async def admin_list_metro_disruptions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(MetroDisruption).order_by(MetroDisruption.created_at.desc())
    count_q = select(func.count(MetroDisruption.id))
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [MetroDisruptionOut.model_validate(d) for d in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/metro/disruptions", response_model=MetroDisruptionOut, status_code=201)
async def admin_create_metro_disruption(
    body: MetroDisruptionCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    d = MetroDisruption(**body.model_dump(), submitted_by=current_admin.id)
    db.add(d)
    await _log_action(db, current_admin.id, "create", "metro_disruption", d.id, f"{body.station_id} → {body.status}")
    await db.commit()
    await db.refresh(d)
    print(f"[ADMIN] {current_admin.email} created metro disruption: {body.station_id} → {body.status}")
    return MetroDisruptionOut.model_validate(d)


@router.put("/metro/disruptions/{disruption_id}", response_model=MetroDisruptionOut)
async def admin_update_metro_disruption(
    disruption_id: int,
    body: MetroDisruptionUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(MetroDisruption).where(MetroDisruption.id == disruption_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Disruption not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(d, field, value)
    d.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "update", "metro_disruption", disruption_id)
    await db.commit()
    await db.refresh(d)
    return MetroDisruptionOut.model_validate(d)


@router.patch("/metro/disruptions/{disruption_id}/feature", response_model=MetroDisruptionOut)
async def admin_feature_metro_disruption(
    disruption_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(MetroDisruption).where(MetroDisruption.id == disruption_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Disruption not found")
    d.featured = not d.featured
    d.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "feature", "metro_disruption", disruption_id, f"featured={d.featured}")
    await db.commit()
    await db.refresh(d)
    return MetroDisruptionOut.model_validate(d)


@router.delete("/metro/disruptions/{disruption_id}", status_code=204)
async def admin_delete_metro_disruption(
    disruption_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(MetroDisruption).where(MetroDisruption.id == disruption_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Disruption not found")
    await _log_action(db, current_admin.id, "delete", "metro_disruption", disruption_id)
    await db.delete(d)
    await db.commit()


# --- Safe Zones Admin ---
@router.get("/safe-zones")
async def admin_list_safe_zones(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(SafeZone).order_by(SafeZone.name))
    return [SafeZoneOut.model_validate(z) for z in result.scalars().all()]


@router.post("/safe-zones", response_model=SafeZoneOut, status_code=201)
async def admin_create_safe_zone(
    body: SafeZoneCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    z = SafeZone(**body.model_dump())
    db.add(z)
    await _log_action(db, current_admin.id, "create", "safe_zone", z.id)
    await db.commit()
    await db.refresh(z)
    return SafeZoneOut.model_validate(z)


@router.put("/safe-zones/{zone_id}", response_model=SafeZoneOut)
async def admin_update_safe_zone(
    zone_id: int,
    body: SafeZoneUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(SafeZone).where(SafeZone.id == zone_id))
    z = result.scalar_one_or_none()
    if not z:
        raise HTTPException(status_code=404, detail="Safe zone not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(z, field, value)
    z.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "update", "safe_zone", zone_id)
    await db.commit()
    await db.refresh(z)
    return SafeZoneOut.model_validate(z)


@router.delete("/safe-zones/{zone_id}", status_code=204)
async def admin_delete_safe_zone(
    zone_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(SafeZone).where(SafeZone.id == zone_id))
    z = result.scalar_one_or_none()
    if not z:
        raise HTTPException(status_code=404, detail="Safe zone not found")
    await _log_action(db, current_admin.id, "delete", "safe_zone", zone_id)
    await db.delete(z)
    await db.commit()


# --- Posts Admin ---
@router.get("/posts")
async def admin_list_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    query = select(Post).order_by(Post.created_at.desc())
    count_q = select(func.count(Post.id))
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [PostOut.model_validate(p) for p in result.scalars().all()]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.post("/posts", response_model=PostOut, status_code=201)
async def admin_create_post(
    body: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    p = Post(**body.model_dump(), created_by=current_admin.id)
    db.add(p)
    await db.commit()
    await db.refresh(p)
    await _log_action(db, current_admin.id, "create", "post", p.id)
    print(f"[ADMIN] {current_admin.email} created post #{p.id}: {body.title}")
    return PostOut.model_validate(p)


@router.put("/posts/{post_id}", response_model=PostOut)
async def admin_update_post(
    post_id: int,
    body: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    p.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "update", "post", post_id)
    await db.commit()
    await db.refresh(p)
    print(f"[ADMIN] {current_admin.email} updated post #{post_id}")
    return PostOut.model_validate(p)


@router.patch("/posts/{post_id}/publish", response_model=PostOut)
async def admin_toggle_publish_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    p.is_published = not p.is_published
    p.updated_at = datetime.now(timezone.utc)
    await _log_action(db, current_admin.id, "publish" if p.is_published else "unpublish", "post", post_id)
    await db.commit()
    await db.refresh(p)
    print(f"[ADMIN] {current_admin.email} {'published' if p.is_published else 'unpublished'} post #{post_id}")
    return PostOut.model_validate(p)


@router.delete("/posts/{post_id}", status_code=204)
async def admin_delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    await _log_action(db, current_admin.id, "delete", "post", post_id)
    await db.delete(p)
    await db.commit()
