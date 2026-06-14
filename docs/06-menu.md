> 🇪🇸 [Versión en español](es/06-menu.md)

# Menu

The admin sidebar menu is configured in Python with `quiver.set_menu(...)`. If you don't configure it, the sidebar appears empty (only the built-in users and roles items are reachable via direct URL).

---

## Basic structure

```python
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

quiver = QuiverApp(app)

quiver.set_menu([
    MenuItem("Dashboard",  route="/admin"),
    MenuGroup("Catalog", items=[
        MenuItem("Products",   route="/admin/products",   permission="products.list"),
        MenuItem("Categories", route="/admin/categories", permission="categories.list"),
    ]),
    MenuGroup("Management", items=[
        MenuItem("Orders",     route="/admin/orders",     permission="orders.list"),
        MenuItem("Customers",  route="/admin/customers",  permission="customers.list"),
    ]),
    MenuItem("Users",   route="/admin/users",   permission="users.list"),
    MenuItem("Roles",   route="/admin/roles",   permission="roles.list"),
])
```

---

## `MenuItem`

A simple menu item, with no children.

| Parameter | Type | Description |
|---|---|---|
| `label` | `str` | Text shown in the sidebar |
| `route` | `str` | Frontend route (e.g. `/admin/products`) |
| `permission` | `str \| None` | If set, the item only appears when the user has that permission |
| `icon` | `str \| None` | Icon name (reserved for future use) |

```python
MenuItem("Orders", route="/admin/orders", permission="orders.list")
```

If `permission` is omitted, the item is always visible to any authenticated user.

---

## `MenuGroup`

Groups items under a collapsible heading.

| Parameter | Type | Description |
|---|---|---|
| `title` | `str` | Group heading (shown in uppercase in the sidebar) |
| `items` | `list[MenuItem]` | Items the group contains |
| `icon` | `str \| None` | Group icon (reserved) |

```python
MenuGroup("Catalog", items=[
    MenuItem("Products",   route="/admin/products",  permission="products.list"),
    MenuItem("Categories", route="/admin/categories"),
])
```

Groups can be collapsed by the user. The state is saved in `localStorage`.

---

## Permission-based visibility

The backend filters items by the user's permissions before returning the menu. A user only sees the items they have permission for.

Items without `permission` are always visible to any authenticated user in the admin.

---

## Menu items for custom pages

If you add a [custom page](07-custom-pages.md), add its menu item too:

```python
from quiver.rbac.registry import quiver_permission

quiver_permission("reports.view", display_name="View reports", group="Reports")

quiver.set_menu([
    ...
    MenuGroup("Reports", items=[
        MenuItem("Monthly sales", route="/admin/reports/sales", permission="reports.view"),
    ]),
])
```

---

## Full example

```python
# main.py
from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

from cruds.product_crud import ProductCRUD
from cruds.category_crud import CategoryCRUD
from cruds.order_crud import OrderCRUD
import permissions  # registers custom permissions

app = FastAPI()
quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register(CategoryCRUD)
quiver.register(OrderCRUD)

quiver.set_menu([
    MenuItem("Dashboard", route="/admin"),
    MenuGroup("Catalog", items=[
        MenuItem("Products",   route="/admin/products",   permission="products.list"),
        MenuItem("Categories", route="/admin/categories", permission="categories.list"),
    ]),
    MenuGroup("Sales", items=[
        MenuItem("Orders",     route="/admin/orders",     permission="orders.list"),
    ]),
    MenuGroup("Reports", items=[
        MenuItem("Monthly sales", route="/admin/reports/sales", permission="reports.view"),
    ]),
    MenuItem("Users", route="/admin/users", permission="users.list"),
    MenuItem("Roles", route="/admin/roles",  permission="roles.list"),
])
```

---

← [Roles and permissions](05-rbac.md) | [Custom pages →](07-custom-pages.md)
