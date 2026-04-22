from __future__ import annotations

from collections.abc import Generator
from typing import TYPE_CHECKING

from sqlmodel import Session, SQLModel, create_engine

if TYPE_CHECKING:
    from sqlalchemy import Engine

_engine: "Engine | None" = None


def _build_engine() -> "Engine":
    from quiver.config import QuiverConfig
    cfg = QuiverConfig()
    kwargs = {}
    if cfg.DATABASE_URL.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    return create_engine(cfg.DATABASE_URL, **kwargs)


def _get_engine() -> "Engine":
    global _engine
    if _engine is None:
        _engine = _build_engine()
    return _engine


def override_engine(e: "Engine") -> None:
    """Inject a custom engine — used in tests."""
    global _engine
    _engine = e


def __getattr__(name: str):
    if name == "engine":
        return _get_engine()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def get_db() -> Generator[Session, None, None]:
    with Session(_get_engine()) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


def create_all_tables() -> None:
    SQLModel.metadata.create_all(_get_engine())
