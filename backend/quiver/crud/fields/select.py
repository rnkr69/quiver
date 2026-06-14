from __future__ import annotations

from dataclasses import dataclass

from quiver.crud.fields.base import QuiverField


@dataclass
class SelectField(QuiverField):
    field_type: str = "select"
    choices: list[dict] | None = None  # [{"value": ..., "label": ...}]
    choices_from: str | None = None  # resource slug for dynamic choices
    choices_label: str = "name"  # model field to use as label in choices endpoint
    choices_value: str = "id"  # model field to use as value in choices endpoint

    def to_dict(self) -> dict:
        d = super().to_dict()
        if self.choices is not None:
            d["choices"] = self.choices
        if self.choices_from is not None:
            d["choices_endpoint"] = (
                f"/admin/{self.choices_from}/choices"
                f"?label_field={self.choices_label}&value_field={self.choices_value}"
            )
        return d


@dataclass
class SelectMultipleField(QuiverField):
    field_type: str = "select_multiple"
    choices: list[dict] | None = None
    choices_from: str | None = None
    choices_label: str = "name"
    choices_value: str = "id"

    def to_dict(self) -> dict:
        d = super().to_dict()
        if self.choices is not None:
            d["choices"] = self.choices
        if self.choices_from is not None:
            d["choices_endpoint"] = (
                f"/admin/{self.choices_from}/choices"
                f"?label_field={self.choices_label}&value_field={self.choices_value}"
            )
        return d
