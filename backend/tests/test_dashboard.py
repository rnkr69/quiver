from __future__ import annotations

import os
import uuid
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
from sqlmodel import Session

os.environ.setdefault("SECRET_KEY", "test-secret-dashboard")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from quiver.database.session import override_engine, create_all_tables
from quiver.models.admin_user import AdminUser
from quiver.auth.password import hash_password
from quiver.auth.jwt import create_access_token
from quiver import QuiverApp
from quiver.dashboard import StatCardWidget, ChartWidget


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
    q = QuiverApp(fa)
    q.register_widget(StatCardWidget("Usuarios", model=AdminUser, permission="users.list"))
    q.register_widget(StatCardWidget("Total Admins", model=AdminUser))
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


def _token(db: Session, is_super: bool = True, permissions: list = None) -> str:
    user = AdminUser(
        email=f"dash_{uuid.uuid4().hex[:8]}@example.com",
        password_hash=hash_password("pass"),
        first_name="Dash",
        last_name="User",
        is_superuser=is_super,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return create_access_token(user, roles=[], permissions=permissions or [])


def test_dashboard_no_auth(app_client):
    r = app_client.get("/quiver/v1/admin/dashboard")
    assert r.status_code == 401


def test_dashboard_superuser_sees_all_widgets(app_client, db):
    token = _token(db)
    r = app_client.get("/quiver/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 2  # both widgets


def test_dashboard_filters_by_permission(app_client, db):
    # user without users.list → only the widget with no permission required
    token = _token(db, is_super=False, permissions=[])
    r = app_client.get("/quiver/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    # Only the widget with no permission required (Total Admins) should appear
    assert len(data) == 1
    assert data[0]["title"] == "Total Admins"


def test_dashboard_stat_card_returns_count(app_client, db):
    token = _token(db)
    r = app_client.get("/quiver/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    for widget in data:
        assert "data" in widget
        assert "value" in widget["data"]
        assert isinstance(widget["data"]["value"], int)


def test_dashboard_empty_no_widgets():
    """Test endpoint returns [] when no widgets registered."""
    # Use a fresh registry by mocking
    from quiver.dashboard import registry as reg
    original = reg._WIDGET_REGISTRY[:]
    reg._WIDGET_REGISTRY.clear()
    try:
        e = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        override_engine(e)
        fa = FastAPI()
        QuiverApp(fa)
        create_all_tables()
        with TestClient(fa) as client:
            with Session(e) as db:
                user = AdminUser(
                    email=f"empty_{uuid.uuid4().hex[:8]}@example.com",
                    password_hash=hash_password("pass"),
                    first_name="E", last_name="U",
                    is_superuser=True, is_active=True,
                )
                db.add(user); db.commit(); db.refresh(user)
                token = create_access_token(user, roles=[], permissions=[])
            r = client.get("/quiver/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
            assert r.status_code == 200
            assert r.json() == []
    finally:
        reg._WIDGET_REGISTRY.extend(original)
