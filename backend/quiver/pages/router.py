from __future__ import annotations

from fastapi import APIRouter, Depends

from quiver.auth.dependencies import require_authenticated


def create_pages_router() -> APIRouter:
    router = APIRouter(tags=["pages"])

    @router.get("/admin/pages")
    async def get_admin_pages(payload: dict = Depends(require_authenticated)):
        from quiver.pages.registry import get_admin_pages

        is_superuser: bool = bool(payload.get("is_superuser", False))
        user_permissions: set[str] = set(payload.get("permissions", []))

        pages = get_admin_pages()
        result = []
        for p in pages:
            if is_superuser or p.permission is None or p.permission in user_permissions:
                result.append(
                    {
                        "route": p.route,
                        "title": p.title,
                        "component": p.component,
                        "layout": p.layout,
                    }
                )
        return result

    @router.get("/portal/pages")
    async def get_portal_pages(payload: dict = Depends(require_authenticated)):
        from quiver.pages.registry import get_portal_pages

        is_superuser: bool = bool(payload.get("is_superuser", False))
        user_roles: set[str] = set(payload.get("roles", []))

        pages = get_portal_pages()
        result = []
        for p in pages:
            if is_superuser or user_roles.intersection(p.allowed_roles):
                result.append(
                    {
                        "route": p.route,
                        "title": p.title,
                        "component": p.component,
                        "layout": p.layout,
                    }
                )
        return result

    return router
