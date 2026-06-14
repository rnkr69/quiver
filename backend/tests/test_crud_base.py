from __future__ import annotations

import enum
import os
from datetime import datetime

from sqlmodel import Field, SQLModel

os.environ.setdefault("SECRET_KEY", "test-secret-crud")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from quiver.crud import (
    CheckboxField,
    Column,
    NumberField,
    QuiverCRUD,
    SelectField,
    TextField,
)
from quiver.crud.fields.text import PasswordField
from quiver.rbac.registry import _PERMISSION_REGISTRY

# ─── Test model ─────────────────────────────────────────────────────────────


class Category(enum.Enum):
    A = "a"
    B = "b"


class Product(SQLModel, table=False):
    id: str | None = Field(default=None, primary_key=True)
    name: str
    price: float
    is_active: bool = True
    category: Category | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ─── Minimal CRUD ────────────────────────────────────────────────────────────


class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"


# ─── Tests ───────────────────────────────────────────────────────────────────


def test_auto_columns():
    crud = ProductCRUD()
    cols = crud._get_effective_columns()
    keys = [c.key for c in cols]
    assert "name" in keys
    assert "price" in keys
    assert "is_active" in keys


def test_auto_columns_type_mapping():
    crud = ProductCRUD()
    cols = {c.key: c for c in crud._get_effective_columns()}
    assert cols["name"].col_type == "text"
    assert cols["price"].col_type == "number"
    assert cols["is_active"].col_type == "boolean"
    assert cols["category"].col_type == "badge"


def test_exclude_columns():
    class PartialCRUD(QuiverCRUD):
        model = Product
        route = "partial_products"
        exclude_columns = ["price"]

    crud = PartialCRUD()
    keys = [c.key for c in crud._get_effective_columns()]
    assert "price" not in keys
    assert "name" in keys


def test_explicit_columns():
    class ExplicitCRUD(QuiverCRUD):
        model = Product
        route = "explicit_products"
        columns = [Column("name", sortable=True), Column("price", col_type="currency")]

    crud = ExplicitCRUD()
    cols = crud._get_effective_columns()
    assert len(cols) == 2
    assert cols[0].key == "name"
    assert cols[0].sortable is True
    assert cols[1].col_type == "currency"


def test_auto_fields_excludes_id_created_updated():
    crud = ProductCRUD()
    keys = [f.key for f in crud._get_effective_fields()]
    assert "id" not in keys
    assert "created_at" not in keys
    assert "updated_at" not in keys
    assert "name" in keys


def test_auto_fields_type_mapping():
    crud = ProductCRUD()
    fields = {f.key: f for f in crud._get_effective_fields()}
    assert isinstance(fields["name"], TextField)
    assert isinstance(fields["price"], NumberField)
    assert isinstance(fields["is_active"], CheckboxField)
    assert isinstance(fields["category"], SelectField)


def test_exclude_fields():
    class ExcludeCRUD(QuiverCRUD):
        model = Product
        route = "excl_products"
        exclude_fields = ["price"]

    crud = ExcludeCRUD()
    keys = [f.key for f in crud._get_effective_fields()]
    assert "price" not in keys
    assert "name" in keys


def test_explicit_fields():
    class ExplicitFieldsCRUD(QuiverCRUD):
        model = Product
        route = "expl_fields"
        fields = [TextField("name", required=True), NumberField("price")]

    crud = ExplicitFieldsCRUD()
    fields = crud._get_effective_fields()
    assert len(fields) == 2
    assert fields[0].key == "name"
    assert fields[0].required is True


def test_permissions_auto_registered():
    class PermCRUD(QuiverCRUD):
        model = Product
        route = "perm_resource"

    PermCRUD._register_permissions()
    for action in ("list", "create", "show", "update", "delete"):
        assert f"perm_resource.{action}" in _PERMISSION_REGISTRY


def test_permissions_custom_group():
    class GroupCRUD(QuiverCRUD):
        model = Product
        route = "group_test"
        permissions = "items"

    GroupCRUD._register_permissions()
    assert "items.list" in _PERMISSION_REGISTRY
    assert "items.create" in _PERMISSION_REGISTRY


def test_column_to_dict():
    col = Column("name", label="Nombre", col_type="text", sortable=True)
    d = col.to_dict()
    assert d["key"] == "name"
    assert d["label"] == "Nombre"
    assert d["sortable"] is True


def test_field_to_dict():
    f = TextField("name", label="Nombre", required=True)
    d = f.to_dict()
    assert d["key"] == "name"
    assert d["field_type"] == "text"
    assert d["required"] is True


def test_password_field_type():
    f = PasswordField("password")
    assert f.to_dict()["field_type"] == "password"
