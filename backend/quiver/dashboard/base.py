from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class QuiverWidget(ABC):
    title: str
    component: str
    permission: str | None = None

    def __init__(self, title: str, *, component: str = "StatCard", permission: str | None = None):
        self.title = title
        self.component = component
        self.permission = permission

    @abstractmethod
    async def fetch_data(self, db: Any, user: dict) -> dict:
        """Return the widget's data dict. Called on every dashboard request."""
        ...

    def to_dict(self, data: dict) -> dict:
        return {
            "type": self.__class__.__name__,
            "title": self.title,
            "component": self.component,
            "data": data,
        }
