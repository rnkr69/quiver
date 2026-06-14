from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Session, select

from quiver.auth.password import hash_password
from quiver.exceptions import QuiverBadRequest, QuiverForbidden, QuiverNotFound
from quiver.models.admin_user import AdminUser
from quiver.models.associations import UserHasRole
from quiver.models.role import Role
from quiver.models.token import RefreshToken
from quiver.rbac.schemas import RoleResponse
from quiver.users.schemas import UserCreate, UserListResponse, UserResponse, UserUpdate


def _build_user_response(user: AdminUser, db: Session) -> UserResponse:
    roles = _get_user_roles(user.id, db)
    return UserResponse(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
        roles=roles,
    )


def _get_user_roles(user_id: str, db: Session) -> list[RoleResponse]:
    role_ids = db.exec(select(UserHasRole.role_id).where(UserHasRole.user_id == str(user_id))).all()
    roles = []
    for rid in role_ids:
        role = db.get(Role, rid)
        if role:
            from sqlmodel import select as sel

            from quiver.models.associations import RoleHasPermission

            perm_count = len(
                db.exec(sel(RoleHasPermission).where(RoleHasPermission.role_id == rid)).all()
            )
            user_count = len(db.exec(sel(UserHasRole).where(UserHasRole.role_id == rid)).all())
            roles.append(
                RoleResponse(
                    id=str(role.id),
                    name=role.name,
                    display_name=role.display_name,
                    description=role.description,
                    permissions_count=perm_count,
                    users_count=user_count,
                )
            )
    return roles


def list_users(db: Session) -> list[UserListResponse]:
    users = db.exec(select(AdminUser)).all()
    result = []
    for user in users:
        roles = _get_user_roles(str(user.id), db)
        result.append(
            UserListResponse(
                id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                is_active=user.is_active,
                is_superuser=user.is_superuser,
                last_login_at=user.last_login_at,
                roles=roles,
            )
        )
    return result


def get_user(user_id: str, db: Session) -> UserResponse:
    user = db.get(AdminUser, user_id)
    if not user:
        raise QuiverNotFound(f"User '{user_id}' not found.")
    return _build_user_response(user, db)


def create_user(data: UserCreate, db: Session) -> UserResponse:
    existing = db.exec(select(AdminUser).where(AdminUser.email == data.email)).first()
    if existing:
        raise QuiverBadRequest(f"Email '{data.email}' is already in use.")

    user = AdminUser(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        is_superuser=data.is_superuser,
        is_active=True,
    )
    db.add(user)
    db.flush()  # get user.id without committing

    for role_id in data.role_ids:
        if not db.get(Role, role_id):
            raise QuiverBadRequest(f"Role '{role_id}' not found.")
        db.add(UserHasRole(user_id=str(user.id), role_id=role_id))

    db.commit()
    db.refresh(user)
    return _build_user_response(user, db)


def update_user(user_id: str, data: UserUpdate, current_user_id: str, db: Session) -> UserResponse:
    user = db.get(AdminUser, user_id)
    if not user:
        raise QuiverNotFound(f"User '{user_id}' not found.")

    # Self-protection: cannot remove own superuser status
    if user_id == current_user_id and data.is_superuser is False and user.is_superuser:
        raise QuiverForbidden("You cannot remove your own superuser status.")

    if data.email is not None:
        existing = db.exec(
            select(AdminUser).where(AdminUser.email == data.email, AdminUser.id != user_id)
        ).first()
        if existing:
            raise QuiverBadRequest(f"Email '{data.email}' is already in use.")
        user.email = data.email

    if data.password is not None:
        user.password_hash = hash_password(data.password)

    if data.first_name is not None:
        user.first_name = data.first_name

    if data.last_name is not None:
        user.last_name = data.last_name

    if data.is_superuser is not None:
        user.is_superuser = data.is_superuser

    db.add(user)

    if data.role_ids is not None:
        existing_roles = db.exec(select(UserHasRole).where(UserHasRole.user_id == user_id)).all()
        for row in existing_roles:
            db.delete(row)
        for role_id in data.role_ids:
            if not db.get(Role, role_id):
                raise QuiverBadRequest(f"Role '{role_id}' not found.")
            db.add(UserHasRole(user_id=user_id, role_id=role_id))

    db.commit()
    db.refresh(user)
    return _build_user_response(user, db)


def deactivate_user(user_id: str, current_user_id: str, db: Session) -> None:
    if user_id == current_user_id:
        raise QuiverForbidden("You cannot deactivate your own account.")

    user = db.get(AdminUser, user_id)
    if not user:
        raise QuiverNotFound(f"User '{user_id}' not found.")

    now = datetime.now(tz=UTC)
    user.is_active = False
    db.add(user)

    active_tokens = db.exec(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at == None,  # noqa: E711
        )
    ).all()
    for rt in active_tokens:
        rt.revoked_at = now
        db.add(rt)

    db.commit()
