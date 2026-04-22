from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PageDefinition:
    route: str
    layout: str  # "admin" or "portal"
    title: str
    component: str
    permission: Optional[str] = None        # admin pages
    allowed_roles: list[str] = field(default_factory=list)  # portal pages


_ADMIN_PAGES: list[PageDefinition] = []
_PORTAL_PAGES: list[PageDefinition] = []


def _register_page(page: PageDefinition) -> None:
    if page.layout == "admin":
        _ADMIN_PAGES.append(page)
    else:
        _PORTAL_PAGES.append(page)


def get_admin_pages() -> list[PageDefinition]:
    return list(_ADMIN_PAGES)


def get_portal_pages() -> list[PageDefinition]:
    return list(_PORTAL_PAGES)


def quiver_page(
    route: str,
    *,
    layout: str,
    title: str,
    component: str,
    permission: Optional[str] = None,
    allowed_roles: Optional[list[str]] = None,
):
    """Decorator that registers a class as a Quiver page."""
    if layout not in ("admin", "portal"):
        raise ValueError(f"quiver_page: layout must be 'admin' or 'portal', got '{layout}'")
    if layout == "admin" and not permission:
        raise ValueError("quiver_page: admin pages require a 'permission' argument")
    if layout == "portal" and not allowed_roles:
        raise ValueError("quiver_page: portal pages require 'allowed_roles'")

    page = PageDefinition(
        route=route, layout=layout, title=title, component=component,
        permission=permission,
        allowed_roles=allowed_roles or [],
    )

    def decorator(cls):
        _register_page(page)
        return cls

    return decorator


class QuiverPage:
    """Base class for Quiver pages (semantic only)."""
    pass
