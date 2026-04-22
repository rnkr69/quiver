# Inicio rápido

En esta guía construirás una app funcional que usa Quiver paso a paso: un CRUD para gestionar productos, una StatCard en el dashboard, roles y un portal de usuario. Tiempo estimado: 20 minutos.

Se asume que ya tienes Quiver instalado y las tablas creadas. Si no, sigue primero la [guía de instalación](01-instalacion.md).

---

## El proyecto de ejemplo

Partimos de una app FastAPI con un modelo `Product`:

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

## 1. Montar Quiver

```python
# main.py
from fastapi import FastAPI
from quiver import QuiverApp
from models import Product

app = FastAPI(title="Mi tienda")
quiver = QuiverApp(app)
```

---

## 2. Crear un CRUD para productos

Crea el fichero `cruds/product_crud.py`:

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

Regístralo en `main.py`:

```python
from cruds.product_crud import ProductCRUD

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
```

Quiver genera automáticamente los endpoints REST y la UI para listar, crear, editar y eliminar productos. Abre `http://localhost:5173/admin/products` para verlo.

---

## 3. Configurar el menú lateral

Define la estructura del sidebar del admin:

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

Los ítems con `permission` solo se muestran si el usuario tiene ese permiso. Si `permission` se omite, el ítem es siempre visible.

---

## 4. Añadir una StatCard al dashboard

Crea `widgets/product_stats.py`:

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

Regístralos en `main.py`:

```python
import widgets.product_stats as stats

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register_widget(stats.total_products)
quiver.register_widget(stats.active_products)
```

---

## 5. Crear roles y asignar permisos

Arranca la app y entra al panel como superuser. Desde la UI:

1. Ve a **Roles** → **Nuevo rol**
2. Crea el rol `editor` con los permisos `products.list`, `products.create`, `products.update`
3. Crea el rol `viewer` con solo `products.list`

Los permisos `products.*` los registró Quiver automáticamente al hacer `quiver.register(ProductCRUD)`.

---

## 6. Añadir un usuario con rol

Desde la UI:

1. Ve a **Usuarios** → **Nuevo usuario**
2. Rellena los datos y asígnale el rol `editor`
3. El usuario podrá listar y editar productos, pero no crearlos (si no tiene `products.create`)

---

## 7. Añadir lógica de negocio (hooks)

Si crear un producto implica lógica adicional, usa los hooks del CRUD:

```python
class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    async def before_create(self, data, db, user):
        # Normalizar el nombre antes de guardar
        data["name"] = data["name"].strip().title()
        return data

    async def after_create(self, instance, db, user):
        # Lógica post-creación: notificación, caché, etc.
        print(f"Producto creado: {instance.name} por {user['email']}")
```

Hooks disponibles: `before_create`, `after_create`, `before_update`, `after_update`, `before_delete`, `after_delete`.

---

## Resultado

Al final de esta guía tienes:

- Panel admin en `http://localhost:5173/auth/login`
- CRUD de productos en `/admin/products` (list, create, edit, delete, search)
- Dashboard con StatCards en `/admin`
- Sistema de roles con permisos granulares
- Menú lateral configurable

---

## `main.py` completo

```python
from fastapi import FastAPI
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

from cruds.product_crud import ProductCRUD
import widgets.product_stats as stats

app = FastAPI(title="Mi tienda")

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

← [Instalación](01-instalacion.md) | [CRUD Engine →](03-crud.md)
