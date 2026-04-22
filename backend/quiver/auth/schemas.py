from __future__ import annotations

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    redirect_to: str = "/admin"


class MeResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    roles: list[str]
    permissions: list[str]
    is_superuser: bool
