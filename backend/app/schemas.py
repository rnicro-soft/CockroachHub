from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# --- Auth ---
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: "AdminOut"


class AdminCreate(BaseModel):
    email: str
    password: str
    name: str


class AdminOut(BaseModel):
    id: int
    email: str
    name: str
    is_super: bool
    must_reset_pw: bool
    created_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


# --- Alert ---
class AlertCreate(BaseModel):
    type: str = Field(max_length=50)
    title: str = Field(max_length=500)
    description: str = Field(max_length=5000)
    severity: str = Field(max_length=20)
    location: str | None = Field(None, max_length=500)


class AlertUpdate(BaseModel):
    type: str | None = None
    title: str | None = None
    description: str | None = None
    severity: str | None = None
    location: str | None = None
    is_active: bool | None = None


class AlertOut(BaseModel):
    id: int
    type: str
    title: str
    description: str
    severity: str
    location: str | None
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Submission ---
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int

    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    type: str = Field("", max_length=50)
    description: str = Field("", max_length=5000)
    location: str | None = Field(None, max_length=500)


class SubmissionReview(BaseModel):
    status: str
    action: str = "approve"


class SubmissionOut(BaseModel):
    id: int
    type: str
    description: str
    location: str | None
    status: str
    reviewed_by: int | None
    reviewed_at: datetime | None
    ip_address: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- FactCheck ---
class FactCheckCreate(BaseModel):
    title: str
    claim: str
    verdict: str
    explanation: str
    source: str | None = None


class FactCheckUpdate(BaseModel):
    title: str | None = None
    claim: str | None = None
    verdict: str | None = None
    explanation: str | None = None
    source: str | None = None
    is_published: bool | None = None


class FactCheckOut(BaseModel):
    id: int
    title: str
    claim: str
    verdict: str
    explanation: str
    source: str | None
    is_published: bool
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Emergency Contact ---
class ContactCreate(BaseModel):
    name: str = Field(max_length=255)
    phone: str = Field(max_length=50)
    category: str = Field(max_length=50)
    description: str | None = Field(None, max_length=2000)
    city: str | None = Field(None, max_length=100)


class ContactUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    category: str | None = None
    description: str | None = None
    city: str | None = None
    is_verified: bool | None = None


class ContactOut(BaseModel):
    id: int
    name: str
    phone: str
    category: str
    description: str | None
    city: str | None
    is_verified: bool
    source: str | None = None
    last_verified_at: datetime | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Legal Right ---
class LegalRightCreate(BaseModel):
    title: str
    content: str
    category: str
    sort_order: int = 0


# --- Announcement ---
class AnnouncementCreate(BaseModel):
    message: str


class AnnouncementUpdate(BaseModel):
    message: str | None = None
    is_active: bool | None = None


class AnnouncementOut(BaseModel):
    id: int
    message: str
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# --- Password ---
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


# --- Audit Log ---
class AuditLogOut(BaseModel):
    id: int
    admin_id: int
    action: str
    resource_type: str
    resource_id: int | None
    details: str | None
    ip_address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Login Attempt ---
class LoginAttemptOut(BaseModel):
    id: int
    email: str
    ip_address: str | None
    success: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# --- IP Blacklist ---
class IPBlacklistCreate(BaseModel):
    ip_address: str
    reason: str | None = None


class IPBlacklistOut(BaseModel):
    id: int
    ip_address: str
    reason: str | None
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Detainee ---
class DetaineeCreate(BaseModel):
    name: str
    phone: str | None = None
    location: str | None = None
    status: str = "detained"
    notes: str | None = None


class DetaineeUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    location: str | None = None
    status: str | None = None
    notes: str | None = None


class DetaineeOut(BaseModel):
    id: int
    name: str
    phone: str | None
    location: str | None
    status: str
    notes: str | None
    reported_by: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LegalRightUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    sort_order: int | None = None


class LegalRightOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    sort_order: int
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Metro ---
class MetroLineOut(BaseModel):
    name: str
    color: str


class MetroStationOut(BaseModel):
    id: str
    name: str
    lines: list[MetroLineOut]
    interchange: bool
    type: str
    area: str
    alternatives: list[str]
    lat: float
    lng: float
    is_active: bool = True

    model_config = {"from_attributes": True}


class MetroDisruptionOut(BaseModel):
    id: int
    station_id: str
    status: str
    reason: str
    source: str
    submitted_by: int | None = None
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MetroSubmitRequest(BaseModel):
    station_id: str
    status: str = Field(max_length=20)
    reason: str = Field(max_length=2000)


class MetroDisruptionCreate(BaseModel):
    station_id: str
    status: str = Field(max_length=20)
    reason: str = Field(max_length=2000)
    source: str = "admin"
    published: bool = True


class MetroDisruptionUpdate(BaseModel):
    status: str | None = None
    reason: str | None = None
    published: bool | None = None


# --- Mental Health ---
class MentalHealthOut(BaseModel):
    id: int
    name: str
    contact: str | None = None
    email: str | None = None
    service_type: str
    details: str | None = None
    location: str | None = None

    model_config = {"from_attributes": True}


# --- Aid Organizations ---
class AidOrganizationOut(BaseModel):
    id: int
    name: str
    purpose: str | None = None
    contact: str | None = None
    link: str | None = None
    category: str

    model_config = {"from_attributes": True}


# --- News Sources ---
class NewsSourceOut(BaseModel):
    id: int
    name: str
    platform: str
    link: str
    description: str | None = None
    category: str

    model_config = {"from_attributes": True}


# --- Safe Zones ---
class SafeZoneOut(BaseModel):
    id: int
    name: str
    type: str
    description: str | None = None
    status: str
    lat: float
    lng: float
    created_at: datetime

    model_config = {"from_attributes": True}


class SafeZoneCreate(BaseModel):
    name: str = Field(max_length=255)
    type: str = Field(max_length=50)
    description: str | None = Field(None, max_length=2000)
    status: str = "active"
    lat: float
    lng: float


class SafeZoneUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    description: str | None = None
    status: str | None = None
    lat: float | None = None
    lng: float | None = None
