"""
Google Docx parser for helpline data.
Explicit table-index-based parsing since the doc layout is known.
Each section isolated — one failure doesn't affect others.
"""
import json
import re
import urllib.request
from io import BytesIO
from typing import Any

from docx import Document


NTFY_TOPIC = "cockroachhub"
DOCX_URL = "https://docs.google.com/document/d/1y5NTy0f_L6sBw3s8aKAnQAoDEG_EdrmLR38o0_YCcqM/export?format=docx"


def _clean(val: str | None) -> str:
    if not val:
        return ""
    val = re.sub(r"[\U0001F300-\U0001FAFF\U0000FE00-\U0000FE0F\u20E3\u2B50\u2728\u2764\u2665\u2600-\u27BF]", "", val)
    val = re.sub(r"[⭐️🌟⭐✨🩹💊📌🔹🔸📍🚨🪳✅❌⚠️➡️🔴🟡🟢🟠💬📞✋🙏🔥⭐\ufe0f]", "", val)
    return val.strip()


def _send_ntfy(title: str, message: str, status: str = "ok"):
    try:
        tags = {"ok": "white_check_mark", "error": "warning"}.get(status, "information_source")
        data = json.dumps({"topic": NTFY_TOPIC, "title": title, "message": message, "tags": [tags]}).encode()
        req = urllib.request.Request("https://ntfy.sh", data=data, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"[NTFY] {e}")


def _cells(row) -> list[str]:
    return [c.text.strip() for c in row.cells]


async def sync_from_docx() -> dict[str, Any]:
    """Download docx, parse known tables, upsert into DB. Returns summary."""
    from app.database import async_session
    from app.models import AidOrganization, EmergencyContact, MentalHealthProvider, NewsSource
    from sqlalchemy import select

    summary = {"contacts": 0, "mental_health": 0, "aid_orgs": 0, "news": 0, "errors": []}

    # Download docx
    try:
        req = urllib.request.Request(DOCX_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            doc = Document(BytesIO(resp.read()))
    except Exception as e:
        summary["errors"].append(f"Download failed: {e}")
        _send_ntfy("Helpline Sync Failed", str(e), "error")
        return summary

    tables = doc.tables
    # Known table index → (type, category)
    # 0: heading, 1: heading, 2: heading, 3: Medical contacts,
    # 4: Legal (Delhi advocates), 5: Legal (volunteers), 6: Legal (Mumbai),
    # 7: Mental Health (online), 8: Mental Health (offline), 9: Support groups,
    # 10: Accommodation links, 11: Aid orgs, 12: Contact (aid extras), 13: News sources

    async with async_session() as db:
        # ── Table 10: Accommodation links (skip — unstructured) ──

        # ── Table 12: Contact aid extras ──────────────────────────
        if len(tables) > 12:
            try:
                count = 0
                for row in tables[12].rows[1:]:
                    c = _cells(row)
                    if not c[0] or len(c[0]) < 3:
                        continue
                    parts = c[0].split(" on IG")
                    name = _clean(parts[0]) if parts else _clean(c[0])
                    purpose = _clean(c[2]) if len(c) > 2 else ""
                    if not name or len(name) < 3:
                        continue
                    contact = c[0].strip()
                    result = await db.execute(select(AidOrganization).where(AidOrganization.name == name))
                    if not result.scalar_one_or_none():
                        db.add(AidOrganization(name=name, purpose=purpose, contact=contact))
                        count += 1
                summary["aid_orgs"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"Contact aid table 12: {e}")
                await db.rollback()

        # ── Table 13: News sources ───────────────────────────────
        # ── Table 3: Medical contacts ─────────────────────────────
        if len(tables) > 3:
            try:
                count = 0
                for row in tables[3].rows[1:]:
                    c = _cells(row)
                    if len(c) < 2 or not c[0] or not c[1]:
                        continue
                    name = _clean(c[0])
                    phone = _clean(c[1].split("/")[0].split()[0])  # take first number
                    if not name or not phone:
                        continue
                    result = await db.execute(select(EmergencyContact).where(
                        EmergencyContact.name == name, EmergencyContact.phone == phone))
                    if not result.scalar_one_or_none():
                        db.add(EmergencyContact(name=name, phone=phone, category="medical",
                                description=_clean(c[2]) if len(c) > 2 else ""))
                        count += 1
                summary["contacts"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"Medical table: {e}")
                await db.rollback()

        # ── Tables 4, 5, 6: Legal contacts ───────────────────────
        for ti in (4, 5, 6):
            if len(tables) <= ti:
                continue
            try:
                count = 0
                start = 1 if _cells(tables[ti].rows[0])[0] else 2  # skip empty header
                for row in tables[ti].rows[start:]:
                    c = _cells(row)
                    if len(c) < 2 or not c[0]:
                        continue
                    name = _clean(c[0])
                    phone = _clean(c[1].split("/")[0].split()[0]) if len(c) > 1 else ""
                    if not name or not phone:
                        continue
                    email = _clean(c[2]) if len(c) > 2 else ""
                    city = _clean(c[3]) if len(c) > 3 else ""
                    cat = "mumbai" if ti == 6 else "legal"
                    result = await db.execute(select(EmergencyContact).where(
                        EmergencyContact.name == name, EmergencyContact.phone == phone))
                    if not result.scalar_one_or_none():
                        desc = f"Email: {email}" if email and "@" in email else ""
                        db.add(EmergencyContact(name=name, phone=phone,
                                description=desc, city=city, category=cat))
                        count += 1
                summary["contacts"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"Legal table {ti}: {e}")
                await db.rollback()

        # ── Table 7: Mental Health (online) ──────────────────────
        if len(tables) > 7:
            try:
                count = 0
                for row in tables[7].rows[1:]:
                    c = _cells(row)
                    if not c[0]:
                        continue
                    name = _clean(c[0])
                    contact = _clean(c[1]) if len(c) > 1 else ""
                    details = _clean(c[2]) if len(c) > 2 else ""
                    if not name:
                        continue
                    result = await db.execute(select(MentalHealthProvider).where(MentalHealthProvider.name == name))
                    if not result.scalar_one_or_none():
                        db.add(MentalHealthProvider(name=name, contact=contact,
                                email=contact if "@" in contact else "", details=details,
                                service_type="online"))
                        count += 1
                summary["mental_health"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"MH online table: {e}")
                await db.rollback()

        # ── Table 8: Mental Health (offline) ─────────────────────
        if len(tables) > 8:
            try:
                count = 0
                for row in tables[8].rows[1:]:
                    c = _cells(row)
                    if not c[0]:
                        continue
                    name = _clean(c[0])
                    email = _clean(c[1]) if len(c) > 1 else ""
                    location = _clean(c[2]) if len(c) > 2 else ""
                    details = _clean(c[3]) if len(c) > 3 else ""
                    if not name:
                        continue
                    result = await db.execute(select(MentalHealthProvider).where(MentalHealthProvider.name == name))
                    if not result.scalar_one_or_none():
                        db.add(MentalHealthProvider(name=name, email=email,
                                location=location, details=details, service_type="offline"))
                        count += 1
                summary["mental_health"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"MH offline table: {e}")
                await db.rollback()

        # ── Table 11: Aid organizations ──────────────────────────
        if len(tables) > 11:
            try:
                count = 0
                for row in tables[11].rows[1:]:
                    c = _cells(row)
                    if not c[0]:
                        continue
                    name = _clean(c[0])
                    purpose = _clean(c[1]) if len(c) > 1 else ""
                    link = _clean(c[2]) if len(c) > 2 else ""
                    if not name:
                        continue
                    result = await db.execute(select(AidOrganization).where(AidOrganization.name == name))
                    if not result.scalar_one_or_none():
                        db.add(AidOrganization(name=name, purpose=purpose, link=link))
                        count += 1
                summary["aid_orgs"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"Aid table: {e}")
                await db.rollback()

        # ── Table 13: News sources ───────────────────────────────
        if len(tables) > 13:
            try:
                count = 0
                for row in tables[12].rows[1:]:
                    c = _cells(row)
                    if not c[0]:
                        continue
                    name = _clean(c[0])
                    link = _clean(c[2]) if len(c) > 2 else ""
                    desc = _clean(c[3]) if len(c) > 3 else ""
                    if not name or not link:
                        continue
                    result = await db.execute(select(NewsSource).where(NewsSource.name == name))
                    if not result.scalar_one_or_none():
                        db.add(NewsSource(name=name, link=link, description=desc, platform="instagram"))
                        count += 1
                summary["news"] += count
                await db.commit()
            except Exception as e:
                summary["errors"].append(f"News table: {e}")
                await db.rollback()

    # Notify
    msg = (
        f"Contacts: {summary['contacts']} · MH: {summary['mental_health']} · "
        f"Aid: {summary['aid_orgs']} · News: {summary['news']}"
    )
    if summary["errors"]:
        msg += f" · Errors: {len(summary['errors'])}"
    _send_ntfy("Helpline Sync Complete" if not summary["errors"] else "Helpline Sync Partial",
               msg, "ok" if not summary["errors"] else "error")
    return summary
