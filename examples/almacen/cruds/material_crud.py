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
    title = "Materials"
    page_size = 30
    order_by = "nombre"
    search_fields = ["referencia", "nombre"]

    columns = [
        Column("referencia",     label="Reference",     sortable=True),
        Column("nombre",         label="Name",          sortable=True),
        Column("unidad",         label="Unit",          col_type="badge",
               badge_map={u.value: (u.value, "inactive") for u in UnidadMedida}),
        Column("stock_actual",   label="Current stock", col_type="number",  sortable=True),
        Column("stock_minimo",   label="Minimum stock", col_type="number"),
        Column("precio_unitario", label="Unit price",    col_type="currency"),
        Column("activo",         label="Status",        col_type="badge",
               badge_map={True: ("Active", "active"), False: ("Inactive", "inactive")}),
    ]

    fields = [
        TextField("referencia",      label="Reference / SKU",    required=True),
        TextField("nombre",          label="Name",               required=True),
        TextareaField("descripcion", label="Description"),
        SelectField("categoria_id",  label="Category",           choices_from="categorias",  choices_label="nombre"),
        SelectField("proveedor_id",  label="Supplier",           choices_from="proveedores", choices_label="nombre"),
        SelectField("unidad",        label="Unit of measure",    choices=_UNIDADES, required=True),
        NumberField("stock_actual",  label="Initial stock",      default=0),
        NumberField("stock_minimo",  label="Minimum stock",      default=0,
                    help_text="An alert will be generated if stock drops below this value"),
        NumberField("precio_unitario", label="Unit price (€)"),
        CheckboxField("activo",      label="Active",             default=True),
    ]

    filters = [
        TextFilter("referencia",    label="Reference"),
        TextFilter("nombre",        label="Name"),
        SelectFilter("categoria_id", label="Category", choices=[]),  # could be populated dynamically
        SelectFilter("unidad",      label="Unit",
                     choices=_UNIDADES),
        BooleanFilter("activo",     label="Status"),
    ]

    async def before_create(self, data: dict, db, user: dict) -> dict:
        data["updated_at"] = __import__("datetime").datetime.utcnow()
        return data

    async def before_update(self, data: dict, db, user: dict) -> dict:
        data["updated_at"] = __import__("datetime").datetime.utcnow()
        return data
