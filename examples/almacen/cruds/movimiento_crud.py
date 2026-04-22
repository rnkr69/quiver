from datetime import datetime

from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField
from quiver.crud.fields.misc import NumberField
from quiver.crud.fields.select import SelectField
from quiver.crud.filters import SelectFilter, DateRangeFilter
from quiver.exceptions import QuiverBadRequest, QuiverNotFound

from models import Material, MovimientoStock, TipoMovimiento


_TIPOS = [{"value": t.value, "label": t.value.capitalize()} for t in TipoMovimiento]

_TIPO_BADGE = {
    "entrada": ("Entrada", "success"),
    "salida":  ("Salida",  "danger"),
    "ajuste":  ("Ajuste",  "warning"),
}


class MovimientoCRUD(QuiverCRUD):
    model = MovimientoStock
    route = "movimientos"
    title = "Movimientos de stock"
    permissions = "almacen"                  # agrupa bajo el permiso "almacen.list", "almacen.create"...
    page_size = 25
    order_by = "-created_at"
    bulk_actions = []                        # no se borran movimientos en bulk — registro contable

    columns = [
        Column("created_at",       label="Fecha",            col_type="datetime", sortable=True),
        Column("material_id",      label="Material",         col_type="related", choices_from="materiales", choices_label="nombre"),
        Column("tipo",             label="Tipo",             col_type="badge",    badge_map=_TIPO_BADGE),
        Column("cantidad",         label="Cantidad",         col_type="number"),
        Column("stock_anterior",   label="Stock anterior",   col_type="number"),
        Column("stock_resultante", label="Stock resultante", col_type="number"),
        Column("motivo",           label="Motivo"),
        Column("referencia_doc",   label="Documento"),
        Column("creado_por",       label="Usuario"),
    ]

    fields = [
        SelectField("material_id",    label="Material",   choices_from="materiales", choices_label="nombre", required=True),
        SelectField("tipo",           label="Tipo",       choices=_TIPOS,            required=True),
        NumberField("cantidad",       label="Cantidad",   required=True,
                    help_text="Introduce siempre un valor positivo"),
        TextField("motivo",           label="Motivo"),
        TextField("referencia_doc",   label="Nº documento (albarán, pedido…)"),
    ]

    filters = [
        SelectFilter("tipo", label="Tipo", choices=_TIPOS),
        DateRangeFilter("created_at", label="Fecha"),
    ]

    async def before_create(self, data: dict, db, user: dict) -> dict:
        """
        Calcula stock_anterior y stock_resultante, actualiza Material.stock_actual
        y registra quién hizo el movimiento.
        """
        from sqlmodel import select

        material_id = data.get("material_id")
        if not material_id:
            raise QuiverBadRequest("Debes seleccionar un material.")

        material = db.exec(select(Material).where(Material.id == material_id)).first()
        if not material:
            raise QuiverNotFound("Material no encontrado.")

        cantidad = float(data.get("cantidad", 0))
        if cantidad <= 0:
            raise QuiverBadRequest("La cantidad debe ser mayor que cero.")

        tipo = data.get("tipo")
        stock_anterior = material.stock_actual

        if tipo == TipoMovimiento.entrada.value:
            nuevo_stock = stock_anterior + cantidad
        elif tipo == TipoMovimiento.salida.value:
            if cantidad > stock_anterior:
                raise QuiverBadRequest(
                    f"Stock insuficiente. Disponible: {stock_anterior} {material.unidad}."
                )
            nuevo_stock = stock_anterior - cantidad
        elif tipo == TipoMovimiento.ajuste.value:
            # En un ajuste, 'cantidad' es el nuevo stock absoluto
            nuevo_stock = cantidad
            cantidad = abs(nuevo_stock - stock_anterior)
            data["cantidad"] = cantidad
        else:
            raise QuiverBadRequest(f"Tipo de movimiento desconocido: {tipo}")

        # Actualizar el material
        material.stock_actual = nuevo_stock
        material.updated_at = datetime.utcnow()
        db.add(material)
        db.flush()

        # Rellenar campos calculados
        data["stock_anterior"] = stock_anterior
        data["stock_resultante"] = nuevo_stock
        data["creado_por"] = user.get("email", "sistema")
        data["created_at"] = datetime.utcnow()

        return data

    async def before_delete(self, instance, db, user: dict) -> None:
        raise QuiverBadRequest(
            "Los movimientos de stock no pueden eliminarse. Son registros contables permanentes."
        )
