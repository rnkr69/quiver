import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, Relationship, SQLModel

from quiver.models.associations import UserHasRole
from quiver.models.mixins import TimestampMixin
from quiver.models.role import Role


class AdminUser(TimestampMixin, SQLModel, table=True):
    __tablename__ = "admin_users"

    id: str | None = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    email: str = Field(sa_column=sa.Column(sa.String(255), unique=True, nullable=False, index=True))
    password_hash: str = Field(
        sa_column=sa.Column(sa.String(255), nullable=False),
        exclude=True,
    )
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    last_login_at: datetime | None = Field(default=None)

    roles: list[Role] = Relationship(link_model=UserHasRole)
