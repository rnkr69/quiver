from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

from jose import ExpiredSignatureError, JWTError, jwt

from quiver.exceptions import QuiverUnauthorized

if TYPE_CHECKING:
    from quiver.models.admin_user import AdminUser

_ALGORITHM = "HS256"
_DEFAULT_ACCESS_EXPIRE_MINUTES = 15
_DEFAULT_REFRESH_EXPIRE_DAYS = 7


class TokenExpiredError(QuiverUnauthorized):
    code = "QUIVER_TOKEN_EXPIRED"
    detail = "Token has expired."


class TokenInvalidError(QuiverUnauthorized):
    code = "QUIVER_TOKEN_INVALID"
    detail = "Token is invalid."


def _get_config():
    from quiver.config import QuiverConfig

    return QuiverConfig()


def create_access_token(
    user: AdminUser,
    roles: list[str] | None = None,
    permissions: list[str] | None = None,
    expire_minutes: int | None = None,
) -> str:
    cfg = _get_config()
    minutes = expire_minutes or int(
        getattr(cfg, "QUIVER_ACCESS_TOKEN_EXPIRE_MINUTES", _DEFAULT_ACCESS_EXPIRE_MINUTES)
    )
    now = datetime.now(tz=UTC)
    payload: dict[str, Any] = {
        "sub": str(user.id),
        "roles": roles or [],
        "permissions": permissions or [],
        "is_superuser": bool(user.is_superuser),
        "exp": now + timedelta(minutes=minutes),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, cfg.SECRET_KEY, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    cfg = _get_config()
    try:
        payload = jwt.decode(token, cfg.SECRET_KEY, algorithms=[_ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise TokenExpiredError() from None
    except JWTError:
        raise TokenInvalidError() from None


def create_refresh_token() -> tuple[str, str]:
    """Return (token_plain, token_hash). Store the hash; send the plain to the client."""
    plain = secrets.token_hex(32)
    token_hash = hashlib.sha256(plain.encode()).hexdigest()
    return plain, token_hash
