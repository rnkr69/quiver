from dataclasses import dataclass, field
from typing import Optional


@dataclass
class MenuItem:
    label: str
    route: str
    permission: Optional[str] = None
    icon: Optional[str] = None


@dataclass
class MenuGroup:
    title: str
    items: list[MenuItem] = field(default_factory=list)
    icon: Optional[str] = None
