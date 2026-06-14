from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class UserHasRole(SQLModel, table=True):
    __tablename__ = "user_has_roles"

    user_id: str = Field(
        sa_column=sa.Column(sa.String(36), sa.ForeignKey("admin_users.id"), primary_key=True)
    )
    role_id: str = Field(
        sa_column=sa.Column(sa.String(36), sa.ForeignKey("roles.id"), primary_key=True)
    )
    assigned_at: datetime = Field(default_factory=datetime.utcnow)


class RoleHasPermission(SQLModel, table=True):
    __tablename__ = "role_has_permissions"

    role_id: str = Field(
        sa_column=sa.Column(sa.String(36), sa.ForeignKey("roles.id"), primary_key=True)
    )
    permission_id: str = Field(
        sa_column=sa.Column(sa.String(36), sa.ForeignKey("permissions.id"), primary_key=True)
    )
