from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, EmailField
from quiver.crud.fields.misc import CheckboxField
from quiver.crud.filters import TextFilter, BooleanFilter

from models import Proveedor


class ProveedorCRUD(QuiverCRUD):
    model = Proveedor
    route = "proveedores"
    title = "Suppliers"
    order_by = "nombre"
    search_fields = ["nombre", "contacto", "email"]

    columns = [
        Column("nombre",   label="Name",      sortable=True),
        Column("contacto", label="Contact"),
        Column("email",    label="Email"),
        Column("telefono", label="Phone"),
        Column("activo",   label="Status",    col_type="badge",
               badge_map={True: ("Active", "active"), False: ("Inactive", "inactive")}),
    ]

    fields = [
        TextField("nombre",    label="Name",            required=True),
        TextField("contacto",  label="Contact person"),
        EmailField("email",    label="Email"),
        TextField("telefono",  label="Phone"),
        CheckboxField("activo", label="Active",          default=True),
    ]

    filters = [
        TextFilter("nombre",   label="Name"),
        BooleanFilter("activo", label="Status"),
    ]
