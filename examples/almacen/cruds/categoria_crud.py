from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, TextareaField
from quiver.crud.filters import TextFilter

from models import Categoria


class CategoriaCRUD(QuiverCRUD):
    model = Categoria
    route = "categorias"
    title = "Categories"
    order_by = "nombre"
    search_fields = ["nombre"]

    columns = [
        Column("nombre",      label="Name",        sortable=True),
        Column("descripcion", label="Description"),
        Column("created_at",  label="Created",     col_type="datetime"),
    ]

    fields = [
        TextField("nombre",         label="Name",        required=True),
        TextareaField("descripcion", label="Description"),
    ]

    filters = [
        TextFilter("nombre", label="Name"),
    ]
