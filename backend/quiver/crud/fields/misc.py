from __future__ import annotations

from dataclasses import dataclass

from quiver.crud.fields.base import QuiverField


@dataclass
class NumberField(QuiverField):
    field_type: str = "number"
    min: float | None = None
    max: float | None = None
    step: float | None = None

    def to_dict(self) -> dict:
        d = super().to_dict()
        if self.min is not None:
            d["min"] = self.min
        if self.max is not None:
            d["max"] = self.max
        if self.step is not None:
            d["step"] = self.step
        return d


@dataclass
class CheckboxField(QuiverField):
    field_type: str = "checkbox"


@dataclass
class HiddenField(QuiverField):
    field_type: str = "hidden"
