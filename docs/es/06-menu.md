> 🇬🇧 [English version](../06-menu.md)

# Menú

El menú lateral del admin se configura en Python con `quiver.set_menu(...)`. Si no lo configuras, el sidebar aparece vacío (solo los ítems built-in de usuarios y roles son accesibles por URL directa).

---

## Estructura básica

```python
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

quiver = QuiverApp(app)

quiver.set_menu([
    MenuItem("Dashboard",  route="/admin"),
    MenuGroup("Catálogo", items=[
        MenuItem("Productos",   route="/admin/products",   permission="products.list"),
        MenuItem("Categorías",  route="/admin/categories", permission="categories.list"),
    ]),
    MenuGroup("Gestión", items=[
        MenuItem("Pedidos",     route="/admin/orders",     permission="orders.list"),
        MenuItem("Clientes",    route="/admin/customers",  permission="customers.list"),
    ]),
    MenuItem("Usuarios",   route="/admin/users",   permission="users.list"),
    MenuItem("Roles",      route="/admin/roles",   permission="roles.list"),
])
```

---

## `MenuItem`

Ítem de menú simple, sin hijos.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `label` | `str` | Texto visible en el sidebar |
| `route` | `str` | Ruta del frontend (p.ej. `/admin/products`) |
| `permission` | `str \| None` | Si se especifica, el ítem solo aparece si el usuario tiene ese permiso |
| `icon` | `str \| None` | Nombre del icono (reservado para uso futuro) |

```python
MenuItem("Pedidos", route="/admin/orders", permission="orders.list")
```

Si `permission` se omite, el ítem es siempre visible para cualquier usuario autenticado.

---

## `MenuGroup`

Agrupa ítems bajo un título colapsable.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `title` | `str` | Cabecera del grupo (en mayúsculas en el sidebar) |
| `items` | `list[MenuItem]` | Ítems que contiene el grupo |
| `icon` | `str \| None` | Icono del grupo (reservado) |

```python
MenuGroup("Catálogo", items=[
    MenuItem("Productos",  route="/admin/products",  permission="products.list"),
    MenuItem("Categorías", route="/admin/categories"),
])
```

Los grupos son colapsables por el usuario. El estado se guarda en `localStorage`.

---

## Visibilidad basada en permisos

El backend filtra los ítems por los permisos del usuario antes de devolver el menú. Un usuario solo ve los ítems para los que tiene permiso.

Los ítems sin `permission` son siempre visibles para cualquier usuario autenticado en el admin.

---

## Ítems de menú para páginas custom

Si añades una [página custom](07-paginas-custom.md), añade también su ítem al menú:

```python
from quiver.rbac.registry import quiver_permission

quiver_permission("reports.view", display_name="Ver reportes", group="Reportes")

quiver.set_menu([
    ...
    MenuGroup("Reportes", items=[
        MenuItem("Ventas del mes", route="/admin/reportes/ventas", permission="reports.view"),
    ]),
])
```

---

## Ejemplo completo

```python
# main.py
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

from cruds.product_crud import ProductCRUD
from cruds.category_crud import CategoryCRUD
from cruds.order_crud import OrderCRUD
import permissions  # registra permisos custom

app = FastAPI()
quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register(CategoryCRUD)
quiver.register(OrderCRUD)

quiver.set_menu([
    MenuItem("Dashboard", route="/admin"),
    MenuGroup("Catálogo", items=[
        MenuItem("Productos",   route="/admin/products",   permission="products.list"),
        MenuItem("Categorías",  route="/admin/categories", permission="categories.list"),
    ]),
    MenuGroup("Ventas", items=[
        MenuItem("Pedidos",     route="/admin/orders",     permission="orders.list"),
    ]),
    MenuGroup("Reportes", items=[
        MenuItem("Ventas del mes", route="/admin/reportes/ventas", permission="reports.view"),
    ]),
    MenuItem("Usuarios", route="/admin/users", permission="users.list"),
    MenuItem("Roles",    route="/admin/roles",  permission="roles.list"),
])
```

---

← [Roles y permisos](05-rbac.md) | [Páginas custom →](07-paginas-custom.md)
