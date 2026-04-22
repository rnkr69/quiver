from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from quiver.models.mixins import TimestampMixin


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    user_id: str = Field(
        sa_column=sa.Column(sa.String(36), sa.ForeignKey("admin_users.id"), nullable=False, index=True)
    )
    token_hash: str = Field(
        sa_column=sa.Column(sa.String(64), nullable=False, index=True)
    )
    expires_at: datetime = Field()
    revoked_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_agent: Optional[str] = Field(default=None, max_length=512)
    ip_address: Optional[str] = Field(default=None, max_length=45)


class PasswordResetToken(SQLModel, table=True):
    __tablename__ = "password_reset_tokens"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    user_id: str = Field(
        sa_column=sa.Column(sa.String(36), sa.ForeignKey("admin_users.id"), nullable=False)
    )
    token_hash: str = Field(
        sa_column=sa.Column(sa.String(64), nullable=False, index=True)
    )
    expires_at: datetime = Field()
    used_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
