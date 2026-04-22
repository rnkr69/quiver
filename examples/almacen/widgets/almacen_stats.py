from quiver.dashboard.widgets.stat_card import StatCardWidget
from quiver.dashboard.widgets.chart import ChartWidget
from sqlmodel import Session, func, select

from models import Material, MovimientoStock, TipoMovimiento


# ── StatCards ────────────────────────────────────────────────────────────────

total_materiales = StatCardWidget(
    "Materiales registrados",
    model=Material,
    filter_fn=lambda q: q.where(Material.activo == True),
    icon="box-seam",
)

materiales_stock_bajo = StatCardWidget(
    "Stock bajo (alerta)",
    model=Material,
    filter_fn=lambda q: q.where(
        Material.activo == True,
        Material.stock_actual < Material.stock_minimo,
        Material.stock_minimo > 0,
    ),
    permission="almacen.ver_alertas",
    icon="exclamation-triangle",
)

entradas_mes = StatCardWidget(
    "Entradas este mes",
    model=MovimientoStock,
    filter_fn=lambda q: q.where(
        MovimientoStock.tipo == TipoMovimiento.entrada,
        func.strftime("%Y-%m", MovimientoStock.created_at) == func.strftime("%Y-%m", func.now()),
    ),
    permission="almacen.ajustar_stock",
    icon="arrow-down-circle",
)

salidas_mes = StatCardWidget(
    "Salidas este mes",
    model=MovimientoStock,
    filter_fn=lambda q: q.where(
        MovimientoStock.tipo == TipoMovimiento.salida,
        func.strftime("%Y-%m", MovimientoStock.created_at) == func.strftime("%Y-%m", func.now()),
    ),
    permission="almacen.ajustar_stock",
    icon="arrow-up-circle",
)


# ── ChartWidget ───────────────────────────────────────────────────────────────

def movimientos_ultimos_30_dias(db: Session):
    """Entradas vs salidas por día en los últimos 30 días."""
    from datetime import datetime, timedelta
    desde = datetime.utcnow() - timedelta(days=29)

    rows = db.exec(
        select(
            func.strftime("%Y-%m-%d", MovimientoStock.created_at).label("dia"),
            MovimientoStock.tipo,
            func.count().label("total"),
        )
        .where(MovimientoStock.created_at >= desde)
        .where(MovimientoStock.tipo != TipoMovimiento.ajuste)
        .group_by("dia", MovimientoStock.tipo)
        .order_by("dia")
    ).all()

    # Agrupar por día sumando entradas y salidas
    por_dia: dict[str, dict] = {}
    for row in rows:
        if row.dia not in por_dia:
            por_dia[row.dia] = {"entrada": 0, "salida": 0}
        por_dia[row.dia][row.tipo] += row.total

    return [
        {"label": dia, "value": vals["entrada"] - vals["salida"]}
        for dia, vals in sorted(por_dia.items())
    ]


movimientos_chart = ChartWidget(
    "Movimientos netos (últimos 30 días)",
    data_fn=movimientos_ultimos_30_dias,
    chart_type="bar",
    x_key="label",
    y_key="value",
    permission="almacen.ajustar_stock",
)
