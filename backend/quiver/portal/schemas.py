from __future__ import annotations

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    current_password: str | None = None
    new_password: str | None = None
