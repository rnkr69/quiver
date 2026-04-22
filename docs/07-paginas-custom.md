# Páginas custom

Las páginas custom permiten añadir pantallas arbitrarias al admin o al portal — reportes, herramientas internas, vistas complejas — sin que sean CRUDs estándar.

---

## Cómo funciona

1. Registras la página en Python con `@quiver_page`
2. Creas el componente React correspondiente en el frontend
3. Lo registras en `PageRegistry` para que Quiver lo pueda cargar dinámicamente

---

## Paso 1 — Registrar la página en Python

```python
# pages/sales_report.py
from quiver.pages.registry import quiver_page, QuiverPage


@quiver_page(
    route="/admin/reportes/ventas",
    layout="admin",
    title="Ventas del mes",
    component="SalesReportPage",    # nombre del componente React
    permission="reports.view",      # permiso requerido
)
class SalesReportPage(QuiverPage):
    pass
```

Importa el módulo antes de crear `QuiverApp` para que el decorador se ejecute:

```python
# main.py
import pages.sales_report  # activa el decorador @quiver_page

quiver = QuiverApp(app)
```

### Parámetros de `@quiver_page`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `route` | `str` | Ruta del frontend. Debe empezar por `/admin/` o `/portal/`. |
| `layout` | `str` | `"admin"` o `"portal"` |
| `title` | `str` | Título de la página (usado en el breadcrumb) |
| `component` | `str` | Nombre exacto del componente React registrado en `PageRegistry` |
| `permission` | `str` | Solo para `layout="admin"`. Obligatorio. |
| `allowed_roles` | `list[str]` | Solo para `layout="portal"`. Obligatorio. |

---

## Paso 2 — Crear el componente React

Crea el fichero en tu proyecto:

```tsx
// quiver-ui/src/pages/admin/SalesReportPage.tsx
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export function SalesReportPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Llama a tu propia API, no a Quiver
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

## Paso 3 — Registrar el componente en PageRegistry

```tsx
// quiver-ui/src/main.tsx
import { PageRegistry } from '@/plugin/PageRegistry'
import { SalesReportPage } from '@/pages/admin/SalesReportPage'

PageRegistry.register('SalesReportPage', SalesReportPage)
```

El nombre que usas en `PageRegistry.register` debe ser exactamente el mismo que el `component` en `@quiver_page`.

---

## Página en el portal de usuario

Para añadir una página al portal, usa `layout="portal"` y `allowed_roles` en vez de `permission`:

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

## Añadir la página al menú

Las páginas custom no aparecen automáticamente en el menú. Añade el ítem manualmente:

```python
quiver.set_menu([
    ...
    MenuGroup("Reportes", items=[
        MenuItem("Ventas del mes", route="/admin/reportes/ventas", permission="reports.view"),
    ]),
])
```

---

## Múltiples páginas

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
import pages  # importar el paquete ejecuta todos los decoradores
quiver = QuiverApp(app)
```

---

← [Menú](06-menu.md) | [Portal →](08-portal.md)
