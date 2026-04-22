# Dashboard

El dashboard del admin muestra widgets configurables con datos de tu base de datos. Quiver incluye dos tipos de widget: `StatCardWidget` (contador) y `ChartWidget` (gráfica).

---

## StatCardWidget

Muestra el recuento de registros de un modelo, con filtro opcional.

```python
from quiver.dashboard.widgets.stat_card import StatCardWidget
from models import Product, Order

# Contador simple: total de productos
total_products = StatCardWidget(
    "Total de productos",
    model=Product,
)

# Con filtro: solo productos activos
active_products = StatCardWidget(
    "Productos activos",
    model=Product,
    filter_fn=lambda q: q.where(Product.is_active == True),
)

# Con permiso: solo visible para usuarios con ese permiso
pending_orders = StatCardWidget(
    "Pedidos pendientes",
    model=Order,
    filter_fn=lambda q: q.where(Order.status == "pending"),
    permission="orders.list",
)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `title` | `str` | Etiqueta visible en la card |
| `model` | `type` | Clase SQLModel de la que contar registros |
| `filter_fn` | `callable` | Función `lambda q: q.where(...)` para filtrar |
| `permission` | `str` | Si se especifica, el widget solo aparece si el usuario tiene ese permiso |

---

## ChartWidget

Muestra una gráfica de barras o líneas con datos que provees tú.

```python
from quiver.dashboard.widgets.chart import ChartWidget
from sqlmodel import Session, func, select
from models import Order

def orders_by_month(db: Session):
    """Devuelve los datos para la gráfica."""
    rows = db.exec(
        select(
            func.strftime("%Y-%m", Order.created_at).label("month"),
            func.count().label("total"),
        ).group_by("month").order_by("month").limit(6)
    ).all()
    return [{"label": r.month, "value": r.total} for r in rows]


orders_chart = ChartWidget(
    "Pedidos por mes",
    data_fn=orders_by_month,
    chart_type="bar",          # "bar" o "line"
    permission="orders.list",
)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|---|---|---|
| `title` | `str` | Título de la gráfica |
| `data_fn` | `callable` | Función `(db: Session) -> list[dict]` que devuelve los datos |
| `chart_type` | `str` | `"bar"` o `"line"`. Por defecto `"bar"`. |
| `permission` | `str` | Permiso requerido para ver el widget |

### Formato de datos esperado

`data_fn` debe devolver una lista de diccionarios con claves `label` y `value`:

```python
[
    {"label": "2024-01", "value": 12},
    {"label": "2024-02", "value": 18},
    {"label": "2024-03", "value": 25},
]
```

---

## Widget personalizado

Puedes crear tu propio tipo de widget heredando de `QuiverWidget`:

```python
from quiver.dashboard.base import QuiverWidget


class RevenueWidget(QuiverWidget):
    def __init__(self, title: str, *, model, permission=None):
        super().__init__(title, component="StatCard", permission=permission)
        self.model = model

    async def fetch_data(self, db, user: dict) -> dict:
        from sqlmodel import select, func
        result = db.exec(select(func.sum(self.model.price))).one()
        return {"value": result or 0}
```

El `component` determina el componente React que se usa para renderizarlo. Para componentes personalizados, consulta la sección de [páginas custom](07-paginas-custom.md).

---

## Registrar widgets

Registra los widgets en `main.py` antes de que arranque la app:

```python
from quiver import QuiverApp
import widgets.product_stats as stats

quiver = QuiverApp(app)
quiver.register_widget(stats.total_products)
quiver.register_widget(stats.active_products)
quiver.register_widget(stats.orders_chart)
```

El orden de `register_widget` determina el orden de aparición en el dashboard.

---

## Ejemplo completo

```python
# widgets/stats.py
from quiver.dashboard.widgets.stat_card import StatCardWidget
from quiver.dashboard.widgets.chart import ChartWidget
from sqlmodel import Session, func, select
from models import Product, Order


total_products = StatCardWidget("Total productos", model=Product)

active_products = StatCardWidget(
    "Productos activos",
    model=Product,
    filter_fn=lambda q: q.where(Product.is_active == True),
)

pending_orders = StatCardWidget(
    "Pedidos pendientes",
    model=Order,
    filter_fn=lambda q: q.where(Order.status == "pending"),
    permission="orders.list",
)


def orders_last_6_months(db: Session):
    rows = db.exec(
        select(
            func.strftime("%Y-%m", Order.created_at).label("month"),
            func.count().label("total"),
        ).group_by("month").order_by("month").limit(6)
    ).all()
    return [{"label": r.month, "value": r.total} for r in rows]


orders_chart = ChartWidget(
    "Pedidos por mes",
    data_fn=orders_last_6_months,
    chart_type="bar",
    permission="orders.list",
)
```

```python
# main.py
import widgets.stats as stats

quiver = QuiverApp(app)
quiver.register_widget(stats.total_products)
quiver.register_widget(stats.active_products)
quiver.register_widget(stats.pending_orders)
quiver.register_widget(stats.orders_chart)
```

---

← [CRUD Engine](03-crud.md) | [Roles y permisos →](05-rbac.md)
