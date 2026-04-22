from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class QuiverField:
    key: str
    label: Optional[str] = None
    required: bool = False
    help_text: Optional[str] = None
    read_only: bool = False
    default: Any = None
    field_type: str = "text"   # set by subclasses

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "label": self.label or self.key.replace("_", " ").title(),
            "field_type": self.field_type,
            "required": self.required,
            "help_text": self.help_text,
            "read_only": self.read_only,
            "default": self.default,
        }
