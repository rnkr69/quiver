from __future__ import annotations

from sqlmodel import Session, select

from quiver.exceptions import QuiverBadRequest, QuiverNotFound
from quiver.models.associations import RoleHasPermission, UserHasRole
from quiver.models.permission import Permission
from quiver.models.role import Role
from quiver.rbac.schemas import RoleCreate, RoleDetailResponse, RoleResponse, RoleUpdate


def get_user_permissions(user_id: str, db: Session) -> list[str]:
    """Return unique flat list of permission names for a user (via all their roles)."""
    role_ids_q = db.exec(
        select(UserHasRole.role_id).where(UserHasRole.user_id == user_id)
    ).all()
    if not role_ids_q:
        return []

    perm_names: set[str] = set()
    for role_id in role_ids_q:
        perm_ids = db.exec(
            select(RoleHasPermission.permission_id).where(RoleHasPermission.role_id == role_id)
        ).all()
        for pid in perm_ids:
            perm = db.get(Permission, pid)
            if perm:
                perm_names.add(perm.name)
    return sorted(perm_names)


def assign_roles_to_user(user_id: str, role_ids: list[str], db: Session) -> None:
    existing = db.exec(
        select(UserHasRole).where(UserHasRole.user_id == user_id)
    ).all()
    for row in existing:
        db.delete(row)

    for role_id in role_ids:
        db.add(UserHasRole(user_id=user_id, role_id=role_id))
    db.commit()


def get_roles_with_stats(db: Session) -> list[RoleResponse]:
    roles = db.exec(select(Role)).all()
    result = []
    for role in roles:
        perm_count = len(db.exec(
            select(RoleHasPermission).where(RoleHasPermission.role_id == role.id)
        ).all())
        user_count = len(db.exec(
            select(UserHasRole).where(UserHasRole.role_id == role.id)
        ).all())
        result.append(RoleResponse(
            id=str(role.id),
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            permissions_count=perm_count,
            users_count=user_count,
        ))
    return result


def get_role_detail(role_id: str, db: Session) -> RoleDetailResponse:
    role = db.get(Role, role_id)
    if not role:
        raise QuiverNotFound(f"Role '{role_id}' not found.")
    perm_ids = db.exec(
        select(RoleHasPermission.permission_id).where(RoleHasPermission.role_id == role_id)
    ).all()
    perms = []
    for pid in perm_ids:
        p = db.get(Permission, pid)
        if p:
            perms.append({"id": str(p.id), "name": p.name, "display_name": p.display_name, "group": p.group})
    from quiver.rbac.schemas import PermissionResponse
    return RoleDetailResponse(
        id=str(role.id),
        name=role.name,
        display_name=role.display_name,
        description=role.description,
        permissions=[PermissionResponse(**p) for p in perms],
    )


def create_role(data: RoleCreate, db: Session) -> Role:
    role = Role(name=data.name, display_name=data.display_name, description=data.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def update_role(role_id: str, data: RoleUpdate, db: Session) -> Role:
    role = db.get(Role, role_id)
    if not role:
        raise QuiverNotFound(f"Role '{role_id}' not found.")
    if data.display_name is not None:
        role.display_name = data.display_name
    if data.description is not None:
        role.description = data.description
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def delete_role(role_id: str, db: Session) -> None:
    role = db.get(Role, role_id)
    if not role:
        raise QuiverNotFound(f"Role '{role_id}' not found.")

    # Guard: if any user has ONLY this role, deleting it would leave them with no roles
    users_with_role = db.exec(
        select(UserHasRole).where(UserHasRole.role_id == role_id)
    ).all()
    for uhr in users_with_role:
        user_role_count = len(db.exec(
            select(UserHasRole).where(UserHasRole.user_id == uhr.user_id)
        ).all())
        if user_role_count == 1:
            raise QuiverBadRequest(
                f"Cannot delete role '{role.name}': at least one user would be left without any role. "
                "Reassign their roles first."
            )

    # Delete pivot rows
    for row in db.exec(select(RoleHasPermission).where(RoleHasPermission.role_id == role_id)).all():
        db.delete(row)
    for row in users_with_role:
        db.delete(row)
    db.delete(role)
    db.commit()


def replace_role_permissions(role_id: str, permission_ids: list[str], db: Session) -> None:
    role = db.get(Role, role_id)
    if not role:
        raise QuiverNotFound(f"Role '{role_id}' not found.")

    # Atomic replace
    existing = db.exec(
        select(RoleHasPermission).where(RoleHasPermission.role_id == role_id)
    ).all()
    for row in existing:
        db.delete(row)

    for pid in permission_ids:
        if not db.get(Permission, pid):
            raise QuiverBadRequest(f"Permission '{pid}' not found.")
        db.add(RoleHasPermission(role_id=role_id, permission_id=pid))

    db.commit()


def get_permissions_grouped(db: Session) -> list[dict]:
    perms = db.exec(select(Permission).order_by(Permission.group, Permission.name)).all()
    groups: dict[str, list] = {}
    for p in perms:
        groups.setdefault(p.group, []).append({
            "id": str(p.id), "name": p.name,
            "display_name": p.display_name, "group": p.group,
        })
    return [{"group": g, "permissions": ps} for g, ps in sorted(groups.items())]
