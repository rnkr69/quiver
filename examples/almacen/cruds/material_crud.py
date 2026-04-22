from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, TextareaField
from quiver.crud.fields.misc import NumberField, CheckboxField
from quiver.crud.fields.select import SelectField
from quiver.crud.filters import TextFilter, BooleanFilter, SelectFilter

from models import Material, UnidadMedida


_UNIDADES = [{"value": u.value, "label": u.value} for u in UnidadMedida]


class MaterialCRUD(QuiverCRUD):
    model = Material
    route = "materiales"
    title = "Materiales"
    page_size = 30
    order_by = "nombre"
    search_fields = ["referencia", "nombre"]

    columns = [
        Column("referencia",     label="Referencia",   sortable=True),
        Column("nombre",         label="Nombre",       sortable=True),
        Column("unidad",         label="Unidad",       col_type="badge",
               badge_map={u.value: (u.value, "inactive") for u in UnidadMedida}),
        Column("stock_actual",   label="Stock actual", col_type="number",  sortable=True),
        Column("stock_minimo",   label="Stock mínimo", col_type="number"),
        Column("precio_unitario", label="Precio unit.", col_type="currency"),
        Column("activo",         label="Estado",       col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
    ]

    fields = [
        TextField("referencia",      label="Referencia / SKU",   required=True),
        TextField("nombre",          label="Nombre",             required=True),
        TextareaField("descripcion", label="Descripción"),
        SelectField("categoria_id",  label="Categoría",          choices_from="categorias",  choices_label="nombre"),
        SelectField("proveedor_id",  label="Proveedor",          choices_from="proveedores", choices_label="nombre"),
        SelectField("unidad",        label="Unidad de medida",   choices=_UNIDADES, required=True),
        NumberField("stock_actual",  label="Stock inicial",      default=0),
        NumberField("stock_minimo",  label="Stock mínimo",       default=0,
                    help_text="Se generará una alerta si el stock baja de este valor"),
        NumberField("precio_unitario", label="Precio unitario (€)"),
        CheckboxField("activo",      label="Activo",             default=True),
    ]

    filters = [
        TextFilter("referencia",    label="Referencia"),
        TextFilter("nombre",        label="Nombre"),
        SelectFilter("categoria_id", label="Categoría", choices=[]),  # se podría poblar dinámicamente
        SelectFilter("unidad",      label="Unidad",
                     choices=_UNIDADES),
        BooleanFilter("activo",     label="Estado"),
    ]

    async def before_create(self, data: dict, db, user: dict) -> dict:
        data["updated_at"] = __import__("datetime").datetime.utcnow()
        return data

    async def before_update(self, data: dict, db, user: dict) -> dict:
        data["updated_at"] = __import__("datetime").datetime.utcnow()
        return data
