from __future__ import annotations

from dataclasses import dataclass

from quiver.crud.fields.base import QuiverField


@dataclass
class TextField(QuiverField):
    field_type: str = "text"


@dataclass
class EmailField(QuiverField):
    field_type: str = "email"


@dataclass
class PasswordField(QuiverField):
    field_type: str = "password"


@dataclass
class TextareaField(QuiverField):
    field_type: str = "textarea"
    rows: int = 4

    def to_dict(self) -> dict:
        d = super().to_dict()
        d["rows"] = self.rows
        return d
