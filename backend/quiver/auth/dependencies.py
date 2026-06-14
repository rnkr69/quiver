from __future__ import annotations

from typing import Any

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from quiver.auth.jwt import decode_access_token
from quiver.exceptions import QuiverForbidden, QuiverUnauthorized

_bearer = HTTPBearer(auto_error=False)


async def require_authenticated(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict[str, Any]:
    if not credentials:
        raise QuiverUnauthorized("Authentication required.")
    return decode_access_token(credentials.credentials)


def require_permission(perm: str):
    async def _dep(payload: dict[str, Any] = Depends(require_authenticated)) -> dict[str, Any]:
        if payload.get("is_superuser"):
            return payload
        if perm not in payload.get("permissions", []):
            raise QuiverForbidden(f"Permission '{perm}' required.")
        return payload

    return _dep


def require_any_role(roles: list[str]):
    async def _dep(payload: dict[str, Any] = Depends(require_authenticated)) -> dict[str, Any]:
        if payload.get("is_superuser"):
            return payload
        user_roles = set(payload.get("roles", []))
        if not user_roles.intersection(roles):
            raise QuiverForbidden(f"One of roles {roles} required.")
        return payload

    return _dep
