# CRUD Engine

> 🇪🇸 [Versión en español](es/03-crud.md)

The CRUD Engine automatically generates the REST endpoints and the UI to manage any SQLModel model. You define a class with `model` and `route`, and Quiver does the rest.

---

## Basic definition

```python
from quiver import QuiverCRUD
from models import Product

class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
```

This generates:

| Endpoint | Description |
|---|---|
| `GET /quiver/v1/products/` | List with pagination, search and filters |
| `POST /quiver/v1/products/` | Create |
| `GET /quiver/v1/products/{id}` | View detail |
| `PATCH /quiver/v1/products/{id}` | Edit |
| `DELETE /quiver/v1/products/{id}` | Delete |
| `DELETE /quiver/v1/products/bulk` | Delete several |
| `GET /quiver/v1/products/choices` | Options for the SelectField of another CRUD |
| `GET /quiver/v1/products/schema` | Column and field metadata (used by the frontend) |

---

## Columns (list table)

Columns control what appears in the list table. If you don't define them, Quiver infers them from the model.

```python
from quiver.crud.columns import Column

class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    columns = [
        Column("name",       label="Nombre",    col_type="text",     sortable=True),
        Column("price",      label="Precio",    col_type="currency"),
        Column("is_active",  label="Estado",    col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
        Column("created_at", label="Creado",    col_type="datetime"),
    ]
```

### Available column types

| `col_type` | Rendering |
|---|---|
| `text` | Plain text |
| `number` | Number |
| `currency` | Number with currency symbol |
| `boolean` | Yes / No |
| `date` | Formatted date |
| `datetime` | Formatted date and time |
| `badge` | Colored chip (requires `badge_map`) |
| `link` | Clickable link |

### `badge_map`

Maps model values to `(label, variant)`. The available variants are: `active`, `inactive`, `success`, `danger`, `warning`, `admin`, `client`.

```python
Column("status", col_type="badge", badge_map={
    "published": ("Publicado", "success"),
    "draft":     ("Borrador",  "inactive"),
    "archived":  ("Archivado", "danger"),
})
```

### Excluding columns (automatic mode)

If you don't want to define all columns manually, use `exclude_columns` to omit some from autodetection:

```python
class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
    exclude_columns = ["internal_notes", "raw_data"]
```

---

## Fields (create/edit form)

Fields control the form. If you don't define them, Quiver infers them from the model, excluding `id`, `created_at` and `updated_at`.

```python
from quiver.crud.fields.text import TextField, EmailField, TextareaField, PasswordField
from quiver.crud.fields.misc import NumberField, CheckboxField
from quiver.crud.fields.select import SelectField, SelectMultipleField
from quiver.crud.fields.date import DateField, DateTimeField

class ProductCRUD(QuiverCRUD):
    fields = [
        TextField("name",         label="Nombre",      required=True),
        TextareaField("description", label="Descripción", rows=5),
        NumberField("price",      label="Precio",      required=True),
        CheckboxField("is_active", label="Activo",     default=True),
        SelectField("category_id", label="Categoría",  choices_from="categories"),
    ]
```

### Field reference

| Class | `field_type` | Notes |
|---|---|---|
| `TextField` | `text` | Single-line text |
| `EmailField` | `email` | Email format validation |
| `PasswordField` | `password` | Hides the value |
| `TextareaField` | `textarea` | Multiline. `rows=4` by default |
| `NumberField` | `number` | Integer or decimal |
| `CheckboxField` | `checkbox` | Boolean |
| `DateField` | `date` | Date picker |
| `DateTimeField` | `datetime` | Date and time picker |
| `SelectField` | `select` | Dropdown. `choices` or `choices_from` |
| `SelectMultipleField` | `select_multiple` | Multiple selection |
| `HiddenField` | `hidden` | Not visible, sent as-is |

### Common field parameters

| Parameter | Type | Description |
|---|---|---|
| `key` | `str` | Name of the field in the model |
| `label` | `str` | Visible label. Auto-derived if omitted. |
| `required` | `bool` | Whether the field is mandatory |
| `help_text` | `str` | Help text below the field |
| `read_only` | `bool` | Visible but not editable |
| `default` | `Any` | Initial form value |

### SelectField with static options

```python
SelectField("status", label="Estado", choices=[
    {"value": "draft",     "label": "Borrador"},
    {"value": "published", "label": "Publicado"},
    {"value": "archived",  "label": "Archivado"},
])
```

### SelectField with dynamic options (from another CRUD)

```python
# Loads the options from GET /quiver/v1/categories/choices
SelectField("category_id", label="Categoría", choices_from="categories")
```

The `/choices` endpoint returns `[{"value": id, "label": name}]` for each record.

---

## Filters

Filters appear in the search panel of the list.

```python
from quiver.crud.filters import TextFilter, SelectFilter, BooleanFilter, DateRangeFilter

class ProductCRUD(QuiverCRUD):
    filters = [
        TextFilter("name",      label="Nombre"),
        BooleanFilter("is_active", label="Estado"),
        SelectFilter("category_id", label="Categoría", choices=[
            {"value": 1, "label": "Ropa"},
            {"value": 2, "label": "Calzado"},
        ]),
        DateRangeFilter("created_at", label="Fecha de creación"),
    ]
```

### Filter types

| Class | Behavior |
|---|---|
| `TextFilter` | `ILIKE %value%` on the column |
| `SelectFilter` | Exact equality (`=`) |
| `BooleanFilter` | Filters by `true`/`false` |
| `DateRangeFilter` | `from` → `to` range on a date column |

---

## Free-text search

Define which columns the global search field searches in:

```python
class ProductCRUD(QuiverCRUD):
    search_fields = ["name", "description"]
```

---

## Pagination and ordering

```python
class ProductCRUD(QuiverCRUD):
    page_size = 25          # rows per page (default 25)
    order_by = "-created_at"  # - prefix for descending
```

---

## Lifecycle hooks

Override these methods in your class to add business logic:

```python
class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    async def before_create(self, data: dict, db, user: dict) -> dict:
        """Modify data before creating. Must return data."""
        data["name"] = data["name"].strip()
        return data

    async def after_create(self, instance, db, user: dict) -> None:
        """Runs after a successful create."""
        await notify_team(f"Nuevo producto: {instance.name}")

    async def before_update(self, data: dict, db, user: dict) -> dict:
        """Modify data before updating. Must return data."""
        return data

    async def after_update(self, instance, db, user: dict) -> None:
        """Runs after a successful update."""
        pass

    async def before_delete(self, instance, db, user: dict) -> None:
        """Runs before deleting. Raise an exception to cancel."""
        if instance.has_orders:
            from quiver.exceptions import QuiverBadRequest
            raise QuiverBadRequest("No se puede eliminar un producto con pedidos.")

    async def after_delete(self, instance_id, db, user: dict) -> None:
        """Runs after a successful delete."""
        pass
```

### Filtering the base queryset

To show only a subset of records (for example, only those of the current user):

```python
async def get_queryset(self, db, user: dict):
    from sqlmodel import select
    return select(Product).where(Product.owner_id == user["id"])
```

---

## Permissions

When you register a CRUD with `quiver.register(ProductCRUD)`, Quiver automatically registers these permissions:

| Permission | Action |
|---|---|
| `products.list` | Access to the list |
| `products.create` | Create records |
| `products.show` | View detail |
| `products.update` | Edit records |
| `products.delete` | Delete records |

The permission group is derived from `route` by default. To change it:

```python
class ProductCRUD(QuiverCRUD):
    route = "products"
    permissions = "catalog_products"   # use this name instead of "products"
```

---

## Reserved slugs

The following values cannot be used as `route` because they are reserved by Quiver:

`auth`, `users`, `roles`, `permissions`, `dashboard`, `portal`, `static`, `health`

---

## Complete example

```python
from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, TextareaField
from quiver.crud.fields.misc import NumberField, CheckboxField
from quiver.crud.fields.select import SelectField
from quiver.crud.filters import TextFilter, BooleanFilter, SelectFilter

from models import Product


class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
    title = "Productos"
    page_size = 20
    order_by = "-created_at"
    search_fields = ["name"]

    columns = [
        Column("name",       label="Nombre",    sortable=True),
        Column("price",      label="Precio",    col_type="currency"),
        Column("is_active",  label="Estado",    col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
        Column("created_at", label="Creado",    col_type="datetime"),
    ]

    fields = [
        TextField("name",             label="Nombre",       required=True),
        TextareaField("description",  label="Descripción"),
        NumberField("price",          label="Precio",       required=True),
        SelectField("category_id",    label="Categoría",    choices_from="categories"),
        CheckboxField("is_active",    label="Activo",       default=True),
    ]

    filters = [
        TextFilter("name"),
        BooleanFilter("is_active", label="Estado"),
    ]

    async def before_create(self, data, db, user):
        data["name"] = data["name"].strip()
        return data
```

---

← [Quick start](02-quick-start.md) | [Dashboard →](04-dashboard.md)
