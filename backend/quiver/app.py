from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from quiver.config import QuiverConfig, QuiverConfigError
from quiver.exceptions import (
    QuiverBadRequest,
    QuiverException,
    QuiverForbidden,
    QuiverNotFound,
    QuiverUnauthorized,
)

if TYPE_CHECKING:
    from fastapi.routing import APIRouter

_RESERVED_SLUGS = frozenset({
    "auth",
    "users",
    "roles",
    "permissions",
    "dashboard",
    "portal",
    "static",
    "health",
})


class QuiverApp:
    def __init__(self, app: FastAPI, config: QuiverConfig | None = None) -> None:
        self.app = app
        self.config = config or QuiverConfig()
        self._cruds: list = []

        from fastapi.routing import APIRouter
        self.router = APIRouter(prefix=self.config.QUIVER_PREFIX)

        self._validate_on_startup()
        self._register_exception_handlers()
        self._mount_auth_router()
        self._mount_rbac_router()
        self._mount_users_router()
        self._mount_dashboard_router()
        self._mount_menu_router()
        self._mount_pages_router()
        self._mount_portal_router()
        self._register_startup_events()
        app.include_router(self.router)

    def _validate_on_startup(self) -> None:
        if not self.config.SECRET_KEY:
            raise QuiverConfigError("QuiverApp requires SECRET_KEY to be set.")
        if not self.config.DATABASE_URL:
            raise QuiverConfigError("QuiverApp requires DATABASE_URL to be set.")

    def _register_exception_handlers(self) -> None:
        async def quiver_exception_handler(request: Request, exc: QuiverException) -> JSONResponse:
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail, "code": exc.code},
            )

        for exc_class in (QuiverException, QuiverNotFound, QuiverUnauthorized, QuiverForbidden, QuiverBadRequest):
            self.app.add_exception_handler(exc_class, quiver_exception_handler)

    def _mount_auth_router(self) -> None:
        from quiver.auth.router import create_auth_router
        is_production = self.config.QUIVER_ENV == "production"
        auth_router = create_auth_router(
            prefix=self.config.QUIVER_PREFIX,
            is_production=is_production,
        )
        self.router.include_router(auth_router)

    def _mount_rbac_router(self) -> None:
        from quiver.rbac.router import create_rbac_router
        rbac_router = create_rbac_router()
        self.router.include_router(rbac_router)

    def _mount_users_router(self) -> None:
        from quiver.users.router import create_users_router
        users_router = create_users_router()
        self.router.include_router(users_router)

    def _mount_dashboard_router(self) -> None:
        from quiver.dashboard.router import create_dashboard_router
        dashboard_router = create_dashboard_router()
        self.router.include_router(dashboard_router)

    def _mount_menu_router(self) -> None:
        from quiver.menu.router import create_menu_router
        menu_router = create_menu_router()
        self.router.include_router(menu_router)

    def _mount_pages_router(self) -> None:
        from quiver.pages.router import create_pages_router
        pages_router = create_pages_router()
        self.router.include_router(pages_router)

    def _mount_portal_router(self) -> None:
        from quiver.portal.router import create_portal_router
        portal_router = create_portal_router()
        self.router.include_router(portal_router)

    def register_widget(self, widget) -> None:
        from quiver.dashboard.registry import register_widget
        register_widget(widget)

    def set_menu(self, config: list) -> None:
        from quiver.menu.registry import set_menu
        set_menu(config)

    def _register_startup_events(self) -> None:
        @self.app.on_event("startup")
        async def _sync_permissions_on_startup():
            import quiver.rbac  # ensure built-in permissions are registered
            from quiver.database.session import _get_engine
            from quiver.rbac.sync import sync_permissions
            from sqlmodel import Session
            with Session(_get_engine()) as db:
                sync_permissions(db)

    def register(self, crud_class) -> None:
        slug = getattr(crud_class, "route", None) or getattr(crud_class, "slug", None) or getattr(crud_class, "__name__", "").lower()
        if slug in _RESERVED_SLUGS:
            raise QuiverConfigError(
                f"QuiverApp: slug '{slug}' is reserved and cannot be used. "
                f"Reserved slugs: {sorted(_RESERVED_SLUGS)}"
            )
        crud_class._register_permissions()
        self._cruds.append(crud_class)

        from quiver.crud.router_factory import create_crud_router
        crud_router = create_crud_router(crud_class)
        # Mount directly on the app with the full prefix so routes are visible immediately
        self.app.include_router(crud_router, prefix=self.config.QUIVER_PREFIX)
