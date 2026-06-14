# Roles and permissions

> 🇪🇸 [Versión en español](es/05-rbac.md)

Quiver uses an RBAC (Role-Based Access Control) system: users have roles, roles have permissions, and permissions control access to each action.

---

## How it works

1. **Permissions** are registered in code (not in the database)
2. **Roles** are created from the admin UI
3. **Users** are assigned roles from the UI
4. On the frontend, the `<Can>` component controls what is shown based on the user's permissions

---

## Automatic CRUD permissions

When you call `quiver.register(MyCRUD)`, Quiver automatically registers five permissions with the format `{route}.{action}`:

| Permission | Action |
|---|---|
| `products.list` | View the list |
| `products.create` | Create records |
| `products.show` | View the detail |
| `products.update` | Edit records |
| `products.delete` | Delete records |

---

## Custom permissions

To protect resources that are not CRUDs (reports, special actions, exports), register permissions manually:

```python
from quiver.rbac.registry import quiver_permission

# In a permissions file or at the top of the module
quiver_permission("reports.view",   display_name="View reports",   group="Reports")
quiver_permission("reports.export", display_name="Export data",    group="Reports")
quiver_permission("settings.edit",  display_name="Edit settings",  group="Configuration")
```

**Name rules:**
- Required format: `group.action` (only lowercase letters, numbers and underscores)
- Valid examples: `orders.refund`, `inventory.adjust_stock`, `reports.view`
- Invalid examples: `Orders.View`, `orders-view`, `orders`

**When to register:** permissions must be registered before `QuiverApp` is created. On startup, Quiver synchronizes the registry with the database automatically.

```python
# main.py
import permissions  # importing triggers the registration
from quiver import QuiverApp

quiver = QuiverApp(app)
```

```python
# permissions.py
from quiver.rbac.registry import quiver_permission

quiver_permission("reports.view",   display_name="View reports", group="Reports")
quiver_permission("reports.export", display_name="Export data",  group="Reports")
```

---

## Managing roles from the UI

1. Go to the admin → **Roles** → **New role**
2. Assign a name (e.g. `editor`) and a description
3. Enable the permissions you want
4. Save

To assign the role to a user: **Users** → edit the user → Roles section.

---

## Access control on the frontend

### `<Can>` component

Renders its content only if the user has the given permission:

```tsx
import { Can } from '@/components/access/Can'

<Can do="products.create">
  <Button onClick={openCreateModal}>New product</Button>
</Can>
```

### `<HasRole>` component

Renders its content if the user has the given role:

```tsx
import { HasRole } from '@/components/access/HasRole'

<HasRole role="admin">
  <DangerZone />
</HasRole>
```

### Protecting a whole route

Use the `<RequireRole>` guard in the router to block access to entire pages:

```tsx
import { RequireRole } from '@/guards/RequireRole'

<RequireRole roles={['admin']}>
  <ReportsPage />
</RequireRole>
```

If the user does not have one of the required roles, they are redirected to `/403`.

---

## Superuser

The superuser has full access, regardless of the permissions or roles assigned. Create one with:

```bash
quiver create-superuser
```

---

## Permissions API reference

```python
from quiver.rbac.registry import quiver_permission, get_registry

# Register a permission
quiver_permission(
    "orders.refund",
    display_name="Refund orders",
    group="Orders",
)

# Query all registered permissions (useful for debugging)
registry = get_registry()
# {"orders.refund": PermissionDefinition(name="orders.refund", ...), ...}
```

---

← [Dashboard](04-dashboard.md) | [Menu →](06-menu.md)
