import re
import uuid
from datetime import datetime
from typing import List, Optional

import sqlalchemy as sa
from sqlalchemy.orm import validates
from sqlmodel import Field, Relationship, SQLModel

from quiver.models.associations import RoleHasPermission
from quiver.models.permission import Permission

_ROLE_NAME_RE = re.compile(r'^[a-z0-9_]+$')


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    name: str = Field(sa_column=sa.Column(sa.String(100), unique=True, nullable=False, index=True))
    display_name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    permissions: List[Permission] = Relationship(link_model=RoleHasPermission)

    @validates("name")
    def validate_name(self, key: str, value: str) -> str:
        if not _ROLE_NAME_RE.match(value):
            raise ValueError(
                f"Role name '{value}' is invalid. Must match ^[a-z0-9_]+$ (lowercase, digits, underscores)."
            )
        return value
