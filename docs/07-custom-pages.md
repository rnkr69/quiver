> 🇪🇸 [Versión en español](es/07-paginas-custom.md)

# Custom pages

Custom pages let you add arbitrary screens to the admin or the portal — reports, internal tools, complex views — without them being standard CRUDs.

---

## How it works

1. You register the page in Python with `@quiver_page`
2. You create the corresponding React component in the frontend
3. You register it in `PageRegistry` so Quiver can load it dynamically

---

## Step 1 — Register the page in Python

```python
# pages/sales_report.py
from quiver.pages.registry import quiver_page, QuiverPage


@quiver_page(
    route="/admin/reportes/ventas",
    layout="admin",
    title="Ventas del mes",
    component="SalesReportPage",    # name of the React component
    permission="reports.view",      # required permission
)
class SalesReportPage(QuiverPage):
    pass
```

Import the module before creating `QuiverApp` so the decorator runs:

```python
# main.py
import pages.sales_report  # triggers the @quiver_page decorator

quiver = QuiverApp(app)
```

### `@quiver_page` parameters

| Parameter | Type | Description |
|---|---|---|
| `route` | `str` | Frontend route. Must start with `/admin/` or `/portal/`. |
| `layout` | `str` | `"admin"` or `"portal"` |
| `title` | `str` | Page title (used in the breadcrumb) |
| `component` | `str` | Exact name of the React component registered in `PageRegistry` |
| `permission` | `str` | Only for `layout="admin"`. Required. |
| `allowed_roles` | `list[str]` | Only for `layout="portal"`. Required. |

---

## Step 2 — Create the React component

Create the file in your project:

```tsx
// quiver-ui/src/pages/admin/SalesReportPage.tsx
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export function SalesReportPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Call your own API, not Quiver
    fetch('/api/v1/reports/sales').then(r => r.json()).then(setData)
  }, [])

  return (
    <div>
      <PageHeader title="Ventas del mes" />
      <Card>
        {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Cargando...'}
      </Card>
    </div>
  )
}
```

---

## Step 3 — Register the component in PageRegistry

```tsx
// quiver-ui/src/main.tsx
import { PageRegistry } from '@/plugin/PageRegistry'
import { SalesReportPage } from '@/pages/admin/SalesReportPage'

PageRegistry.register('SalesReportPage', SalesReportPage)
```

The name you use in `PageRegistry.register` must be exactly the same as the `component` in `@quiver_page`.

---

## Page in the user portal

To add a page to the portal, use `layout="portal"` and `allowed_roles` instead of `permission`:

```python
# pages/vip_page.py
from quiver.pages.registry import quiver_page, QuiverPage


@quiver_page(
    route="/portal/vip",
    layout="portal",
    title="Zona VIP",
    component="VipPage",
    allowed_roles=["cliente_premium", "admin"],
)
class VipPage(QuiverPage):
    pass
```

```tsx
// quiver-ui/src/pages/portal/VipPage.tsx
export function VipPage() {
  return <div>Contenido exclusivo para clientes premium</div>
}
```

```tsx
// quiver-ui/src/main.tsx
import { VipPage } from '@/pages/portal/VipPage'
PageRegistry.register('VipPage', VipPage)
```

---

## Adding the page to the menu

Custom pages do not appear in the menu automatically. Add the item manually:

```python
quiver.set_menu([
    ...
    MenuGroup("Reportes", items=[
        MenuItem("Ventas del mes", route="/admin/reportes/ventas", permission="reports.view"),
    ]),
])
```

---

## Multiple pages

```python
# pages/__init__.py
from quiver.pages.registry import quiver_page, QuiverPage


@quiver_page(route="/admin/reportes/ventas",    layout="admin", title="Ventas",      component="SalesPage",    permission="reports.view")
class SalesPage(QuiverPage): pass

@quiver_page(route="/admin/reportes/inventario", layout="admin", title="Inventario",  component="InventoryPage", permission="reports.view")
class InventoryPage(QuiverPage): pass

@quiver_page(route="/portal/vip",               layout="portal", title="Zona VIP",   component="VipPage",       allowed_roles=["cliente_premium"])
class VipPage(QuiverPage): pass
```

```python
# main.py
import pages  # importing the package runs all the decorators
quiver = QuiverApp(app)
```

---

← [Menu](06-menu.md) | [Portal →](08-portal.md)
