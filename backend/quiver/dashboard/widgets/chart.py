from __future__ import annotations

from typing import Any, Callable, Optional

from quiver.dashboard.base import QuiverWidget


class ChartWidget(QuiverWidget):
    def __init__(
        self,
        title: str,
        *,
        data_fn: Callable,
        chart_type: str = "bar",   # bar | line
        x_key: str = "x",
        y_key: str = "y",
        permission: Optional[str] = None,
    ):
        super().__init__(title, component="ChartWidget", permission=permission)
        self.data_fn = data_fn
        self.chart_type = chart_type
        self.x_key = x_key
        self.y_key = y_key

    async def fetch_data(self, db: Any, user: dict) -> dict:
        data = self.data_fn(db)
        return {
            "chart_type": self.chart_type,
            "x_key": self.x_key,
            "y_key": self.y_key,
            "series": data,
        }
