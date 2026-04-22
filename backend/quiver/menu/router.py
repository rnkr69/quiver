from __future__ import annotations

from fastapi import APIRouter, Depends

from quiver.auth.dependencies import require_authenticated


def create_menu_router() -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["menu"])

    @router.get("/menu")
    async def get_menu(payload: dict = Depends(require_authenticated)):
        from quiver.menu.builder import MenuBuilder
        from quiver.menu.registry import get_menu_config

        config = get_menu_config()
        user_permissions: list[str] = payload.get("permissions", [])
        is_superuser: bool = bool(payload.get("is_superuser", False))
        return MenuBuilder.build(config, user_permissions, is_superuser)

    return router
