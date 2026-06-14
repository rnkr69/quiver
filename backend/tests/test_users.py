from __future__ import annotations

import os
import uuid

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, select

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-user-tests")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from datetime import UTC

from quiver import QuiverApp
from quiver.auth.jwt import create_access_token
from quiver.auth.password import hash_password
from quiver.database.session import create_all_tables, override_engine
from quiver.models.admin_user import AdminUser
from quiver.models.role import Role
from quiver.models.token import RefreshToken


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
    client.__enter__()
    yield client
    client.__exit__(None, None, None)


@pytest.fixture
def db(engine):
    with Session(engine) as session:
        yield session
        session.rollback()


def _superuser_token(db: Session) -> tuple[str, str]:
    """Creates a superuser and returns (token, user_id)."""
    user = AdminUser(
        email=f"super_{uuid.uuid4().hex[:8]}@example.com",
        password_hash=hash_password("pass"),
        first_name="Super",
        last_name="User",
        is_superuser=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user, roles=[], permissions=[])
    return token, str(user.id)


def _make_role(db: Session) -> Role:
    role = Role(name=f"role_{uuid.uuid4().hex[:6]}", display_name="Test Role")
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


# ─── GET /admin/users ───────────────────────────────────────────────────────


def test_list_users_requires_auth(app_client):
    r = app_client.get("/quiver/v1/admin/users")
    assert r.status_code == 401


def test_list_users_returns_list(app_client, db):
    token, _ = _superuser_token(db)
    r = app_client.get("/quiver/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ─── POST /admin/users ──────────────────────────────────────────────────────


def test_create_user(app_client, db):
    token, _ = _superuser_token(db)
    r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"newuser_{uuid.uuid4().hex[:8]}@example.com",
            "password": "secure123",
            "first_name": "New",
            "last_name": "User",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["is_active"] is True
    assert "password_hash" not in data


def test_create_user_with_roles(app_client, db):
    token, _ = _superuser_token(db)
    role = _make_role(db)
    r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"roleuser_{uuid.uuid4().hex[:8]}@example.com",
            "password": "secure123",
            "first_name": "Role",
            "last_name": "User",
            "role_ids": [str(role.id)],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert len(data["roles"]) == 1
    assert data["roles"][0]["id"] == str(role.id)


def test_create_user_duplicate_email(app_client, db):
    token, _ = _superuser_token(db)
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    # create once
    app_client.post(
        "/quiver/v1/admin/users",
        json={"email": email, "password": "pass", "first_name": "A", "last_name": "B"},
        headers={"Authorization": f"Bearer {token}"},
    )
    # create again same email
    r = app_client.post(
        "/quiver/v1/admin/users",
        json={"email": email, "password": "pass", "first_name": "C", "last_name": "D"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400


# ─── GET /admin/users/{id} ──────────────────────────────────────────────────


def test_get_user(app_client, db):
    token, _ = _superuser_token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"detail_{uuid.uuid4().hex[:8]}@example.com",
            "password": "pass",
            "first_name": "Detail",
            "last_name": "Test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_r.json()["id"]
    r = app_client.get(
        f"/quiver/v1/admin/users/{user_id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    assert r.json()["id"] == user_id


def test_get_user_not_found(app_client, db):
    token, _ = _superuser_token(db)
    r = app_client.get(
        f"/quiver/v1/admin/users/{uuid.uuid4()}", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 404


# ─── PUT /admin/users/{id} ──────────────────────────────────────────────────


def test_update_user_name(app_client, db):
    token, _ = _superuser_token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"upd_{uuid.uuid4().hex[:8]}@example.com",
            "password": "pass",
            "first_name": "Old",
            "last_name": "Name",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_r.json()["id"]
    r = app_client.put(
        f"/quiver/v1/admin/users/{user_id}",
        json={"first_name": "New"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["first_name"] == "New"


def test_update_user_password_not_in_response(app_client, db):
    token, _ = _superuser_token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"pwdtest_{uuid.uuid4().hex[:8]}@example.com",
            "password": "oldpass",
            "first_name": "Pwd",
            "last_name": "Test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_r.json()["id"]
    r = app_client.put(
        f"/quiver/v1/admin/users/{user_id}",
        json={"password": "newpass"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert "password_hash" not in r.json()
    assert "password" not in r.json()


# ─── DELETE /admin/users/{id} ───────────────────────────────────────────────


def test_deactivate_user(app_client, db):
    token, _ = _superuser_token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"deact_{uuid.uuid4().hex[:8]}@example.com",
            "password": "pass",
            "first_name": "Deact",
            "last_name": "Test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_r.json()["id"]
    r = app_client.delete(
        f"/quiver/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 204

    # user should now be inactive
    detail_r = app_client.get(
        f"/quiver/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert detail_r.json()["is_active"] is False


def test_deactivate_revokes_tokens(app_client, db):
    token, _ = _superuser_token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/users",
        json={
            "email": f"tok_{uuid.uuid4().hex[:8]}@example.com",
            "password": "pass",
            "first_name": "Tok",
            "last_name": "Test",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_r.json()["id"]

    # plant a refresh token for this user
    from quiver.auth.jwt import create_refresh_token

    plain, token_hash = create_refresh_token()
    from datetime import datetime, timedelta

    rt = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=datetime.now(tz=UTC) + timedelta(days=7),
    )
    db.add(rt)
    db.commit()

    app_client.delete(
        f"/quiver/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    with Session(db.bind) as s:
        rts = s.exec(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at != None,  # noqa: E711
            )
        ).all()
    assert len(rts) >= 1


def test_cannot_deactivate_self(app_client, db):
    token, user_id = _superuser_token(db)
    r = app_client.delete(
        f"/quiver/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403
