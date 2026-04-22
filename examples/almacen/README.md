# Ejemplo — Gestión de materiales de almacén

Demo funcional de Quiver que implementa un sistema de gestión de materiales: catálogo, proveedores, movimientos de stock (entradas/salidas/ajustes) y alertas de stock bajo.

---

## Qué demuestra este ejemplo

| Característica | Dónde |
|---|---|
| 4 CRUDs interconectados | `cruds/` |
| Hooks `before_create` con lógica de negocio | `cruds/movimiento_crud.py` |
| Validación de negocio (stock insuficiente) | `cruds/movimiento_crud.py` |
| `SelectField` con opciones dinámicas (`choices_from`) | `cruds/material_crud.py` |
| `SelectField` con enum como opciones | `cruds/movimiento_crud.py` |
| Columnas con `badge_map` y enum | `cruds/material_crud.py` |
| Permisos personalizados (`quiver_permission`) | `permissions.py` |
| 4 StatCards + 1 ChartWidget en el dashboard | `widgets/almacen_stats.py` |
| Página custom con `@quiver_page` | `pages/alertas_stock.py` |
| Menú con grupos y control de permisos | `main.py` |
| Datos de prueba (seed) | `seed.py` |

---

## Estructura

```
almacen/
├── main.py                  # FastAPI + QuiverApp — punto de entrada
├── models.py                # Categoria, Proveedor, Material, MovimientoStock
├── permissions.py           # Permisos custom del módulo almacén
├── seed.py                  # Script para poblar la BD con datos de prueba
├── .env.example             # Variables de entorno necesarias
├── cruds/
│   ├── categoria_crud.py    # CRUD simple
│   ├── proveedor_crud.py    # CRUD con búsqueda y filtros
│   ├── material_crud.py     # CRUD completo: SelectField dinámico, enum, before_update
│   └── movimiento_crud.py   # CRUD con lógica de negocio en before_create y before_delete
├── widgets/
│   └── almacen_stats.py     # 4 StatCards + 1 ChartWidget
└── pages/
    └── alertas_stock.py     # Página custom (requiere componente React)
```

---

## Cómo ejecutarlo

### 1. Crear el entorno virtual

```bash
cd examples/almacen
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

A partir de aquí todos los comandos usan el entorno activado.

### 2. Instalar Quiver

Desde el repo local (modo desarrollo):

```bash
pip install -e ../../backend
```

O desde el repositorio remoto:

```bash
pip install git+https://github.com/tu-organizacion/quiver.git@v0.1.0
```

Verifica que el CLI está disponible:

```bash
quiver --help
```

### 3. Configurar el entorno

El directorio ya incluye un `.env` listo para desarrollo con SQLite (`almacen.db`) — no necesitas configurar nada más para probarlo.

Si prefieres partir del fichero de ejemplo:

```bash
cp .env.example .env
```

### 4. Crear las tablas de Quiver

```bash
quiver db migrate
```

> Las tablas de los modelos del ejemplo (`Material`, `Categoria`, etc.) se crean automáticamente al arrancar la app en modo desarrollo (ver `main.py`).

### 5. Crear el superuser

```bash
quiver create-superuser
```

### 6. Arrancar el backend

```bash
uvicorn main:app --reload
```

### 7. Arrancar el frontend (en otra terminal)

```bash
cd /ruta/a/quiver/frontend
npm install
npm run dev
```

### 8. (Opcional) Cargar datos de prueba

```bash
python seed.py
```

Carga 4 categorías, 3 proveedores, 15 materiales y ~40 movimientos históricos.

### 9. Abrir el panel

```
http://localhost:5173/auth/login
```

---

## Lógica de negocio destacada

### Movimientos de stock (`movimiento_crud.py`)

El hook `before_create` de `MovimientoCRUD`:

1. Valida que el material exista
2. Valida que la cantidad sea positiva
3. Según el tipo de movimiento:
   - **Entrada** → `stock_actual += cantidad`
   - **Salida** → `stock_actual -= cantidad` (lanza error si no hay stock suficiente)
   - **Ajuste** → `stock_actual = cantidad` (la cantidad es el nuevo valor absoluto)
4. Actualiza `Material.stock_actual` en la misma transacción
5. Rellena `stock_anterior`, `stock_resultante` y `creado_por` automáticamente

El hook `before_delete` bloquea el borrado de movimientos (son registros contables permanentes).

### Alertas de stock

`MaterialCRUD` expone la lista con `stock_actual` y `stock_minimo`. El widget `materiales_stock_bajo` cuenta los materiales donde `stock_actual < stock_minimo`. La página custom `AlertasStockPage` puede mostrarlos en detalle.

---

## Roles sugeridos para la demo

| Rol | Permisos |
|---|---|
| `almacenero` | `materiales.list`, `materiales.show`, `almacen.list`, `almacen.create`, `almacen.ver_alertas`, `almacen.ajustar_stock` |
| `jefe_almacen` | Todo lo anterior + `materiales.create`, `materiales.update`, `materiales.delete`, `categorias.*`, `proveedores.*`, `almacen.ver_valoracion` |
| `solo_consulta` | `materiales.list`, `materiales.show`, `almacen.list` |

Créalos desde la UI: **Admin → Roles → Nuevo rol**.
