from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class Column:
    key: str
    label: Optional[str] = None          # auto-derived from key if None
    col_type: str = "text"               # text|number|currency|badge|date|datetime|boolean|related
    sortable: bool = False
    badge_map: Optional[dict] = None     # only for col_type="badge": {value: (display_label, color)}
    choices_from: Optional[str] = None   # only for col_type="related": resource slug
    choices_label: str = "name"          # model field to use as label in choices endpoint
    choices_value: str = "id"            # model field to use as value in choices endpoint

    def to_dict(self) -> dict:
        d: dict = {
            "key": self.key,
            "label": self.label or self.key.replace("_", " ").title(),
            "col_type": self.col_type,
            "sortable": self.sortable,
        }
        if self.badge_map is not None:
            d["badge_map"] = self.badge_map
        if self.choices_from is not None:
            d["choices_endpoint"] = (
                f"/admin/{self.choices_from}/choices"
                f"?label_field={self.choices_label}&value_field={self.choices_value}"
            )
        return d
