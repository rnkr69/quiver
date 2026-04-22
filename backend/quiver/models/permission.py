import re
import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import validates
from sqlmodel import Field, SQLModel

_PERM_NAME_RE = re.compile(r'^[a-z0-9_]+\.[a-z0-9_]+$')


class Permission(SQLModel, table=True):
    __tablename__ = "permissions"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    name: str = Field(sa_column=sa.Column(sa.String(150), unique=True, nullable=False, index=True))
    display_name: str = Field(max_length=200)
    group: str = Field(sa_column=sa.Column(sa.String(100), nullable=False, index=True))

    @validates("name")
    def validate_name(self, key: str, value: str) -> str:
        if not _PERM_NAME_RE.match(value):
            raise ValueError(
                f"Permission name '{value}' is invalid. Must match ^[a-z0-9_]+\\.[a-z0-9_]+$ (e.g. 'users.list')."
            )
        return value
