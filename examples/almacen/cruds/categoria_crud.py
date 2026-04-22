from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, TextareaField
from quiver.crud.filters import TextFilter

from models import Categoria


class CategoriaCRUD(QuiverCRUD):
    model = Categoria
    route = "categorias"
    title = "Categorías"
    order_by = "nombre"
    search_fields = ["nombre"]

    columns = [
        Column("nombre",      label="Nombre",      sortable=True),
        Column("descripcion", label="Descripción"),
        Column("created_at",  label="Creada",      col_type="datetime"),
    ]

    fields = [
        TextField("nombre",         label="Nombre",       required=True),
        TextareaField("descripcion", label="Descripción"),
    ]

    filters = [
        TextFilter("nombre", label="Nombre"),
    ]
