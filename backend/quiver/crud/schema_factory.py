from __future__ import annotations

from typing import Any, Optional, get_args, get_origin

from pydantic import create_model

from quiver.crud.fields.base import QuiverField
from quiver.crud.fields.text import PasswordField


def _field_to_pydantic(field: QuiverField) -> tuple[Any, Any]:
    """Return (type, default_or_FieldInfo) suitable for pydantic create_model."""
    from pydantic import Field as PField

    python_type: Any
    if field.field_type in ("text", "email", "password", "textarea"):
        python_type = str
    elif field.field_type == "number":
        python_type = float
    elif field.field_type == "checkbox":
        python_type = bool
    elif field.field_type in ("date",):
        from datetime import date
        python_type = date
    elif field.field_type in ("datetime",):
        from datetime import datetime
        python_type = datetime
    elif field.field_type in ("select", "select_multiple"):
        python_type = str
    else:
        python_type = str

    if field.required:
        return (python_type, PField(...))
    else:
        default = field.default
        return (Optional[python_type], PField(default=default))


def create_schemas(crud_class) -> tuple[type, type, type]:
    """Return (CreateSchema, UpdateSchema, ReadSchema) for the given CRUD class."""
    crud_instance = crud_class()
    effective_fields = crud_instance._get_effective_fields() if hasattr(crud_instance, "_get_effective_fields") else []

    # --- CreateSchema: include all non-password fields with required/optional ---
    create_fields: dict[str, Any] = {}
    for f in effective_fields:
        create_fields[f.key] = _field_to_pydantic(f)

    CreateSchema = create_model(
        f"{crud_class.__name__}Create",
        **create_fields,
    )

    # --- UpdateSchema: all fields optional ---
    update_fields: dict[str, Any] = {}
    for f in effective_fields:
        python_type, _ = _field_to_pydantic(f)
        # Unwrap Optional if already wrapped
        inner = python_type
        if get_origin(python_type) is type(None):
            inner = python_type
        from pydantic import Field as PField
        update_fields[f.key] = (Optional[inner], PField(default=None))

    UpdateSchema = create_model(
        f"{crud_class.__name__}Update",
        **update_fields,
    )

    # --- ReadSchema: all model fields except password ---
    read_fields: dict[str, Any] = {}
    model = crud_class.model
    if hasattr(model, "model_fields"):
        for name, info in model.model_fields.items():
            # check if any PasswordField in effective_fields matches this key
            field_types = {f.key: f for f in effective_fields}
            if name in field_types and isinstance(field_types[name], PasswordField):
                continue  # never expose password hashes in read
            annotation = info.annotation
            from pydantic import Field as PField
            read_fields[name] = (Optional[annotation], PField(default=None))

    ReadSchema = create_model(
        f"{crud_class.__name__}Read",
        **read_fields,
    )

    return CreateSchema, UpdateSchema, ReadSchema
