from __future__ import annotations

import os
from functools import lru_cache
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from quiver.email import EmailSender


class QuiverConfigError(Exception):
    pass


class QuiverConfig:
    SECRET_KEY: str
    DATABASE_URL: str
    QUIVER_ENV: str
    QUIVER_PREFIX: str
    QUIVER_FRONTEND_PATH: str
    QUIVER_PORTAL_ROLES: list[str]
    QUIVER_FRONTEND_URL: str
    QUIVER_PORTAL_WELCOME_MESSAGE: str
    email_sender: EmailSender | None

    def __init__(
        self,
        secret_key: str | None = None,
        database_url: str | None = None,
        quiver_env: str | None = None,
        quiver_prefix: str | None = None,
        quiver_frontend_path: str | None = None,
        quiver_portal_roles: str | None = None,
        quiver_frontend_url: str | None = None,
        quiver_portal_welcome_message: str | None = None,
        email_sender: EmailSender | None = None,
    ) -> None:
        # None means "not provided" → read from env. Empty string means explicitly empty.
        self.SECRET_KEY = secret_key if secret_key is not None else os.getenv("SECRET_KEY", "")
        self.DATABASE_URL = (
            database_url if database_url is not None else os.getenv("DATABASE_URL", "")
        )
        self.QUIVER_ENV = (
            quiver_env if quiver_env is not None else os.getenv("QUIVER_ENV", "development")
        )
        self.QUIVER_PREFIX = (
            quiver_prefix if quiver_prefix is not None else os.getenv("QUIVER_PREFIX", "/quiver/v1")
        )
        self.QUIVER_FRONTEND_PATH = (
            quiver_frontend_path
            if quiver_frontend_path is not None
            else os.getenv("QUIVER_FRONTEND_PATH", "/quiver")
        )
        raw_roles = (
            quiver_portal_roles
            if quiver_portal_roles is not None
            else os.getenv("QUIVER_PORTAL_ROLES", "")
        )
        self.QUIVER_PORTAL_ROLES = [r.strip() for r in raw_roles.split(",") if r.strip()]
        self.QUIVER_FRONTEND_URL = (
            quiver_frontend_url
            if quiver_frontend_url is not None
            else os.getenv("QUIVER_FRONTEND_URL", "http://localhost:5173")
        )
        self.QUIVER_PORTAL_WELCOME_MESSAGE = (
            quiver_portal_welcome_message
            if quiver_portal_welcome_message is not None
            else os.getenv(
                "QUIVER_PORTAL_WELCOME_MESSAGE",
                "Bienvenido. Esta sección estará disponible próximamente.",
            )
        )
        self.email_sender = email_sender

        missing = []
        if not self.SECRET_KEY:
            missing.append("SECRET_KEY")
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if missing:
            raise QuiverConfigError(
                f"QuiverConfig: missing required environment variables: {', '.join(missing)}. "
                "Set them in your .env file or pass them explicitly."
            )


@lru_cache(maxsize=1)
def get_config() -> QuiverConfig:
    return QuiverConfig()
