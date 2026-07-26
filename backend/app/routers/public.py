import asyncio
import json as json_mod
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel

from app.database import get_db
from app.models import Admin, AidOrganization, Alert, Announcement, BusRoute, EmergencyContact, FactCheck, GroupCheckin, LegalRight, MentalHealthProvider, MetroDisruption, MetroStation, NewsSource, Post, PushSubscription, SafeZone, Submission
from app.push import get_vapid_public_key
from app.ratelimit import check_ip_blacklist, rate_limit_submissions
from app.schemas import AidOrganizationOut, AlertOut, AnnouncementOut, BusRouteOut, ContactOut, FactCheckOut, GroupCreateRequest, GroupJoinRequest, GroupCheckinRequest, GroupMemberOut, GroupStatusOut, LegalRightOut, MentalHealthOut, MetroDisruptionOut, MetroStationOut, MetroSubmitRequest, NewsSourceOut, PostOut, SafeZoneOut, SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/alerts", response_model=list[AlertOut])
async def get_alerts(
    type: str | None = Query(None),
    severity: str | None = Query(None),
    q: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(Alert).where(Alert.is_active == True).order_by(Alert.created_at.desc())
    if type:
        query = query.where(Alert.type == type)
    if severity:
        query = query.where(Alert.severity == severity)
    if q:
        query = query.where(Alert.title.ilike(f"%{q}%") | Alert.description.ilike(f"%{q}%") | Alert.location.ilike(f"%{q}%"))
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return [AlertOut.model_validate(a) for a in result.scalars().all()]


@router.get("/alerts/stream")
async def alert_stream(request: Request, db: AsyncSession = Depends(get_db)):
    async def event_generator():
        last_id = 0
        try:
            while True:
                if await request.is_disconnected():
                    break
                result = await db.execute(
                    select(Alert).where(Alert.id > last_id, Alert.is_active == True).order_by(Alert.id)
                )
                new_alerts = result.scalars().all()
                for a in new_alerts:
                    last_id = a.id
                    d = AlertOut.model_validate(a).model_dump()
                    yield f"data: {json.dumps(d, default=str)}\n\n"
                await asyncio.sleep(5)
        except asyncio.CancelledError:
            pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/emergency-contacts", response_model=list[ContactOut])
async def get_contacts(category: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    query = select(EmergencyContact).order_by(EmergencyContact.category, EmergencyContact.name)
    if category:
        query = query.where(EmergencyContact.category == category)
    result = await db.execute(query)
    return [ContactOut.model_validate(c) for c in result.scalars().all()]


@router.get("/legal-rights", response_model=list[LegalRightOut])
async def get_legal_rights(category: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    query = select(LegalRight).order_by(LegalRight.sort_order)
    if category:
        query = query.where(LegalRight.category == category)
    result = await db.execute(query)
    return [LegalRightOut.model_validate(r) for r in result.scalars().all()]


@router.get("/fact-checks", response_model=list[FactCheckOut])
async def get_fact_checks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FactCheck).where(FactCheck.is_published == True).order_by(FactCheck.created_at.desc())
    )
    return [FactCheckOut.model_validate(c) for c in result.scalars().all()]


class PushSubBody(BaseModel):
    endpoint: str
    auth: str
    p256dh: str


@router.get("/push/vapid-key")
async def vapid_public_key():
    return {"public_key": get_vapid_public_key()}


@router.post("/push/subscribe", status_code=201)
async def subscribe_push(body: PushSubBody, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(PushSubscription).where(PushSubscription.endpoint == body.endpoint))
    if not existing.scalar_one_or_none():
        sub = PushSubscription(endpoint=body.endpoint, auth=body.auth, p256dh=body.p256dh)
        db.add(sub)
        await db.commit()
    return {"status": "subscribed"}


@router.post("/push/unsubscribe", status_code=200)
async def unsubscribe_push(body: PushSubBody, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PushSubscription).where(PushSubscription.endpoint == body.endpoint))
    sub = result.scalar_one_or_none()
    if sub:
        await db.delete(sub)
        await db.commit()
    return {"status": "unsubscribed"}


@router.get("/announcement", response_model=AnnouncementOut | None)
async def get_active_announcement(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement).where(Announcement.is_active == True).order_by(Announcement.created_at.desc()).limit(1)
    )
    a = result.scalar_one_or_none()
    return AnnouncementOut.model_validate(a) if a else None


@router.post("/submissions", response_model=SubmissionOut, status_code=201)
async def submit_report(
    body: SubmissionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _=Depends(rate_limit_submissions),
    __=Depends(check_ip_blacklist),
):
    submission = Submission(
        type=body.type,
        description=body.description,
        location=body.location,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    print(f"[SUBMIT] type={body.type} loc={body.location or 'none'}")
    return SubmissionOut.model_validate(submission)


# --- Metro ---
@router.get("/metro/stations", response_model=list[MetroStationOut])
async def get_metro_stations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MetroStation).where(MetroStation.is_active == True).order_by(MetroStation.name))
    stations = result.scalars().all()
    out = []
    for s in stations:
        d = {"id": s.id, "name": s.name, "lines": json_mod.loads(s.lines), "interchange": s.interchange, "type": s.type, "area": s.area, "alternatives": json_mod.loads(s.alternatives), "lat": s.lat, "lng": s.lng}
        out.append(MetroStationOut(**d))
    return out


@router.get("/metro/disruptions", response_model=list[MetroDisruptionOut])
async def get_metro_disruptions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MetroDisruption).where(MetroDisruption.published == True).order_by(MetroDisruption.created_at.desc())
    )
    return [MetroDisruptionOut.model_validate(d) for d in result.scalars().all()]


@router.post("/metro/submit", status_code=201)
async def submit_metro_disruption(
    body: MetroSubmitRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _=Depends(rate_limit_submissions),
    __=Depends(check_ip_blacklist),
):
    station = await db.execute(select(MetroStation).where(MetroStation.id == body.station_id))
    if not station.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Station not found")
    d = MetroDisruption(station_id=body.station_id, status=body.status, reason=body.reason, source="crowd", published=False)
    db.add(d)
    await db.commit()
    await db.refresh(d)
    print(f"[METRO] Crowd report: {body.station_id} → {body.status}")
    return MetroDisruptionOut.model_validate(d)


# --- Bus Routes ---
@router.get("/bus-routes", response_model=list[BusRouteOut])
async def get_bus_routes(direction: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(BusRoute).order_by(BusRoute.direction, BusRoute.bus_number)
    if direction:
        query = query.where(BusRoute.direction.ilike(f"%{direction}%"))
    result = await db.execute(query)
    return [BusRouteOut.model_validate(r) for r in result.scalars().all()]


# --- Group Check-in ---
import secrets
import string


@router.post("/group/create")
async def group_create(body: GroupCreateRequest, request: Request, db: AsyncSession = Depends(get_db)):
    code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    member = GroupCheckin(group_code=code, member_name=body.member_name)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return {"group_code": code, "member": GroupMemberOut.model_validate(member)}


@router.post("/group/join")
async def group_join(body: GroupJoinRequest, request: Request, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(GroupCheckin).where(GroupCheckin.group_code == body.group_code, GroupCheckin.member_name == body.member_name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Name already used in this group")
    member = GroupCheckin(group_code=body.group_code, member_name=body.member_name)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return {"member": GroupMemberOut.model_validate(member)}


@router.post("/group/checkin")
async def group_checkin(body: GroupCheckinRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GroupCheckin).where(GroupCheckin.group_code == body.group_code, GroupCheckin.member_name == body.member_name))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    member.lat = body.lat
    member.lng = body.lng
    member.status = body.status
    member.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(member)
    return GroupMemberOut.model_validate(member)


@router.get("/group/{group_code}")
async def group_status(group_code: str, db: AsyncSession = Depends(get_db)):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    stale = await db.execute(select(GroupCheckin).where(GroupCheckin.group_code == group_code, GroupCheckin.updated_at < cutoff))
    for m in stale.scalars().all():
        await db.delete(m)
    await db.commit()
    result = await db.execute(select(GroupCheckin).where(GroupCheckin.group_code == group_code).order_by(GroupCheckin.updated_at.desc()))
    members = [GroupMemberOut.model_validate(m) for m in result.scalars().all()]
    return {"group_code": group_code, "members": members}


# --- Mental Health ---
@router.get("/mental-health", response_model=list[MentalHealthOut])
async def get_mental_health(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MentalHealthProvider).order_by(MentalHealthProvider.name))
    return [MentalHealthOut.model_validate(m) for m in result.scalars().all()]


# --- Aid Organizations ---
@router.get("/aid-organizations", response_model=list[AidOrganizationOut])
async def get_aid_organizations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AidOrganization).order_by(AidOrganization.name))
    return [AidOrganizationOut.model_validate(a) for a in result.scalars().all()]


# --- News Sources ---
@router.get("/news-sources", response_model=list[NewsSourceOut])
async def get_news_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsSource).order_by(NewsSource.name))
    return [NewsSourceOut.model_validate(n) for n in result.scalars().all()]


# --- Posts ---
@router.get("/posts", response_model=list[PostOut])
async def get_posts(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.is_published == True).order_by(Post.created_at.desc()).offset(offset).limit(limit))
    posts = result.scalars().all()
    out = []
    for p in posts:
        r = await db.execute(select(Admin).where(Admin.id == p.created_by))
        a = r.scalar_one_or_none()
        d = PostOut.model_validate(p).model_dump()
        d["author_name"] = a.name if a else "Admin"
        out.append(PostOut(**d))
    return out


@router.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.id == post_id, Post.is_published == True))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    r = await db.execute(select(Admin).where(Admin.id == p.created_by))
    a = r.scalar_one_or_none()
    d = PostOut.model_validate(p).model_dump()
    d["author_name"] = a.name if a else "Admin"
    return PostOut(**d)


# --- Safe Zones ---
@router.get("/safe-zones", response_model=list[SafeZoneOut])
async def get_safe_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SafeZone).order_by(SafeZone.name))
    return [SafeZoneOut.model_validate(z) for z in result.scalars().all()]
