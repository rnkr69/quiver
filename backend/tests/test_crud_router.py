from __future__ import annotations

import os
import uuid

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import Field, Session, SQLModel

os.environ.setdefault("SECRET_KEY", "test-secret-crud-router")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from quiver import QuiverApp
from quiver.auth.jwt import create_access_token
from quiver.auth.password import hash_password
from quiver.crud import QuiverCRUD
from quiver.database.session import create_all_tables, override_engine
from quiver.models.admin_user import AdminUser

# ─── Test model ──────────────────────────────────────────────────────────────


class Widget(SQLModel, table=True):
    __tablename__ = "widgets_test"
    id: str | None = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36,
    )
    name: str = Field(max_length=255)
    price: float = Field(default=0.0)
    is_active: bool = Field(default=True)


class WidgetCRUD(QuiverCRUD):
    model = Widget
    route = "widgets"
    search_fields = ["name"]
    order_by = "-id"


# ─── Fixtures ────────────────────────────────────────────────────────────────


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
    q.register(WidgetCRUD)
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


def _token(db: Session) -> str:
    user = AdminUser(
        email=f"crud_{uuid.uuid4().hex[:8]}@example.com",
        password_hash=hash_password("pass"),
        first_name="Test",
        last_name="Admin",
        is_superuser=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return create_access_token(user, roles=[], permissions=[])


# ─── Config endpoint ─────────────────────────────────────────────────────────


def test_config_endpoint(app_client, db):
    token = _token(db)
    r = app_client.get(
        "/quiver/v1/admin/widgets/config", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["resource"] == "widgets"
    assert "columns" in data
    assert "fields" in data
    assert "permissions" in data
    assert data["permissions"]["list"] is True


# ─── List endpoint ────────────────────────────────────────────────────────────


def test_list_empty(app_client, db):
    token = _token(db)
    r = app_client.get("/quiver/v1/admin/widgets/", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data


def test_list_requires_auth(app_client):
    r = app_client.get("/quiver/v1/admin/widgets/")
    assert r.status_code == 401


# ─── Create endpoint ─────────────────────────────────────────────────────────


def test_create_item(app_client, db):
    token = _token(db)
    r = app_client.post(
        "/quiver/v1/admin/widgets/",
        json={"name": "Test Widget", "price": 9.99, "is_active": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Test Widget"
    assert data["price"] == 9.99


# ─── Get item endpoint ────────────────────────────────────────────────────────


def test_get_item(app_client, db):
    token = _token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/widgets/",
        json={"name": "Get Me", "price": 1.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    item_id = create_r.json()["id"]
    r = app_client.get(
        f"/quiver/v1/admin/widgets/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["id"] == item_id


def test_get_item_not_found(app_client, db):
    token = _token(db)
    r = app_client.get(
        f"/quiver/v1/admin/widgets/{uuid.uuid4()}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404


# ─── Update endpoint ─────────────────────────────────────────────────────────


def test_update_item(app_client, db):
    token = _token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/widgets/",
        json={"name": "Update Me", "price": 5.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    item_id = create_r.json()["id"]
    r = app_client.put(
        f"/quiver/v1/admin/widgets/{item_id}",
        json={"name": "Updated"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Updated"


# ─── Delete endpoint ─────────────────────────────────────────────────────────


def test_delete_item(app_client, db):
    token = _token(db)
    create_r = app_client.post(
        "/quiver/v1/admin/widgets/",
        json={"name": "Delete Me", "price": 0.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    item_id = create_r.json()["id"]
    r = app_client.delete(
        f"/quiver/v1/admin/widgets/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 204

    # verify gone
    r2 = app_client.get(
        f"/quiver/v1/admin/widgets/{item_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r2.status_code == 404


# ─── Choices endpoint ─────────────────────────────────────────────────────────


def test_choices_endpoint(app_client, db):
    token = _token(db)
    app_client.post(
        "/quiver/v1/admin/widgets/",
        json={"name": "Choice Widget", "price": 1.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    r = app_client.get(
        "/quiver/v1/admin/widgets/choices",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert all("value" in item and "label" in item for item in data)


# ─── Search ──────────────────────────────────────────────────────────────────


def test_search(app_client, db):
    token = _token(db)
    app_client.post(
        "/quiver/v1/admin/widgets/",
        json={"name": "Searchable Widget", "price": 2.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    r = app_client.get(
        "/quiver/v1/admin/widgets/?search=Searchable",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert any("Searchable" in item["name"] for item in data["items"])


# ─── Hooks ───────────────────────────────────────────────────────────────────


def test_before_create_hook(engine, db):
    class HookedWidget(QuiverCRUD):
        model = Widget
        route = "hooked_widgets"

        async def before_create(self, data, db, user):
            data["name"] = "HOOKED_" + data.get("name", "")
            return data

    fa2 = FastAPI()
    from quiver import QuiverApp as QApp

    q2 = QApp(fa2)
    q2.register(HookedWidget)
    create_all_tables()

    token = create_access_token(
        AdminUser(
            email=f"hook_{uuid.uuid4().hex[:6]}@x.com",
            password_hash="x",
            first_name="H",
            last_name="U",
            is_superuser=True,
            is_active=True,
        ),
        roles=[],
        permissions=[],
    )
    with TestClient(fa2, raise_server_exceptions=True) as c:
        c.__enter__()
        r = c.post(
            "/quiver/v1/admin/hooked_widgets/",
            json={"name": "Widget", "price": 1.0},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 201
        assert r.json()["name"].startswith("HOOKED_")
