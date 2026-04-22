from __future__ import annotations

import os
import uuid
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
from sqlmodel import Session

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-rbac-tests")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from quiver.database.session import override_engine, create_all_tables
from quiver.models.admin_user import AdminUser
from quiver.models.role import Role
from quiver.models.permission import Permission
from quiver.models.associations import UserHasRole, RoleHasPermission
from quiver.auth.password import hash_password
from quiver.auth.jwt import create_access_token
from quiver import QuiverApp


@pytest.fixture(scope="module")
def engine():
    e = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    override_engine(e)
    return e


@pytest.fixture(scope="module")
def app_client(engine):
    fa = FastAPI()
    QuiverApp(fa)
    create_all_tables()
    client = TestClient(fa, raise_server_exceptions=True)
    client.__enter__()  # triggers startup → sync_permissions
    yield client
    client.__exit__(None, None, None)


@pytest.fixture
def db(engine):
    with Session(engine) as session:
        yield session
        session.rollback()


def _make_admin_token(db: Session, roles: list[str] = None, permissions: list[str] = None) -> str:
    from quiver.models.admin_user import AdminUser
    user = AdminUser(
        email=f"rbac_admin_{uuid.uuid4().hex[:8]}@example.com",
        password_hash=hash_password("pass"),
        first_name="Admin",
        last_name="Test",
        is_superuser=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user, roles=roles or [], permissions=permissions or [])
    return token


def _make_role(db: Session, name: str, display_name: str = None) -> Role:
    suffix = uuid.uuid4().hex[:6]
    role = Role(name=f"{name}_{suffix}", display_name=display_name or name.capitalize())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def _make_permission(db: Session, name: str, display_name: str = "Test", group: str = "Test") -> Permission:
    suffix = uuid.uuid4().hex[:6]
    parts = name.split(".")
    unique_name = f"{parts[0]}_{suffix}.{parts[1]}" if len(parts) == 2 else f"{name}_{suffix}"
    perm = Permission(name=unique_name, display_name=display_name, group=group)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm


# ─── GET /admin/roles ───────────────────────────────────────────────────────


def test_list_roles_requires_auth(app_client):
    r = app_client.get("/quiver/v1/admin/roles")
    assert r.status_code == 401


def test_list_roles_returns_list(app_client, db):
    token = _make_admin_token(db)
    role = _make_role(db, "editor")
    r = app_client.get("/quiver/v1/admin/roles", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    names = [d["name"] for d in data]
    assert role.name in names


# ─── POST /admin/roles ──────────────────────────────────────────────────────


def test_create_role(app_client, db):
    token = _make_admin_token(db)
    unique_name = f"moderator_{uuid.uuid4().hex[:6]}"
    r = app_client.post(
        "/quiver/v1/admin/roles",
        json={"name": unique_name, "display_name": "Moderator", "description": "Can moderate content"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == unique_name
    assert data["permissions_count"] == 0
    assert data["users_count"] == 0


# ─── PUT /admin/roles/{id} ──────────────────────────────────────────────────


def test_update_role(app_client, db):
    token = _make_admin_token(db)
    role = _make_role(db, "updatable")
    r = app_client.put(
        f"/quiver/v1/admin/roles/{role.id}",
        json={"display_name": "Updated Name"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["display_name"] == "Updated Name"


# ─── DELETE /admin/roles/{id} ───────────────────────────────────────────────


def test_delete_role_no_users(app_client, db):
    token = _make_admin_token(db)
    role = _make_role(db, "deletable_role")
    r = app_client.delete(
        f"/quiver/v1/admin/roles/{role.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 204


def test_delete_role_last_role_of_user_blocked(app_client, db):
    token = _make_admin_token(db)
    role = _make_role(db, "only_role")
    user = AdminUser(
        email=f"sole_role_user_{uuid.uuid4().hex[:8]}@example.com",
        password_hash=hash_password("pass"),
        first_name="Solo",
        last_name="User",
        is_superuser=False,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.add(UserHasRole(user_id=str(user.id), role_id=str(role.id)))
    db.commit()

    r = app_client.delete(
        f"/quiver/v1/admin/roles/{role.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400


# ─── GET /admin/permissions ─────────────────────────────────────────────────


def test_list_permissions_grouped(app_client, db):
    token = _make_admin_token(db)
    r = app_client.get("/quiver/v1/admin/permissions", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # built-in permissions should be present (synced on startup)
    all_perm_names = [p["name"] for group in data for p in group["permissions"]]
    assert "roles.list" in all_perm_names


# ─── PUT /admin/roles/{id}/permissions ──────────────────────────────────────


def test_replace_role_permissions(app_client, db):
    token = _make_admin_token(db)
    role = _make_role(db, "perm_role")
    perm = _make_permission(db, "products.list", "List products", "Products")

    r = app_client.put(
        f"/quiver/v1/admin/roles/{role.id}/permissions",
        json={"permission_ids": [str(perm.id)]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 204

    # verify assignment in DB
    with Session(db.bind) as s:
        rows = s.exec(
            __import__("sqlmodel").select(RoleHasPermission).where(RoleHasPermission.role_id == str(role.id))
        ).all()
    assert len(rows) == 1
    assert rows[0].permission_id == str(perm.id)


def test_replace_role_permissions_clears_old(app_client, db):
    token = _make_admin_token(db)
    role = _make_role(db, "perm_role2")
    perm1 = _make_permission(db, "orders.list", "List orders", "Orders")
    perm2 = _make_permission(db, "orders.create", "Create orders", "Orders")

    # assign perm1
    app_client.put(
        f"/quiver/v1/admin/roles/{role.id}/permissions",
        json={"permission_ids": [str(perm1.id)]},
        headers={"Authorization": f"Bearer {token}"},
    )

    # replace with perm2 only
    r = app_client.put(
        f"/quiver/v1/admin/roles/{role.id}/permissions",
        json={"permission_ids": [str(perm2.id)]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 204

    from sqlmodel import select
    with Session(db.bind) as s:
        rows = s.exec(
            select(RoleHasPermission).where(RoleHasPermission.role_id == str(role.id))
        ).all()
    assert len(rows) == 1
    assert rows[0].permission_id == str(perm2.id)
