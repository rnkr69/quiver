from __future__ import annotations

from dataclasses import dataclass

from quiver.crud.fields.base import QuiverField


@dataclass
class DateField(QuiverField):
    field_type: str = "date"


@dataclass
class DateTimeField(QuiverField):
    field_type: str = "datetime"
