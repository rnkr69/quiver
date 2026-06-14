import os

os.environ.setdefault("SECRET_KEY", "test-secret-for-frontend")
os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, create_engine

from quiver.app import QuiverApp


def _make_engine():
    return create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


@pytest.fixture()
def spa_dir(tmp_path):
    static = tmp_path / "static"
    (static / "assets").mkdir(parents=True)
    (static / "index.html").write_text("<!doctype html><title>SPA</title>", encoding="utf-8")
    (static / "assets" / "app.js").write_text("console.log('app')", encoding="utf-8")
    return static


@pytest.fixture()
def client(spa_dir):
    import quiver.database.session as _sess

    _sess._engine = _make_engine()

    fa = FastAPI()
    qapp = QuiverApp(fa)
    SQLModel.metadata.create_all(_sess._engine)
    # Mounted last, after the API routers — exactly how a host app should call it.
    qapp.serve_frontend(directory=spa_dir)

    c = TestClient(fa)
    c.__enter__()
    yield c
    c.__exit__(None, None, None)


def test_serves_index_at_base_path(client):
    res = client.get("/quiver/")
    assert res.status_code == 200
    assert "SPA" in res.text


def test_serves_real_assets(client):
    res = client.get("/quiver/assets/app.js")
    assert res.status_code == 200
    assert "console.log" in res.text


def test_deep_link_falls_back_to_index(client):
    # A client-side route with no matching file must return index.html, not 404.
    res = client.get("/quiver/admin/users/5")
    assert res.status_code == 200
    assert "SPA" in res.text


def test_api_routes_take_precedence_over_spa(client):
    # An existing API endpoint must return JSON, never the SPA HTML.
    res = client.post("/quiver/v1/auth/login", json={"email": "x@y.z", "password": "nope"})
    assert res.status_code in (400, 401)
    assert "application/json" in res.headers["content-type"]


def test_missing_build_is_noop(tmp_path):
    import quiver.database.session as _sess

    _sess._engine = _make_engine()
    fa = FastAPI()
    qapp = QuiverApp(fa)

    missing = tmp_path / "does-not-exist"
    with pytest.warns(UserWarning, match="no SPA build found"):
        qapp.serve_frontend(directory=missing)

    # Nothing mounted: the base path resolves to a 404, not the SPA.
    client = TestClient(fa)
    assert client.get("/quiver/").status_code == 404
