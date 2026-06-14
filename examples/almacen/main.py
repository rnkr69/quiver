from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from sqlmodel import SQLModel

from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

# Register custom permissions before creating QuiverApp
import permissions  # noqa: F401

# Import custom pages to trigger the @quiver_page decorators
import pages.alertas_stock  # noqa: F401

# CRUDs
from cruds.categoria_crud import CategoriaCRUD
from cruds.proveedor_crud import ProveedorCRUD
from cruds.material_crud import MaterialCRUD
from cruds.movimiento_crud import MovimientoCRUD

# Dashboard widgets
import widgets.almacen_stats as stats

# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Warehouse — Quiver demo")


@app.on_event("startup")
def crear_tablas():
    """Create the example tables on startup (development only, with SQLite)."""
    from quiver.database.session import _get_engine
    from models import Categoria, Proveedor, Material, MovimientoStock  # noqa: F401
    SQLModel.metadata.create_all(_get_engine())


# ── Quiver ────────────────────────────────────────────────────────────────────

quiver = QuiverApp(app)

# CRUDs
quiver.register(CategoriaCRUD)
quiver.register(ProveedorCRUD)
quiver.register(MaterialCRUD)
quiver.register(MovimientoCRUD)

# Dashboard widgets
quiver.register_widget(stats.total_materiales)
quiver.register_widget(stats.materiales_stock_bajo)
quiver.register_widget(stats.entradas_mes)
quiver.register_widget(stats.salidas_mes)
quiver.register_widget(stats.movimientos_chart)

# Sidebar menu
quiver.set_menu([
    MenuItem("Dashboard",  route="/admin",       icon="speedometer2"),
    MenuGroup("Warehouse", items=[
        MenuItem("Materials",         route="/admin/materiales",         permission="materiales.list",       icon="box-seam"),
        MenuItem("Stock movements",   route="/admin/movimientos",        permission="almacen.list",          icon="arrow-left-right"),
        MenuItem("Low stock alerts",  route="/admin/almacen/alertas",   permission="almacen.ver_alertas",   icon="exclamation-triangle"),
    ]),
    MenuGroup("Master data", items=[
        MenuItem("Categories", route="/admin/categorias",  permission="categorias.list",  icon="tag"),
        MenuItem("Suppliers",  route="/admin/proveedores", permission="proveedores.list", icon="truck"),
    ]),
    MenuItem("Users", route="/admin/users", permission="users.list", icon="people"),
    MenuItem("Roles", route="/admin/roles",  permission="roles.list", icon="shield-lock"),
])

# Serve the bundled SPA at /quiver (must come last, after registering the CRUDs).
# If there is no frontend build, this does nothing (you can serve the SPA separately
# with `npm run dev`). See docs/01-installation.md.
quiver.serve_frontend()
