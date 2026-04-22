# Ejemplos

El directorio `examples/` contiene proyectos funcionales listos para ejecutar que demuestran cómo integrar Quiver en aplicaciones reales.

---

## Gestión de materiales de almacén

**Ruta:** `examples/almacen/`

Sistema de gestión de stock para un almacén: catálogo de materiales, proveedores, registro de entradas/salidas y alertas de stock bajo.

### Qué incluye

| Fichero | Qué demuestra |
|---|---|
| `models.py` | Cuatro modelos SQLModel relacionados con enums (`UnidadMedida`, `TipoMovimiento`) |
| `cruds/categoria_crud.py` | CRUD básico con búsqueda de texto |
| `cruds/proveedor_crud.py` | CRUD con `EmailField`, filtros de texto y booleano |
| `cruds/material_crud.py` | `SelectField` con `choices_from` (opciones dinámicas desde otro CRUD), `SelectField` con enum, hook `before_update` |
| `cruds/movimiento_crud.py` | Hook `before_create` con lógica de negocio completa; `before_delete` que bloquea el borrado |
| `widgets/almacen_stats.py` | Cuatro `StatCardWidget` (con y sin `filter_fn`, con y sin `permission`) y un `ChartWidget` |
| `pages/alertas_stock.py` | Página custom con `@quiver_page` y `permission` personalizado |
| `permissions.py` | Tres permisos custom registrados con `quiver_permission` |
| `seed.py` | Script que carga 15 materiales, 3 proveedores y ~40 movimientos históricos |

### Lógica de negocio destacada

El `MovimientoCRUD` actualiza `Material.stock_actual` de forma automática dentro del hook `before_create`:

- **Entrada** → `stock_actual += cantidad`
- **Salida** → `stock_actual -= cantidad` (lanza `QuiverBadRequest` si no hay stock suficiente)
- **Ajuste** → `stock_actual = cantidad` (la cantidad es el nuevo valor absoluto)

Los campos `stock_anterior`, `stock_resultante` y `creado_por` se rellenan automáticamente, sin intervención del usuario.

El `before_delete` bloquea el borrado de movimientos devolviendo un error — son registros contables permanentes.

### Cómo ejecutarlo

```bash
# Desde la raíz del proyecto
cd examples/almacen

# Instalar Quiver (modo desarrollo desde el repo local)
pip install -e ../../backend

# Si usas pyenv, actualiza los shims para que el comando quiver quede disponible
pyenv rehash

# Copiar y ajustar el .env (SQLite por defecto, no requiere configuración adicional)
cp .env.example .env

# Crear las tablas de Quiver
quiver db migrate

# Crear el superuser
quiver create-superuser

# (Opcional) Cargar datos de prueba
python seed.py

# Arrancar el backend
uvicorn main:app --reload

# En otra terminal: arrancar el frontend
cd ../../frontend && npm run dev
```

Abre `http://localhost:5173/auth/login` e inicia sesión con el superuser.

### Roles sugeridos para probar permisos

| Rol | Permisos asignados |
|---|---|
| `almacenero` | `materiales.list/show`, `almacen.list/create`, `almacen.ver_alertas`, `almacen.ajustar_stock` |
| `jefe_almacen` | Todo lo anterior + `materiales.create/update/delete`, `categorias.*`, `proveedores.*`, `almacen.ver_valoracion` |
| `solo_consulta` | `materiales.list/show`, `almacen.list` |

Créalos desde la UI: **Admin → Roles → Nuevo rol**.

---

← [Frontend](09-frontend.md)
