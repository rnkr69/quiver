# Roles y permisos

> 🇬🇧 [English version](../05-rbac.md)

Quiver usa un sistema RBAC (Role-Based Access Control): los usuarios tienen roles, los roles tienen permisos, y los permisos controlan el acceso a cada acción.

---

## Cómo funciona

1. Los **permisos** se registran en el código (no en la base de datos)
2. Los **roles** se crean desde la UI del admin
3. Los **usuarios** reciben roles desde la UI
4. En el frontend, el componente `<Can>` controla qué se muestra según los permisos del usuario

---

## Permisos automáticos de los CRUDs

Al hacer `quiver.register(MiCRUD)`, Quiver registra automáticamente cinco permisos con el formato `{route}.{acción}`:

| Permiso | Acción |
|---|---|
| `products.list` | Ver el listado |
| `products.create` | Crear registros |
| `products.show` | Ver el detalle |
| `products.update` | Editar registros |
| `products.delete` | Eliminar registros |

---

## Permisos personalizados

Para proteger recursos que no son CRUDs (reportes, acciones especiales, exportaciones), registra permisos manualmente:

```python
from quiver.rbac.registry import quiver_permission

# En un fichero de permisos o al inicio del módulo
quiver_permission("reports.view",   display_name="Ver reportes",    group="Reportes")
quiver_permission("reports.export", display_name="Exportar datos",  group="Reportes")
quiver_permission("settings.edit",  display_name="Editar ajustes",  group="Configuración")
```

**Reglas del nombre:**
- Formato obligatorio: `grupo.accion` (solo letras minúsculas, números y guiones bajos)
- Ejemplos válidos: `orders.refund`, `inventory.adjust_stock`, `reports.view`
- Ejemplos inválidos: `Orders.View`, `orders-view`, `orders`

**Cuándo registrar:** los permisos deben registrarse antes de que se cree `QuiverApp`. Al arrancar, Quiver sincroniza el registro con la base de datos automáticamente.

```python
# main.py
import permissions  # importar activa el registro
from quiver import QuiverApp

quiver = QuiverApp(app)
```

```python
# permissions.py
from quiver.rbac.registry import quiver_permission

quiver_permission("reports.view",   display_name="Ver reportes",   group="Reportes")
quiver_permission("reports.export", display_name="Exportar datos", group="Reportes")
```

---

## Gestionar roles desde la UI

1. Entra al admin → **Roles** → **Nuevo rol**
2. Asigna un nombre (p.ej. `editor`) y una descripción
3. Activa los permisos que quieras
4. Guarda

Para asignar el rol a un usuario: **Usuarios** → edita el usuario → sección Roles.

---

## Control de acceso en el frontend

### Componente `<Can>`

Muestra su contenido solo si el usuario tiene el permiso indicado:

```tsx
import { Can } from '@/components/access/Can'

<Can do="products.create">
  <Button onClick={openCreateModal}>Nuevo producto</Button>
</Can>
```

### Componente `<HasRole>`

Muestra su contenido si el usuario tiene el rol indicado:

```tsx
import { HasRole } from '@/components/access/HasRole'

<HasRole role="admin">
  <DangerZone />
</HasRole>
```

### Proteger una ruta completa

Usa el guard `<RequireRole>` en el router para bloquear el acceso a páginas enteras:

```tsx
import { RequireRole } from '@/guards/RequireRole'

<RequireRole roles={['admin']}>
  <ReportsPage />
</RequireRole>
```

Si el usuario no tiene ninguno de los roles requeridos, se le redirige a `/403`.

---

## Superuser

El superuser tiene acceso total, sin importar los permisos o roles asignados. Créalo con:

```bash
quiver create-superuser
```

---

## Referencia de la API de permisos

```python
from quiver.rbac.registry import quiver_permission, get_registry

# Registrar un permiso
quiver_permission(
    "orders.refund",
    display_name="Reembolsar pedidos",
    group="Pedidos",
)

# Consultar todos los permisos registrados (útil para debugging)
registry = get_registry()
# {"orders.refund": PermissionDefinition(name="orders.refund", ...), ...}
```

---

← [Dashboard](04-dashboard.md) | [Menú →](06-menu.md)
