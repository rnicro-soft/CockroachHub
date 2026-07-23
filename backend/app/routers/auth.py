from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt as jose_jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, get_current_admin, hash_password, verify_password
from app.config import settings
from app.database import get_db
from app.models import Admin, LoginAttempt, TokenBlacklist
from app.ratelimit import check_login_rate_limit
from app.schemas import AdminCreate, AdminOut, LoginRequest, PasswordChangeRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def _log_login(db: AsyncSession, email: str, ip: str | None, success: bool):
    db.add(LoginAttempt(email=email, ip_address=ip, success=success))
    await db.commit()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db), _=Depends(check_login_rate_limit)):
    ip = request.client.host if request.client else "unknown"
    result = await db.execute(select(Admin).where(Admin.email == body.email))
    admin = result.scalar_one_or_none()
    if not admin or not verify_password(body.password, admin.password_hash):
        await _log_login(db, body.email, ip, False)
        print(f"[AUTH] Login FAILED — {body.email} ({ip})")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    admin.last_login = datetime.now(timezone.utc)
    await _log_login(db, body.email, ip, True)
    await db.commit()

    token = create_access_token({"sub": admin.id})
    print(f"[AUTH] Login SUCCESS — {admin.name} ({ip})")
    return TokenResponse(access_token=token, admin=AdminOut.model_validate(admin))


@router.get("/me", response_model=AdminOut)
async def get_me(admin: Admin = Depends(get_current_admin)):
    return AdminOut.model_validate(admin)


@router.post("/change-password", response_model=AdminOut)
async def change_password(
    body: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    if not verify_password(body.current_password, current_admin.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_admin.password_hash = hash_password(body.new_password)
    current_admin.must_reset_pw = False
    await db.commit()
    await db.refresh(current_admin)
    print(f"[AUTH] Password changed — {current_admin.email}")
    return AdminOut.model_validate(current_admin)


@router.post("/register", response_model=AdminOut)
async def register(
    body: AdminCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    if not current_admin.is_super:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can create new admins")

    result = await db.execute(select(Admin).where(Admin.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    admin = Admin(email=body.email, password_hash=hash_password(body.password), name=body.name, must_reset_pw=True)
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return AdminOut.model_validate(admin)


@router.post("/logout")
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db),
):
    if credentials:
        try:
            payload = jose_jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                db.add(TokenBlacklist(jti=jti, expires_at=datetime.fromtimestamp(exp, tz=timezone.utc)))
                await db.commit()
        except Exception:
            pass
    return {"status": "logged_out"}


@router.get("/admins", response_model=list[AdminOut])
async def list_admins(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    if not current_admin.is_super:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can list admins")
    result = await db.execute(select(Admin).order_by(Admin.created_at.desc()))
    return [AdminOut.model_validate(a) for a in result.scalars().all()]
