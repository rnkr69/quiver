from __future__ import annotations

from quiver.menu.schemas import MenuGroup, MenuItem


class MenuBuilder:
    @staticmethod
    def build(
        menu_config: list[MenuGroup | MenuItem],
        user_permissions: list[str],
        is_superuser: bool,
    ) -> list[dict]:
        result = []
        perms = set(user_permissions)

        for entry in menu_config:
            if isinstance(entry, MenuItem):
                if is_superuser or entry.permission is None or entry.permission in perms:
                    result.append({
                        "type": "item",
                        "label": entry.label,
                        "route": entry.route,
                        "icon": entry.icon,
                    })
            elif isinstance(entry, MenuGroup):
                visible_items = [
                    {"label": i.label, "route": i.route, "icon": i.icon}
                    for i in entry.items
                    if is_superuser or i.permission is None or i.permission in perms
                ]
                if visible_items:
                    result.append({
                        "type": "group",
                        "title": entry.title,
                        "icon": entry.icon,
                        "items": visible_items,
                    })

        return result
