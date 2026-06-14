from datetime import datetime

from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField
from quiver.crud.fields.misc import NumberField
from quiver.crud.fields.select import SelectField
from quiver.crud.filters import SelectFilter, DateRangeFilter
from quiver.exceptions import QuiverBadRequest, QuiverNotFound

from models import Material, MovimientoStock, TipoMovimiento


_TIPO_LABELS = {
    "entrada": "Inbound",
    "salida":  "Outbound",
    "ajuste":  "Adjustment",
}

_TIPOS = [{"value": t.value, "label": _TIPO_LABELS[t.value]} for t in TipoMovimiento]

_TIPO_BADGE = {
    "entrada": ("Inbound",    "success"),
    "salida":  ("Outbound",   "danger"),
    "ajuste":  ("Adjustment", "warning"),
}


class MovimientoCRUD(QuiverCRUD):
    model = MovimientoStock
    route = "movimientos"
    title = "Stock movements"
    permissions = "almacen"                  # groups under the "almacen.list", "almacen.create"... permissions
    page_size = 25
    order_by = "-created_at"
    bulk_actions = []                        # movements are not bulk-deleted — accounting record

    columns = [
        Column("created_at",       label="Date",            col_type="datetime", sortable=True),
        Column("material_id",      label="Material",        col_type="related", choices_from="materiales", choices_label="nombre"),
        Column("tipo",             label="Type",            col_type="badge",    badge_map=_TIPO_BADGE),
        Column("cantidad",         label="Quantity",        col_type="number"),
        Column("stock_anterior",   label="Previous stock",  col_type="number"),
        Column("stock_resultante", label="Resulting stock", col_type="number"),
        Column("motivo",           label="Reason"),
        Column("referencia_doc",   label="Document"),
        Column("creado_por",       label="User"),
    ]

    fields = [
        SelectField("material_id",    label="Material",   choices_from="materiales", choices_label="nombre", required=True),
        SelectField("tipo",           label="Type",       choices=_TIPOS,            required=True),
        NumberField("cantidad",       label="Quantity",   required=True,
                    help_text="Always enter a positive value"),
        TextField("motivo",           label="Reason"),
        TextField("referencia_doc",   label="Document no. (delivery note, order…)"),
    ]

    filters = [
        SelectFilter("tipo", label="Type", choices=_TIPOS),
        DateRangeFilter("created_at", label="Date"),
    ]

    async def before_create(self, data: dict, db, user: dict) -> dict:
        """
        Computes stock_anterior and stock_resultante, updates Material.stock_actual
        and records who made the movement.
        """
        from sqlmodel import select

        material_id = data.get("material_id")
        if not material_id:
            raise QuiverBadRequest("You must select a material.")

        material = db.exec(select(Material).where(Material.id == material_id)).first()
        if not material:
            raise QuiverNotFound("Material not found.")

        cantidad = float(data.get("cantidad", 0))
        if cantidad <= 0:
            raise QuiverBadRequest("Quantity must be greater than zero.")

        tipo = data.get("tipo")
        stock_anterior = material.stock_actual

        if tipo == TipoMovimiento.entrada.value:
            nuevo_stock = stock_anterior + cantidad
        elif tipo == TipoMovimiento.salida.value:
            if cantidad > stock_anterior:
                raise QuiverBadRequest(
                    f"Insufficient stock. Available: {stock_anterior} {material.unidad}."
                )
            nuevo_stock = stock_anterior - cantidad
        elif tipo == TipoMovimiento.ajuste.value:
            # In an adjustment, 'cantidad' is the new absolute stock
            nuevo_stock = cantidad
            cantidad = abs(nuevo_stock - stock_anterior)
            data["cantidad"] = cantidad
        else:
            raise QuiverBadRequest(f"Unknown movement type: {tipo}")

        # Update the material
        material.stock_actual = nuevo_stock
        material.updated_at = datetime.utcnow()
        db.add(material)
        db.flush()

        # Fill in the computed fields
        data["stock_anterior"] = stock_anterior
        data["stock_resultante"] = nuevo_stock
        data["creado_por"] = user.get("email", "system")
        data["created_at"] = datetime.utcnow()

        return data

    async def before_delete(self, instance, db, user: dict) -> None:
        raise QuiverBadRequest(
            "Stock movements cannot be deleted. They are permanent accounting records."
        )
