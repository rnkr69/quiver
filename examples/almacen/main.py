from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from sqlmodel import SQLModel

from quiver import QuiverApp
from quiver.menu.schemas import MenuGroup, MenuItem

# Registrar permisos custom antes de crear QuiverApp
import permissions  # noqa: F401

# Importar páginas custom para activar los decoradores @quiver_page
import pages.alertas_stock  # noqa: F401

# CRUDs
from cruds.categoria_crud import CategoriaCRUD
from cruds.proveedor_crud import ProveedorCRUD
from cruds.material_crud import MaterialCRUD
from cruds.movimiento_crud import MovimientoCRUD

# Widgets del dashboard
import widgets.almacen_stats as stats

# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Almacén — demo Quiver")


@app.on_event("startup")
def crear_tablas():
    """Crea las tablas del ejemplo al arrancar (solo en desarrollo con SQLite)."""
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

# Menú lateral
quiver.set_menu([
    MenuItem("Dashboard",  route="/admin",       icon="speedometer2"),
    MenuGroup("Almacén", items=[
        MenuItem("Materiales",    route="/admin/materiales",         permission="materiales.list",       icon="box-seam"),
        MenuItem("Movimientos",   route="/admin/movimientos",        permission="almacen.list",          icon="arrow-left-right"),
        MenuItem("Alertas stock", route="/admin/almacen/alertas",   permission="almacen.ver_alertas",   icon="exclamation-triangle"),
    ]),
    MenuGroup("Maestros", items=[
        MenuItem("Categorías",  route="/admin/categorias",  permission="categorias.list",  icon="tag"),
        MenuItem("Proveedores", route="/admin/proveedores", permission="proveedores.list", icon="truck"),
    ]),
    MenuItem("Usuarios", route="/admin/users", permission="users.list", icon="people"),
    MenuItem("Roles",    route="/admin/roles",  permission="roles.list", icon="shield-lock"),
])

# Servir el SPA bundleado en /quiver (debe ir al final, tras registrar los CRUDs).
# Si no hay build del frontend, esto no hace nada (puedes servir el SPA aparte con
# `npm run dev`). Ver docs/01-installation.md.
quiver.serve_frontend()
