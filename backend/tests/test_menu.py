import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool

from quiver.app import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem
from quiver.menu.builder import MenuBuilder
from quiver.menu.registry import set_menu, get_menu_config


# ── unit tests for MenuBuilder ───────────────────────────────────────────────

class TestMenuBuilderFiltering:
    MENU = [
        MenuItem(label="Dashboard", route="/admin"),
        MenuItem(label="Reportes", route="/admin/reports", permission="reports.list"),
        MenuGroup(
            title="Usuarios",
            items=[
                MenuItem(label="Lista", route="/admin/users", permission="users.list"),
                MenuItem(label="Roles", route="/admin/roles", permission="roles.list"),
            ],
        ),
        MenuGroup(
            title="Sin Permiso",
            items=[
                MenuItem(label="Item", route="/admin/secret", permission="secret.access"),
            ],
        ),
    ]

    def test_superuser_sees_all(self):
        result = MenuBuilder.build(self.MENU, [], is_superuser=True)
        # Dashboard, Reportes, Usuarios group, Sin Permiso group = 4 entries
        assert len(result) == 4

    def test_user_with_no_permissions_sees_only_unrestricted(self):
        result = MenuBuilder.build(self.MENU, [], is_superuser=False)
        # only Dashboard (no permission required)
        assert len(result) == 1
        assert result[0]["label"] == "Dashboard"

    def test_user_with_partial_permissions(self):
        result = MenuBuilder.build(self.MENU, ["users.list"], is_superuser=False)
        # Dashboard + Usuarios group (only Lista item, Roles filtered out)
        assert len(result) == 2
        group = next(r for r in result if r["type"] == "group")
        assert group["title"] == "Usuarios"
        assert len(group["items"]) == 1
        assert group["items"][0]["label"] == "Lista"

    def test_empty_groups_excluded(self):
        result = MenuBuilder.build(self.MENU, ["reports.list"], is_superuser=False)
        # Dashboard + Reportes; Usuarios group has no accessible items → excluded
        assert len(result) == 2
        types = [r["type"] for r in result]
        assert "group" not in types

    def test_superuser_group_count(self):
        result = MenuBuilder.build(self.MENU, [], is_superuser=True)
        groups = [r for r in result if r["type"] == "group"]
        assert len(groups) == 2


# ── integration test for GET /admin/menu endpoint ────────────────────────────

def _make_engine():
    return create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def create_all_tables():
    from quiver.database.session import _get_engine
    SQLModel.metadata.create_all(_get_engine())


@pytest.fixture(scope="module")
def app_client():
    import os
    os.environ.setdefault("SECRET_KEY", "test-secret-for-menu")
    os.environ.setdefault("DATABASE_URL", "sqlite://")

    engine = _make_engine()
    import quiver.database.session as _sess
    _sess._engine = engine

    fa = FastAPI()
    qapp = QuiverApp(fa)
    create_all_tables()

    # Set a menu with one public and one restricted item
    qapp.set_menu([
        MenuItem(label="Dashboard", route="/admin"),
        MenuItem(label="Secreto", route="/admin/secret", permission="secret.view"),
    ])

    client = TestClient(fa, raise_server_exceptions=True)
    client.__enter__()
    yield client, qapp
    client.__exit__(None, None, None)


def _get_admin_token(client):
    from quiver.models.admin_user import AdminUser
    from quiver.auth.password import hash_password
    from quiver.database.session import _get_engine
    import uuid

    suffix = uuid.uuid4().hex[:8]
    with Session(_get_engine()) as db:
        u = AdminUser(
            email=f"menu_admin_{suffix}@example.com",
            password_hash=hash_password("pass"),
            first_name="M", last_name="A",
            is_superuser=True, is_active=True,
        )
        db.add(u); db.commit()

    res = client.post("/quiver/v1/auth/login", json={
        "email": f"menu_admin_{suffix}@example.com",
        "password": "pass",
    })
    return res.json()["access_token"]


def test_menu_returns_filtered_items(app_client):
    client, _ = app_client
    token = _get_admin_token(client)
    res = client.get("/quiver/v1/admin/menu", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    # superuser sees all
    assert len(data) == 2


def test_menu_requires_authentication(app_client):
    client, _ = app_client
    res = client.get("/quiver/v1/admin/menu")
    assert res.status_code == 401
