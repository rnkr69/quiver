from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class TextFilter:
    key: str
    label: str | None = None

    def apply(self, query, value: str, model):
        col = getattr(model, self.key, None)
        if col is None or not value:
            return query
        return query.where(col.ilike(f"%{value}%"))

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "label": self.label or self.key.replace("_", " ").title(),
            "type": "text",
        }


@dataclass
class SelectFilter:
    key: str
    choices: list[dict] = field(default_factory=list)  # [{"value": ..., "label": ...}]
    label: str | None = None

    def apply(self, query, value: Any, model):
        col = getattr(model, self.key, None)
        if col is None or value is None or value == "":
            return query
        return query.where(col == value)

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "label": self.label or self.key.replace("_", " ").title(),
            "type": "select",
            "choices": self.choices,
        }


@dataclass
class BooleanFilter:
    key: str
    label: str | None = None

    def apply(self, query, value: str | None, model):
        col = getattr(model, self.key, None)
        if col is None or value is None or value == "":
            return query
        bool_value = value.lower() in ("true", "1", "yes")
        return query.where(col == bool_value)

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "label": self.label or self.key.replace("_", " ").title(),
            "type": "boolean",
        }


@dataclass
class DateRangeFilter:
    key: str
    label: str | None = None

    def apply(self, query, value: dict, model):
        """value = {"from": "2024-01-01", "to": "2024-12-31"}"""
        col = getattr(model, self.key, None)
        if col is None or not value:
            return query
        from_date = value.get("from")
        to_date = value.get("to")
        if from_date:
            query = query.where(col >= from_date)
        if to_date:
            query = query.where(col <= to_date)
        return query

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "label": self.label or self.key.replace("_", " ").title(),
            "type": "date_range",
        }
