import json
import os

from pywebpush import webpush, WebPushException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings

VAPID_PRIVATE_KEY_FILE = ".vapid_private.pem"
VAPID_PUBLIC_KEY_FILE = ".vapid_public.pem"


def _ensure_vapid_keys():
    """Generate VAPID keys if they don't exist. Returns (public_key, private_key)."""
    if os.path.exists(VAPID_PRIVATE_KEY_FILE) and os.path.exists(VAPID_PUBLIC_KEY_FILE):
        with open(VAPID_PUBLIC_KEY_FILE) as f:
            public_key = f.read().strip()
        return public_key, None  # private already on disk

    from py_vapid import Vapid
    v = Vapid()
    v.generate_keys()
    with open(VAPID_PRIVATE_KEY_FILE, "w") as f:
        f.write(v.private_key.decode() if isinstance(v.private_key, bytes) else v.private_key)
    with open(VAPID_PUBLIC_KEY_FILE, "w") as f:
        f.write(v.public_key.decode() if isinstance(v.public_key, bytes) else v.public_key)
    return v.public_key.decode() if isinstance(v.public_key, bytes) else v.public_key, v.private_key.decode() if isinstance(v.private_key, bytes) else v.private_key


def get_vapid_public_key() -> str:
    key, _ = _ensure_vapid_keys()
    return key


async def send_push_notification(db: AsyncSession, title: str, body: str, url: str = "/live-feed"):
    from app.models import PushSubscription

    result = await db.execute(select(PushSubscription))
    subs = result.scalars().all()

    if not subs:
        return 0

    _ensure_vapid_keys()
    with open(VAPID_PRIVATE_KEY_FILE) as f:
        private_key = f.read().strip()

    payload = json.dumps({"title": title, "body": body, "url": url, "icon": "/icons/icon-192.png"})
    sent = 0

    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"auth": sub.auth, "p256dh": sub.p256dh},
                },
                data=payload,
                vapid_private_key=private_key,
                vapid_claims={"sub": f"mailto:{settings.admin_email}"},
            )
            sent += 1
        except WebPushException as e:
            # Subscription expired
            if e.response and e.response.status_code == 410:
                await db.delete(sub)
            continue

    await db.commit()
    return sent
