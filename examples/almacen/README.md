> 🇪🇸 [Versión en español](README.es.md)

# Example — Warehouse materials management

A working Quiver demo that implements a materials management system: catalog, suppliers, stock movements (entradas/salidas/ajustes) and low-stock alerts.

---

## What this example demonstrates

| Feature | Where |
|---|---|
| 4 interconnected CRUDs | `cruds/` |
| `before_create` hooks with business logic | `cruds/movimiento_crud.py` |
| Business validation (insufficient stock) | `cruds/movimiento_crud.py` |
| `SelectField` with dynamic options (`choices_from`) | `cruds/material_crud.py` |
| `SelectField` with an enum as options | `cruds/movimiento_crud.py` |
| Columns with `badge_map` and an enum | `cruds/material_crud.py` |
| Custom permissions (`quiver_permission`) | `permissions.py` |
| 4 StatCards + 1 ChartWidget on the dashboard | `widgets/almacen_stats.py` |
| Custom page with `@quiver_page` | `pages/alertas_stock.py` |
| Menu with groups and permission control | `main.py` |
| Test data (seed) | `seed.py` |

---

## Structure

```
almacen/
├── main.py                  # FastAPI + QuiverApp — entry point
├── models.py                # Categoria, Proveedor, Material, MovimientoStock
├── permissions.py           # Custom permissions for the warehouse module
├── seed.py                  # Script to populate the DB with test data
├── .env.example             # Required environment variables
├── cruds/
│   ├── categoria_crud.py    # Simple CRUD
│   ├── proveedor_crud.py    # CRUD with search and filters
│   ├── material_crud.py     # Full CRUD: dynamic SelectField, enum, before_update
│   └── movimiento_crud.py   # CRUD with business logic in before_create and before_delete
├── widgets/
│   └── almacen_stats.py     # 4 StatCards + 1 ChartWidget
└── pages/
    └── alertas_stock.py     # Custom page (requires a React component)
```

> Quiver is a library: the installable package ships **the API only**. The admin / portal UI (the SPA) is run separately from the repository's `frontend/` directory. The backend does not serve the UI automatically.

---

## How to run it

### 1. Create the virtual environment

```bash
cd examples/almacen
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

From here on, all commands use the activated environment.

### 2. Install Quiver

From PyPI (public install):

```bash
pip install fastapi-quiver
```

To develop against the code in this repo, use the local editable install:

```bash
pip install -e ../../backend
```

Check that the CLI is available:

```bash
quiver --help
```

### 3. Configure the environment

The directory already includes a `.env` ready for development with SQLite (`almacen.db`) — you don't need to configure anything else to try it out.

If you'd rather start from the example file:

```bash
cp .env.example .env
```

### 4. Create the Quiver tables

```bash
quiver db migrate
```

> The tables for the example's models (`Material`, `Categoria`, etc.) are created automatically when the app starts in development mode (see `main.py`).

### 5. Create the superuser

```bash
quiver create-superuser
```

### 6. Start the backend (the API)

```bash
uvicorn main:app --reload
```

The API is served under `QUIVER_PREFIX` (default `/quiver/v1`).

### 7. Start the frontend (in another terminal)

The admin/portal SPA lives in the repository's `frontend/` directory and is run separately:

```bash
cd /path/to/quiver/frontend
npm install
npm run dev
```

### 8. (Optional) Load test data

```bash
python seed.py
```

Loads 4 categories, 3 suppliers, 15 materials and ~40 historical movements.

### 9. Open the panel

```
http://localhost:5173/auth/login
```

---

## Notable business logic

### Stock movements (`movimiento_crud.py`)

The `before_create` hook of `MovimientoCRUD`:

1. Validates that the material exists
2. Validates that the quantity is positive
3. Depending on the movement type:
   - **Entrada** → `stock_actual += cantidad`
   - **Salida** → `stock_actual -= cantidad` (raises an error if there isn't enough stock)
   - **Ajuste** → `stock_actual = cantidad` (the quantity is the new absolute value)
4. Updates `Material.stock_actual` within the same transaction
5. Fills in `stock_anterior`, `stock_resultante` and `creado_por` automatically

The `before_delete` hook blocks the deletion of movements (they are permanent accounting records).

### Stock alerts

`MaterialCRUD` exposes the list with `stock_actual` and `stock_minimo`. The `materiales_stock_bajo` widget counts the materials where `stock_actual < stock_minimo`. The custom `AlertasStockPage` can show them in detail.

---

## Suggested roles for the demo

| Role | Permissions |
|---|---|
| `almacenero` | `materiales.list`, `materiales.show`, `almacen.list`, `almacen.create`, `almacen.ver_alertas`, `almacen.ajustar_stock` |
| `jefe_almacen` | All of the above + `materiales.create`, `materiales.update`, `materiales.delete`, `categorias.*`, `proveedores.*`, `almacen.ver_valoracion` |
| `solo_consulta` | `materiales.list`, `materiales.show`, `almacen.list` |

Create them from the UI: **Admin → Roles → New role**.

---

Repository: https://github.com/rnkr69/quiver
