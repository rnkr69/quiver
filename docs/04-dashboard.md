# Dashboard

> 🇪🇸 [Versión en español](es/04-dashboard.md)

The admin dashboard shows configurable widgets with data from your database. Quiver ships with two widget types: `StatCardWidget` (counter) and `ChartWidget` (chart).

---

## StatCardWidget

Shows the record count for a model, with an optional filter.

```python
from quiver.dashboard.widgets.stat_card import StatCardWidget
from models import Product, Order

# Simple counter: total products
total_products = StatCardWidget(
    "Total products",
    model=Product,
)

# With filter: only active products
active_products = StatCardWidget(
    "Active products",
    model=Product,
    filter_fn=lambda q: q.where(Product.is_active == True),
)

# With permission: only visible to users who have that permission
pending_orders = StatCardWidget(
    "Pending orders",
    model=Order,
    filter_fn=lambda q: q.where(Order.status == "pending"),
    permission="orders.list",
)
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `title` | `str` | Label shown on the card |
| `model` | `type` | SQLModel class whose records are counted |
| `filter_fn` | `callable` | Function `lambda q: q.where(...)` to filter |
| `permission` | `str` | If set, the widget only appears if the user has that permission |

---

## ChartWidget

Shows a bar or line chart with data that you provide.

```python
from quiver.dashboard.widgets.chart import ChartWidget
from sqlmodel import Session, func, select
from models import Order

def orders_by_month(db: Session):
    """Return the data for the chart."""
    rows = db.exec(
        select(
            func.strftime("%Y-%m", Order.created_at).label("month"),
            func.count().label("total"),
        ).group_by("month").order_by("month").limit(6)
    ).all()
    return [{"label": r.month, "value": r.total} for r in rows]


orders_chart = ChartWidget(
    "Orders per month",
    data_fn=orders_by_month,
    chart_type="bar",          # "bar" or "line"
    permission="orders.list",
)
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `title` | `str` | Chart title |
| `data_fn` | `callable` | Function `(db: Session) -> list[dict]` that returns the data |
| `chart_type` | `str` | `"bar"` or `"line"`. Defaults to `"bar"`. |
| `permission` | `str` | Permission required to see the widget |

### Expected data format

`data_fn` must return a list of dictionaries with `label` and `value` keys:

```python
[
    {"label": "2024-01", "value": 12},
    {"label": "2024-02", "value": 18},
    {"label": "2024-03", "value": 25},
]
```

---

## Custom widget

You can create your own widget type by subclassing `QuiverWidget`:

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

The `component` determines which React component is used to render it. For custom components, see the [custom pages](07-custom-pages.md) section.

---

## Registering widgets

Register the widgets in `main.py` before the app starts:

```python
from quiver import QuiverApp
import widgets.product_stats as stats

quiver = QuiverApp(app)
quiver.register_widget(stats.total_products)
quiver.register_widget(stats.active_products)
quiver.register_widget(stats.orders_chart)
```

The order of `register_widget` calls determines the order in which widgets appear on the dashboard.

---

## Complete example

```python
# widgets/stats.py
from quiver.dashboard.widgets.stat_card import StatCardWidget
from quiver.dashboard.widgets.chart import ChartWidget
from sqlmodel import Session, func, select
from models import Product, Order


total_products = StatCardWidget("Total products", model=Product)

active_products = StatCardWidget(
    "Active products",
    model=Product,
    filter_fn=lambda q: q.where(Product.is_active == True),
)

pending_orders = StatCardWidget(
    "Pending orders",
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
    "Orders per month",
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

← [CRUD Engine](03-crud.md) | [Roles and permissions →](05-rbac.md)
