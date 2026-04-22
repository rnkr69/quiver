from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from quiver.menu.schemas import MenuGroup, MenuItem

_MENU_CONFIG: list = []


def set_menu(config: list[MenuGroup | MenuItem]) -> None:
    global _MENU_CONFIG
    _MENU_CONFIG = list(config)


def get_menu_config() -> list:
    return _MENU_CONFIG
