from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr

from quiver.rbac.schemas import RoleResponse


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    is_superuser: bool = False
    role_ids: list[str] = []


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    is_superuser: bool | None = None
    role_ids: list[str] | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_superuser: bool
    last_login_at: datetime | None
    created_at: datetime
    roles: list[RoleResponse]


class UserListResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_superuser: bool
    last_login_at: datetime | None
    roles: list[RoleResponse]
