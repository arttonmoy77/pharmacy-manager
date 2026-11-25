from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class MembershipView(BaseModel):
    tenant_id: UUID
    role: str


class UserView(BaseModel):
    id: UUID
    email: str
    display_name: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    user: UserView
    memberships: list[MembershipView]


class BranchCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=24, pattern=r"^[A-Za-z0-9_-]+$")
    country_code: str = Field(min_length=2, max_length=2, pattern=r"^[A-Za-z]{2}$")
    currency_code: str = Field(min_length=3, max_length=3, pattern=r"^[A-Za-z]{3}$")
    timezone: str = Field(min_length=1, max_length=64)

    @field_validator("timezone")
    @classmethod
    def valid_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("Use a recognized IANA timezone") from exc
        return value

    @field_validator("code", "country_code", "currency_code")
    @classmethod
    def normalize_codes(cls, value: str) -> str:
        return value.strip().upper()


class BranchView(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    code: str
    country_code: str
    currency_code: str
    timezone: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
