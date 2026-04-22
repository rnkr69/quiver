from __future__ import annotations

from quiver.dashboard.base import QuiverWidget

_WIDGET_REGISTRY: list[QuiverWidget] = []


def register_widget(widget: QuiverWidget) -> None:
    _WIDGET_REGISTRY.append(widget)


def get_widgets() -> list[QuiverWidget]:
    return list(_WIDGET_REGISTRY)
