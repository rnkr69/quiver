from __future__ import annotations

from pydantic import BaseModel


class PermissionResponse(BaseModel):
    id: str
    name: str
    display_name: str
    group: str


class PermissionGroupResponse(BaseModel):
    group: str
    permissions: list[PermissionResponse]


class RoleCreate(BaseModel):
    name: str
    display_name: str
    description: str | None = None


class RoleUpdate(BaseModel):
    display_name: str | None = None
    description: str | None = None


class RoleResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: str | None
    permissions_count: int
    users_count: int


class RoleDetailResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: str | None
    permissions: list[PermissionResponse]


class RolePermissionsUpdate(BaseModel):
    permission_ids: list[str]
