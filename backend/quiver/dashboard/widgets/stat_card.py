from __future__ import annotations

from collections.abc import Callable

from sqlmodel import Session, func, select

from quiver.dashboard.base import QuiverWidget


class StatCardWidget(QuiverWidget):
    def __init__(
        self,
        title: str,
        *,
        model: type,
        permission: str | None = None,
        filter_fn: Callable | None = None,
        icon: str | None = None,
    ):
        super().__init__(title, component="StatCard", permission=permission)
        self.model = model
        self.filter_fn = filter_fn
        self.icon = icon

    async def fetch_data(self, db: Session, user: dict) -> dict:
        q = select(func.count()).select_from(self.model)
        if self.filter_fn is not None:
            q = self.filter_fn(q)
        count = db.exec(q).one()
        return {"value": count, "icon": self.icon}
