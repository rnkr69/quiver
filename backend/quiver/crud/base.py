from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from typing import Any, get_args, get_origin

from sqlmodel import SQLModel

from quiver.crud.columns import Column
from quiver.crud.fields.base import QuiverField
from quiver.crud.fields.date import DateField, DateTimeField
from quiver.crud.fields.misc import CheckboxField, HiddenField, NumberField
from quiver.crud.fields.select import SelectField
from quiver.crud.fields.text import TextField

# Fields that are always excluded from forms unless explicitly declared
_DEFAULT_EXCLUDE_FIELDS = {"id", "created_at", "updated_at"}

# Python type → Column type mapping
_TYPE_TO_COL: dict[Any, str] = {
    str: "text",
    int: "number",
    float: "number",
    bool: "boolean",
    datetime: "datetime",
    date: "date",
}

# Python type → Field class mapping
_TYPE_TO_FIELD: dict[Any, type] = {
    str: TextField,
    int: NumberField,
    float: NumberField,
    bool: CheckboxField,
    datetime: DateTimeField,
    date: DateField,
}

_BUILT_IN_CRUD_ACTIONS = ("list", "create", "show", "update", "delete")


def _unwrap_optional(annotation: Any) -> Any:
    """Return the inner type from Optional[T] / T | None, or the type itself."""
    origin = get_origin(annotation)
    if origin is type(None):
        return None
    # Union / X | None
    import types

    if origin is getattr(types, "UnionType", None) or str(origin) in (
        "<class 'typing.Union'>",
        "typing.Union",
    ):
        args = [a for a in get_args(annotation) if a is not type(None)]
        return args[0] if args else annotation
    return annotation


def _col_type_for(python_type: Any) -> str:
    unwrapped = _unwrap_optional(python_type)
    if isinstance(unwrapped, type) and issubclass(unwrapped, enum.Enum):
        return "badge"
    if unwrapped in _TYPE_TO_COL:
        return _TYPE_TO_COL[unwrapped]
    # UUID → hidden in columns (but we skip it there anyway)
    return "text"


def _field_cls_for(python_type: Any) -> type:
    unwrapped = _unwrap_optional(python_type)
    if isinstance(unwrapped, type) and issubclass(unwrapped, enum.Enum):
        return SelectField
    # UUID → HiddenField
    if unwrapped is uuid.UUID or (isinstance(unwrapped, type) and issubclass(unwrapped, uuid.UUID)):
        return HiddenField
    return _TYPE_TO_FIELD.get(unwrapped, TextField)


def _model_field_names_and_types(model: type) -> list[tuple[str, Any]]:
    """Return [(field_name, python_type)] for a SQLModel class."""
    if hasattr(model, "model_fields"):  # Pydantic v2 / SQLModel
        return [(name, info.annotation) for name, info in model.model_fields.items()]
    # Pydantic v1 fallback
    return [(name, f.outer_type_) for name, f in model.__fields__.items()]


class QuiverCRUD:
    """Base class for auto-generated admin CRUD modules."""

    # Required by developer
    model: type[SQLModel]
    route: str

    # Optional declarations
    permissions: str | None = None  # permission group name, defaults to route
    columns: list[Column] | None = None
    exclude_columns: list[str] | None = None
    fields: list[QuiverField] | None = None
    exclude_fields: list[str] | None = None
    filters: list = []
    search_fields: list[str] = []
    order_by: str = "-created_at"
    page_size: int = 25
    bulk_actions: list[str] = ["delete"]
    title: str | None = None

    # ── Life-cycle hooks (override in subclass) ───────────────────────────────

    async def before_create(self, data: Any, db: Any, user: Any) -> Any:
        return data

    async def after_create(self, instance: Any, db: Any, user: Any) -> None:
        pass

    async def before_update(self, data: Any, db: Any, user: Any) -> Any:
        return data

    async def after_update(self, instance: Any, db: Any, user: Any) -> None:
        pass

    async def before_delete(self, instance: Any, db: Any, user: Any) -> None:
        pass

    async def after_delete(self, instance_id: Any, db: Any, user: Any) -> None:
        pass

    async def get_queryset(self, db: Any, user: Any):
        """Return the base queryset for list / choices. Override to add filters."""
        from sqlmodel import select

        return select(self.model)

    # ── Internal helpers ─────────────────────────────────────────────────────

    @classmethod
    def _permission_group(cls) -> str:
        if cls.permissions:
            return cls.permissions if isinstance(cls.permissions, str) else cls.route
        return cls.route

    def _get_effective_columns(self) -> list[Column]:
        """Resolve the three declaration modes for columns."""
        if self.columns is not None:
            return list(self.columns)

        field_pairs = _model_field_names_and_types(self.model)
        exclude = set(self.exclude_columns or [])

        result = []
        for name, python_type in field_pairs:
            if name in exclude:
                continue
            col_type = _col_type_for(python_type)
            result.append(Column(key=name, col_type=col_type))
        return result

    def _get_effective_fields(self) -> list[QuiverField]:
        """Resolve the three declaration modes for form fields."""
        if self.fields is not None:
            return list(self.fields)

        field_pairs = _model_field_names_and_types(self.model)
        explicit_exclude = set(self.exclude_fields or [])
        exclude = _DEFAULT_EXCLUDE_FIELDS | explicit_exclude

        result = []
        for name, python_type in field_pairs:
            if name in exclude:
                continue
            field_cls = _field_cls_for(python_type)
            # Determine required: Pydantic v2
            required = False
            if hasattr(self.model, "model_fields"):
                field_info = self.model.model_fields.get(name)
                if field_info is not None:
                    required = field_info.is_required()
            result.append(field_cls(key=name, required=required))
        return result

    @classmethod
    def _register_permissions(cls) -> None:
        """Register CRUD permissions in the quiver_permission registry."""
        from quiver.config import QuiverConfigError
        from quiver.rbac.registry import quiver_permission

        perm_group = (
            cls.permissions
            if isinstance(getattr(cls, "permissions", None), str)
            else getattr(cls, "route", None)
        )
        if not perm_group:
            return

        resource_title = getattr(cls, "title", None) or perm_group.replace("_", " ").title()
        for action in _BUILT_IN_CRUD_ACTIONS:
            name = f"{perm_group}.{action}"
            display = f"{action.title()} {resource_title}"
            try:
                quiver_permission(name, display_name=display, group=resource_title)
            except QuiverConfigError:
                pass  # already registered — skip duplicates
