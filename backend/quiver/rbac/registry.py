from __future__ import annotations

from dataclasses import dataclass

from quiver.config import QuiverConfigError

_PERM_NAME_PATTERN = __import__('re').compile(r'^[a-z0-9_]+\.[a-z0-9_]+$')


@dataclass
class PermissionDefinition:
    name: str
    display_name: str
    group: str


_PERMISSION_REGISTRY: dict[str, PermissionDefinition] = {}


def quiver_permission(name: str, *, display_name: str, group: str) -> PermissionDefinition:
    """Register a permission. Call at module level before QuiverApp is created."""
    if not _PERM_NAME_PATTERN.match(name):
        raise QuiverConfigError(
            f"Invalid permission name '{name}'. Must match ^[a-z0-9_]+\\.[a-z0-9_]+$ (e.g. 'users.list')."
        )
    defn = PermissionDefinition(name=name, display_name=display_name, group=group)
    _PERMISSION_REGISTRY[name] = defn
    return defn


def get_registry() -> dict[str, PermissionDefinition]:
    return _PERMISSION_REGISTRY
