from quiver.pages.registry import QuiverPage, quiver_page


@quiver_page(
    route="/admin/almacen/alertas",
    layout="admin",
    title="Low stock alerts",
    component="AlertasStockPage",       # React component to register in PageRegistry
    permission="almacen.ver_alertas",
)
class AlertasStockPage(QuiverPage):
    """
    Custom page that shows materials with stock below the minimum.

    The corresponding React component should call:
      GET /quiver/v1/materiales/?activo=true
    and locally filter those with stock_actual < stock_minimo,
    or add a dedicated endpoint to your FastAPI app.
    """
    pass
