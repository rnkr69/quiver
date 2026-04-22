from quiver.pages.registry import QuiverPage, quiver_page


@quiver_page(
    route="/admin/almacen/alertas",
    layout="admin",
    title="Alertas de stock",
    component="AlertasStockPage",       # componente React a registrar en PageRegistry
    permission="almacen.ver_alertas",
)
class AlertasStockPage(QuiverPage):
    """
    Página custom que muestra los materiales con stock por debajo del mínimo.

    El componente React correspondiente debería llamar a:
      GET /quiver/v1/materiales/?activo=true
    y filtrar localmente los que tengan stock_actual < stock_minimo,
    o bien añadir un endpoint propio a tu app FastAPI.
    """
    pass
