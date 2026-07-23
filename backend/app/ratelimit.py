from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import IPBlacklist, LoginAttempt

_store: dict[str, list[datetime]] = defaultdict(list)
RATE = 5
WINDOW = 60

# Track failed login attempts per IP
LOGIN_RATE = 10
LOGIN_WINDOW = 300  # 5 minutes
login_store: dict[str, list[datetime]] = defaultdict(list)


async def rate_limit_submissions(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = datetime.now()
    cutoff = now - timedelta(seconds=WINDOW)
    _store[ip] = [t for t in _store[ip] if t > cutoff]
    if len(_store[ip]) >= RATE:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Try again later.")
    _store[ip].append(now)


async def check_ip_blacklist(request: Request, db: AsyncSession = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    result = await db.execute(select(IPBlacklist).where(IPBlacklist.ip_address == ip))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your IP has been blocked.")


async def check_login_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = datetime.now()
    cutoff = now - timedelta(seconds=LOGIN_WINDOW)
    login_store[ip] = [t for t in login_store[ip] if t > cutoff]
    if len(login_store[ip]) >= LOGIN_RATE:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts. Try again later.")
    login_store[ip].append(now)
