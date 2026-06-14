# Quick start

> 🇪🇸 [Versión en español](es/02-inicio-rapido.md)

In this guide you'll build a working app that uses Quiver step by step: a CRUD to manage products, a StatCard on the dashboard, roles, and a user portal. Estimated time: 20 minutes.

This assumes you already have Quiver installed and the tables created. If not, follow the [installation guide](01-installation.md) first.

---

## The example project

We start from a FastAPI app with a `Product` model:

```python
# models.py
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## 1. Mount Quiver

```python
# main.py
from fastapi import FastAPI
from quiver import QuiverApp
from models import Product

app = FastAPI(title="My store")
quiver = QuiverApp(app)
```

---

## 2. Create a CRUD for products

Create the file `cruds/product_crud.py`:

```python
from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField
from quiver.crud.fields.misc import NumberField, CheckboxField

from models import Product


class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
    title = "Productos"

    columns = [
        Column("name",      label="Nombre",   sortable=True),
        Column("price",     label="Precio",   col_type="currency"),
        Column("is_active", label="Estado",   col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
        Column("created_at", label="Creado",  col_type="datetime"),
    ]

    fields = [
        TextField("name",          label="Nombre",  required=True),
        NumberField("price",       label="Precio",  required=True),
        CheckboxField("is_active", label="Activo",  default=True),
    ]

    search_fields = ["name"]
    order_by = "-created_at"
```

Register it in `main.py`:

```python
from cruds.product_crud import ProductCRUD

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
```

Quiver automatically generates the REST endpoints and the UI to list, create, edit, and delete products. The admin UI is the separate frontend SPA — start it from `frontend/` (`npm install && npm run dev`) and open `http://localhost:5173/admin/products` to see it.

---

## 3. Configure the sidebar menu

Define the structure of the admin sidebar:

```python
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

quiver = QuiverApp(app)
quiver.register(ProductCRUD)

quiver.set_menu([
    MenuItem("Dashboard",  route="/admin"),
    MenuGroup("Catálogo", items=[
        MenuItem("Productos", route="/admin/products", permission="products.list"),
    ]),
    MenuItem("Usuarios",  route="/admin/users",    permission="users.list"),
    MenuItem("Roles",     route="/admin/roles",    permission="roles.list"),
])
```

Items with a `permission` are only shown if the user has that permission. If `permission` is omitted, the item is always visible.

---

## 4. Add a StatCard to the dashboard

Create `widgets/product_stats.py`:

```python
from quiver.dashboard.widgets.stat_card import StatCardWidget
from models import Product


total_products = StatCardWidget(
    "Total de productos",
    model=Product,
)

active_products = StatCardWidget(
    "Productos activos",
    model=Product,
    filter_fn=lambda q: q.where(Product.is_active == True),
)
```

Register them in `main.py`:

```python
import widgets.product_stats as stats

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register_widget(stats.total_products)
quiver.register_widget(stats.active_products)
```

---

## 5. Create roles and assign permissions

Start the app and log in to the panel as a superuser. From the UI:

1. Go to **Roles** → **New role**
2. Create the `editor` role with the permissions `products.list`, `products.create`, `products.update`
3. Create the `viewer` role with only `products.list`

The `products.*` permissions were registered automatically by Quiver when you called `quiver.register(ProductCRUD)`.

---

## 6. Add a user with a role

From the UI:

1. Go to **Users** → **New user**
2. Fill in the details and assign the `editor` role
3. The user will be able to list and edit products, but not create them (if they don't have `products.create`)

---

## 7. Add business logic (hooks)

If creating a product involves additional logic, use the CRUD hooks:

```python
class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    async def before_create(self, data, db, user):
        # Normalize the name before saving
        data["name"] = data["name"].strip().title()
        return data

    async def after_create(self, instance, db, user):
        # Post-creation logic: notification, cache, etc.
        print(f"Producto creado: {instance.name} por {user['email']}")
```

Available hooks: `before_create`, `after_create`, `before_update`, `after_update`, `before_delete`, `after_delete`.

---

## Result

At the end of this guide you have:

- Admin panel at `http://localhost:5173/auth/login`
- Product CRUD at `/admin/products` (list, create, edit, delete, search)
- Dashboard with StatCards at `/admin`
- Role system with granular permissions
- Configurable sidebar menu

---

## Complete `main.py`

```python
from fastapi import FastAPI
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

from cruds.product_crud import ProductCRUD
import widgets.product_stats as stats

app = FastAPI(title="My store")

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register_widget(stats.total_products)
quiver.register_widget(stats.active_products)

quiver.set_menu([
    MenuItem("Dashboard",  route="/admin"),
    MenuGroup("Catálogo", items=[
        MenuItem("Productos", route="/admin/products", permission="products.list"),
    ]),
    MenuItem("Usuarios", route="/admin/users", permission="users.list"),
    MenuItem("Roles",    route="/admin/roles",  permission="roles.list"),
])
```

---

← [Installation](01-installation.md) | [CRUD Engine →](03-crud.md)
