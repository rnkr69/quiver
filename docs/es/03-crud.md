# CRUD Engine

> 🇬🇧 [English version](../03-crud.md)

El CRUD Engine genera automáticamente los endpoints REST y la UI para gestionar cualquier modelo SQLModel. Defines una clase con `model` y `route`, y Quiver hace el resto.

---

## Definición básica

```python
from quiver import QuiverCRUD
from models import Product

class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
```

Esto genera:

| Endpoint | Descripción |
|---|---|
| `GET /quiver/v1/products/` | Listar con paginación, búsqueda y filtros |
| `POST /quiver/v1/products/` | Crear |
| `GET /quiver/v1/products/{id}` | Ver detalle |
| `PATCH /quiver/v1/products/{id}` | Editar |
| `DELETE /quiver/v1/products/{id}` | Eliminar |
| `DELETE /quiver/v1/products/bulk` | Eliminar varios |
| `GET /quiver/v1/products/choices` | Opciones para SelectField de otro CRUD |
| `GET /quiver/v1/products/schema` | Metadata de columnas y campos (usada por el frontend) |

---

## Columnas (tabla del listado)

Las columnas controlan qué aparece en la tabla del listado. Si no las defines, Quiver las infiere del modelo.

```python
from quiver.crud.columns import Column

class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    columns = [
        Column("name",       label="Nombre",    col_type="text",     sortable=True),
        Column("price",      label="Precio",    col_type="currency"),
        Column("is_active",  label="Estado",    col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
        Column("created_at", label="Creado",    col_type="datetime"),
    ]
```

### Tipos de columna disponibles

| `col_type` | Renderizado |
|---|---|
| `text` | Texto plano |
| `number` | Número |
| `currency` | Número con símbolo de moneda |
| `boolean` | Sí / No |
| `date` | Fecha formateada |
| `datetime` | Fecha y hora formateadas |
| `badge` | Chip de color (requiere `badge_map`) |
| `link` | Enlace clicable |

### `badge_map`

Mapea valores del modelo a `(etiqueta, variante)`. Las variantes disponibles son: `active`, `inactive`, `success`, `danger`, `warning`, `admin`, `client`.

```python
Column("status", col_type="badge", badge_map={
    "published": ("Publicado", "success"),
    "draft":     ("Borrador",  "inactive"),
    "archived":  ("Archivado", "danger"),
})
```

### Excluir columnas (modo automático)

Si no quieres definir todas las columnas manualmente, usa `exclude_columns` para omitir algunas del autodetect:

```python
class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
    exclude_columns = ["internal_notes", "raw_data"]
```

---

## Campos (formulario de creación/edición)

Los campos controlan el formulario. Si no los defines, Quiver los infiere del modelo excluyendo `id`, `created_at` y `updated_at`.

```python
from quiver.crud.fields.text import TextField, EmailField, TextareaField, PasswordField
from quiver.crud.fields.misc import NumberField, CheckboxField
from quiver.crud.fields.select import SelectField, SelectMultipleField
from quiver.crud.fields.date import DateField, DateTimeField

class ProductCRUD(QuiverCRUD):
    fields = [
        TextField("name",         label="Nombre",      required=True),
        TextareaField("description", label="Descripción", rows=5),
        NumberField("price",      label="Precio",      required=True),
        CheckboxField("is_active", label="Activo",     default=True),
        SelectField("category_id", label="Categoría",  choices_from="categories"),
    ]
```

### Referencia de campos

| Clase | `field_type` | Notas |
|---|---|---|
| `TextField` | `text` | Texto de una línea |
| `EmailField` | `email` | Validación de formato email |
| `PasswordField` | `password` | Oculta el valor |
| `TextareaField` | `textarea` | Multilínea. `rows=4` por defecto |
| `NumberField` | `number` | Entero o decimal |
| `CheckboxField` | `checkbox` | Booleano |
| `DateField` | `date` | Selector de fecha |
| `DateTimeField` | `datetime` | Selector de fecha y hora |
| `SelectField` | `select` | Desplegable. `choices` o `choices_from` |
| `SelectMultipleField` | `select_multiple` | Selección múltiple |
| `HiddenField` | `hidden` | No visible, se envía tal cual |

### Parámetros comunes de campo

| Parámetro | Tipo | Descripción |
|---|---|---|
| `key` | `str` | Nombre del campo en el modelo |
| `label` | `str` | Etiqueta visible. Auto-derivada si se omite. |
| `required` | `bool` | Si el campo es obligatorio |
| `help_text` | `str` | Texto de ayuda bajo el campo |
| `read_only` | `bool` | Visible pero no editable |
| `default` | `Any` | Valor inicial del formulario |

### SelectField con opciones estáticas

```python
SelectField("status", label="Estado", choices=[
    {"value": "draft",     "label": "Borrador"},
    {"value": "published", "label": "Publicado"},
    {"value": "archived",  "label": "Archivado"},
])
```

### SelectField con opciones dinámicas (de otro CRUD)

```python
# Carga las opciones desde GET /quiver/v1/categories/choices
SelectField("category_id", label="Categoría", choices_from="categories")
```

El endpoint `/choices` devuelve `[{"value": id, "label": nombre}]` para cada registro.

---

## Filtros

Los filtros aparecen en el panel de búsqueda del listado.

```python
from quiver.crud.filters import TextFilter, SelectFilter, BooleanFilter, DateRangeFilter

class ProductCRUD(QuiverCRUD):
    filters = [
        TextFilter("name",      label="Nombre"),
        BooleanFilter("is_active", label="Estado"),
        SelectFilter("category_id", label="Categoría", choices=[
            {"value": 1, "label": "Ropa"},
            {"value": 2, "label": "Calzado"},
        ]),
        DateRangeFilter("created_at", label="Fecha de creación"),
    ]
```

### Tipos de filtro

| Clase | Funcionamiento |
|---|---|
| `TextFilter` | `ILIKE %valor%` en la columna |
| `SelectFilter` | Igualdad exacta (`=`) |
| `BooleanFilter` | Filtra por `true`/`false` |
| `DateRangeFilter` | Rango `from` → `to` en una columna de fecha |

---

## Búsqueda de texto libre

Define en qué columnas busca el campo de búsqueda global:

```python
class ProductCRUD(QuiverCRUD):
    search_fields = ["name", "description"]
```

---

## Paginación y ordenación

```python
class ProductCRUD(QuiverCRUD):
    page_size = 25          # filas por página (por defecto 25)
    order_by = "-created_at"  # prefijo - para descendente
```

---

## Hooks de ciclo de vida

Sobreescribe estos métodos en tu clase para añadir lógica de negocio:

```python
class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    async def before_create(self, data: dict, db, user: dict) -> dict:
        """Modificar datos antes de crear. Debe devolver data."""
        data["name"] = data["name"].strip()
        return data

    async def after_create(self, instance, db, user: dict) -> None:
        """Ejecutado tras crear exitosamente."""
        await notify_team(f"Nuevo producto: {instance.name}")

    async def before_update(self, data: dict, db, user: dict) -> dict:
        """Modificar datos antes de actualizar. Debe devolver data."""
        return data

    async def after_update(self, instance, db, user: dict) -> None:
        """Ejecutado tras actualizar exitosamente."""
        pass

    async def before_delete(self, instance, db, user: dict) -> None:
        """Ejecutado antes de eliminar. Lanza excepción para cancelar."""
        if instance.has_orders:
            from quiver.exceptions import QuiverBadRequest
            raise QuiverBadRequest("No se puede eliminar un producto con pedidos.")

    async def after_delete(self, instance_id, db, user: dict) -> None:
        """Ejecutado tras eliminar exitosamente."""
        pass
```

### Filtrar el queryset base

Para mostrar solo un subconjunto de registros (por ejemplo, solo los del usuario actual):

```python
async def get_queryset(self, db, user: dict):
    from sqlmodel import select
    return select(Product).where(Product.owner_id == user["id"])
```

---

## Permisos

Al registrar un CRUD con `quiver.register(ProductCRUD)`, Quiver registra automáticamente estos permisos:

| Permiso | Acción |
|---|---|
| `products.list` | Acceso al listado |
| `products.create` | Crear registros |
| `products.show` | Ver detalle |
| `products.update` | Editar registros |
| `products.delete` | Eliminar registros |

El grupo de permisos se deriva de `route` por defecto. Para cambiarlo:

```python
class ProductCRUD(QuiverCRUD):
    route = "products"
    permissions = "catalog_products"   # usa este nombre en vez de "products"
```

---

## Slugs reservados

Los siguientes valores no pueden usarse como `route` porque están reservados por Quiver:

`auth`, `users`, `roles`, `permissions`, `dashboard`, `portal`, `static`, `health`

---

## Ejemplo completo

```python
from quiver import QuiverCRUD
from quiver.crud.columns import Column
from quiver.crud.fields.text import TextField, TextareaField
from quiver.crud.fields.misc import NumberField, CheckboxField
from quiver.crud.fields.select import SelectField
from quiver.crud.filters import TextFilter, BooleanFilter, SelectFilter

from models import Product


class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"
    title = "Productos"
    page_size = 20
    order_by = "-created_at"
    search_fields = ["name"]

    columns = [
        Column("name",       label="Nombre",    sortable=True),
        Column("price",      label="Precio",    col_type="currency"),
        Column("is_active",  label="Estado",    col_type="badge",
               badge_map={True: ("Activo", "active"), False: ("Inactivo", "inactive")}),
        Column("created_at", label="Creado",    col_type="datetime"),
    ]

    fields = [
        TextField("name",             label="Nombre",       required=True),
        TextareaField("description",  label="Descripción"),
        NumberField("price",          label="Precio",       required=True),
        SelectField("category_id",    label="Categoría",    choices_from="categories"),
        CheckboxField("is_active",    label="Activo",       default=True),
    ]

    filters = [
        TextFilter("name"),
        BooleanFilter("is_active", label="Estado"),
    ]

    async def before_create(self, data, db, user):
        data["name"] = data["name"].strip()
        return data
```

---

← [Inicio rápido](02-inicio-rapido.md) | [Dashboard →](04-dashboard.md)
