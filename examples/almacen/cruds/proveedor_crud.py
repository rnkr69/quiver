from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, EmailField
from quiver.crud.fields.misc import CheckboxField
from quiver.crud.filters import TextFilter, BooleanFilter

from models import Proveedor


class ProveedorCRUD(QuiverCRUD):
    model = Proveedor
    route = "proveedores"
    title = "Proveedores"
    order_by = "nombre"
    search_fields = ["nombre", "contacto", "email"]

    columns = [
        Column("nombre",   label="Nombre",    sortable=True),
        Column("contacto", label="Contacto"),
        Column("email",    label="Email"),
        Column("telefono", label="Teléfono"),
        Column("activo",   label="Estado",    col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
    ]

    fields = [
        TextField("nombre",    label="Nombre",    required=True),
        TextField("contacto",  label="Persona de contacto"),
        EmailField("email",    label="Email"),
        TextField("telefono",  label="Teléfono"),
        CheckboxField("activo", label="Activo",   default=True),
    ]

    filters = [
        TextFilter("nombre",   label="Nombre"),
        BooleanFilter("activo", label="Estado"),
    ]
