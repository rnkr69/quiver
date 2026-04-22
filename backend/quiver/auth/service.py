from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlmodel import Session, select

from quiver.auth.jwt import create_access_token, create_refresh_token
from quiver.auth.password import hash_password, verify_password
from quiver.auth.schemas import MeResponse, TokenResponse
from quiver.exceptions import QuiverBadRequest, QuiverUnauthorized
from quiver.models.admin_user import AdminUser
from quiver.models.token import PasswordResetToken, RefreshToken

_REFRESH_TOKEN_EXPIRE_DAYS = 7
_RESET_TOKEN_EXPIRE_HOURS = 1
_DUMMY_HASH = "$2b$12$KIXZwZ5lBhh3R3xWEo6Lxuq5gK8K5K5K5K5K5K5K5K5K5K5K5K5K"  # timing attack mitigation


def _hash_token(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()


def _get_user_roles_and_permissions(user: AdminUser, db: Session) -> tuple[list[str], list[str]]:
    from quiver.models.associations import UserHasRole, RoleHasPermission
    from quiver.models.role import Role
    from quiver.models.permission import Permission

    role_ids = db.exec(
        select(UserHasRole.role_id).where(UserHasRole.user_id == str(user.id))
    ).all()
    roles: list[str] = []
    permissions: set[str] = set()
    for rid in role_ids:
        role = db.get(Role, rid)
        if role:
            roles.append(role.name)
            for pid in db.exec(select(RoleHasPermission.permission_id).where(RoleHasPermission.role_id == rid)).all():
                perm = db.get(Permission, pid)
                if perm:
                    permissions.add(perm.name)
    return roles, sorted(permissions)


def authenticate_user(email: str, password: str, db: Session) -> Optional[AdminUser]:
    user = db.exec(select(AdminUser).where(AdminUser.email == email)).first()
    if not user:
        # Simulate verification to mitigate timing attacks
        verify_password(password, _DUMMY_HASH)
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user


def create_session(
    user: AdminUser,
    db: Session,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> tuple[str, str]:
    """Return (access_token, refresh_token_plain)."""
    roles, permissions = _get_user_roles_and_permissions(user, db)
    access_token = create_access_token(user, roles=roles, permissions=permissions)
    plain, token_hash = create_refresh_token()

    now = datetime.now(tz=timezone.utc)
    rt = RefreshToken(
        user_id=str(user.id),
        token_hash=token_hash,
        expires_at=now + timedelta(days=_REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(rt)
    user.last_login_at = now
    db.add(user)
    db.commit()

    return access_token, plain


def refresh_session(token_plain: str, db: Session) -> tuple[str, AdminUser]:
    """Validate refresh token and return (new_access_token, user)."""
    token_hash = _hash_token(token_plain)
    now = datetime.now(tz=timezone.utc)

    rt = db.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).first()

    if not rt or rt.revoked_at is not None or rt.expires_at.replace(tzinfo=timezone.utc) <= now:
        raise QuiverUnauthorized("Refresh token is invalid or expired.")

    user = db.get(AdminUser, rt.user_id)
    if not user or not user.is_active:
        raise QuiverUnauthorized("User not found or inactive.")

    roles, permissions = _get_user_roles_and_permissions(user, db)
    access_token = create_access_token(user, roles=roles, permissions=permissions)
    return access_token, user


def revoke_session(token_plain: str, db: Session) -> None:
    token_hash = _hash_token(token_plain)
    rt = db.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).first()
    if rt and rt.revoked_at is None:
        rt.revoked_at = datetime.now(tz=timezone.utc)
        db.add(rt)
        db.commit()


def initiate_password_reset(email: str, db: Session) -> Optional[str]:
    """Create a reset token. Returns the plain token, or None if user not found."""
    user = db.exec(select(AdminUser).where(AdminUser.email == email)).first()
    if not user:
        return None

    plain, token_hash = create_refresh_token()
    now = datetime.now(tz=timezone.utc)
    prt = PasswordResetToken(
        user_id=str(user.id),
        token_hash=token_hash,
        expires_at=now + timedelta(hours=_RESET_TOKEN_EXPIRE_HOURS),
    )
    db.add(prt)
    db.commit()
    return plain


def complete_password_reset(token_plain: str, new_password: str, db: Session) -> None:
    token_hash = _hash_token(token_plain)
    now = datetime.now(tz=timezone.utc)

    prt = db.exec(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    ).first()

    if not prt:
        raise QuiverBadRequest("Reset token is invalid.")
    if prt.used_at is not None:
        raise QuiverBadRequest("Reset token has already been used.")
    if prt.expires_at.replace(tzinfo=timezone.utc) <= now:
        raise QuiverBadRequest("Reset token has expired.")

    user = db.get(AdminUser, prt.user_id)
    if not user:
        raise QuiverBadRequest("User not found.")

    # Atomic: update password + mark token used + revoke all sessions
    user.password_hash = hash_password(new_password)
    prt.used_at = now
    db.add(user)
    db.add(prt)

    active_tokens = db.exec(
        select(RefreshToken).where(
            RefreshToken.user_id == str(user.id),
            RefreshToken.revoked_at == None,  # noqa: E711
        )
    ).all()
    for rt in active_tokens:
        rt.revoked_at = now
        db.add(rt)

    db.commit()
