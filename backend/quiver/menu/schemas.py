from dataclasses import dataclass, field


@dataclass
class MenuItem:
    label: str
    route: str
    permission: str | None = None
    icon: str | None = None


@dataclass
class MenuGroup:
    title: str
    items: list[MenuItem] = field(default_factory=list)
    icon: str | None = None
