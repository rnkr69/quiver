> 🇪🇸 [Versión en español](es/10-ejemplos.md)

# Examples

The `examples/` directory contains working, ready-to-run projects that demonstrate how to integrate Quiver into real applications.

---

## Warehouse material management

**Path:** `examples/almacen/`

A stock management system for a warehouse: material catalog, suppliers, in/out movement logging, and low-stock alerts.

### What it includes

| File | What it demonstrates |
|---|---|
| `models.py` | Four related SQLModel models with enums (`UnidadMedida`, `TipoMovimiento`) |
| `cruds/categoria_crud.py` | Basic CRUD with text search |
| `cruds/proveedor_crud.py` | CRUD with `EmailField`, text and boolean filters |
| `cruds/material_crud.py` | `SelectField` with `choices_from` (dynamic options from another CRUD), `SelectField` with enum, `before_update` hook |
| `cruds/movimiento_crud.py` | `before_create` hook with full business logic; `before_delete` that blocks deletion |
| `widgets/almacen_stats.py` | Four `StatCardWidget` (with and without `filter_fn`, with and without `permission`) and a `ChartWidget` |
| `pages/alertas_stock.py` | Custom page with `@quiver_page` and a custom `permission` |
| `permissions.py` | Three custom permissions registered with `quiver_permission` |
| `seed.py` | Script that loads 15 materials, 3 suppliers, and ~40 historical movements |

### Notable business logic

`MovimientoCRUD` updates `Material.stock_actual` automatically inside the `before_create` hook:

- **Entrada (in)** → `stock_actual += cantidad`
- **Salida (out)** → `stock_actual -= cantidad` (raises `QuiverBadRequest` if there isn't enough stock)
- **Ajuste (adjustment)** → `stock_actual = cantidad` (the quantity is the new absolute value)

The `stock_anterior`, `stock_resultante`, and `creado_por` fields are filled in automatically, without user intervention.

The `before_delete` hook blocks deletion of movements by returning an error — they are permanent accounting records.

### How to run it

```bash
# From the project root
cd examples/almacen

# Install Quiver (development mode from the local repo)
pip install -e ../../backend

# If you use pyenv, refresh the shims so the quiver command becomes available
pyenv rehash

# Copy and adjust the .env (SQLite by default, no extra configuration needed)
cp .env.example .env

# Create the Quiver tables
quiver db migrate

# Create the superuser
quiver create-superuser

# (Optional) Load sample data
python seed.py

# Start the backend
uvicorn main:app --reload

# In another terminal: start the frontend
cd ../../frontend && npm run dev
```

Open `http://localhost:5173/auth/login` and sign in with the superuser.

### Suggested roles for testing permissions

| Role | Assigned permissions |
|---|---|
| `almacenero` | `materiales.list/show`, `almacen.list/create`, `almacen.ver_alertas`, `almacen.ajustar_stock` |
| `jefe_almacen` | All of the above + `materiales.create/update/delete`, `categorias.*`, `proveedores.*`, `almacen.ver_valoracion` |
| `solo_consulta` | `materiales.list/show`, `almacen.list` |

Create them from the UI: **Admin → Roles → New role**.

---

← [Frontend](09-frontend.md)
