# Quiver — Instalación en proyectos FastAPI existentes

> Esta guía asume que ya tienes un proyecto FastAPI funcionando y quieres añadir Quiver para obtener un panel de administración y un portal de usuario. Tu proyecto **no tiene tabla de usuarios propia** — Quiver gestionará todos los usuarios del sistema.

---

## Requisitos previos

- Python 3.11+
- Node.js 18+ y npm
- Git con acceso al repositorio de Quiver
- Un proyecto FastAPI funcionando con SQLModel como ORM
- PostgreSQL (recomendado) o SQLite (solo para desarrollo)

---

## Paso 1 — Instalar el paquete Python desde Git

Quiver se instala directamente desde el repositorio privado de la organización. No se usa PyPI.

### Instalación básica (última versión de `main`)

```bash
pip install git+https://github.com/tu-organizacion/quiver.git
```

### Instalación de una versión específica (recomendado para producción)

Usa siempre un tag de versión en proyectos en producción para evitar cambios inesperados:

```bash
pip install git+https://github.com/tu-organizacion/quiver.git@v0.1.0
```

### Declarar la dependencia en `pyproject.toml`

Si tu proyecto usa `pyproject.toml` para gestionar dependencias:

```toml
[project]
dependencies = [
    "quiver-framework @ git+https://github.com/tu-organizacion/quiver.git@v0.1.0",
]
```

```bash
pip install -e .
```

O si usas `requirements.txt`:

```txt
git+https://github.com/tu-organizacion/quiver.git@v0.1.0
```

```bash
pip install -r requirements.txt
```

### Acceso al repositorio privado

Si el repositorio es privado, Git necesita credenciales para clonarlo. Las opciones más comunes en entornos de CI/CD y servidores son:

**Con token de acceso personal (recomendado para CI/CD):**

```bash
pip install git+https://TU_TOKEN@github.com/tu-organizacion/quiver.git@v0.1.0
```

O configurando el token en el entorno para no exponerlo en el comando:

```bash
# En tu .env o en las variables de entorno del servidor
GIT_TOKEN=ghp_tu_token_aqui

# En el comando de instalación
pip install git+https://${GIT_TOKEN}@github.com/tu-organizacion/quiver.git@v0.1.0
```

**Con SSH (recomendado para desarrollo local si tienes clave SSH configurada):**

```bash
pip install git+ssh://git@github.com/tu-organizacion/quiver.git@v0.1.0
```

> **Nota de seguridad:** nunca escribas el token directamente en `pyproject.toml` ni en `requirements.txt` si esos ficheros están en el repositorio. Usa variables de entorno o el gestor de secretos de tu organización.

---

## Paso 2 — Añadir las variables de entorno

Añade las siguientes variables a tu fichero `.env`:

```env
# ── Quiver ────────────────────────────────────────────────────────────────────

# Clave secreta para firmar los JWT. Genera una con:
# python -c "import secrets; print(secrets.token_hex(32))"
QUIVER_SECRET_KEY=pon-aqui-tu-clave-secreta-de-al-menos-32-caracteres

# URL de tu base de datos (puede ser la misma que usa tu proyecto)
QUIVER_DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tu_base_de_datos

# Entorno: development muestra información de debug en el portal
QUIVER_ENV=development

# Prefijo de las rutas de Quiver (por defecto /quiver/v1)
# QUIVER_PREFIX=/quiver/v1

# URL del frontend (necesaria para los emails de reset de contraseña)
QUIVER_FRONTEND_URL=http://localhost:5173

# Roles que tienen acceso al portal de usuario (separados por coma)
# El rol "admin" siempre tiene acceso, no hace falta incluirlo
QUIVER_PORTAL_ROLES=cliente,cliente_premium

# Mensaje de bienvenida del portal en producción (opcional)
# QUIVER_PORTAL_WELCOME_MESSAGE=Bienvenido. Esta sección estará disponible próximamente.
```

> **Nota:** `QUIVER_DATABASE_URL` puede apuntar a la misma base de datos que usa tu proyecto. Quiver solo crea sus propias tablas (`admin_users`, `roles`, `permissions`, etc.) y no modifica las tuyas.

---

## Paso 3 — Montar Quiver en tu aplicación FastAPI

Localiza el fichero donde creas tu instancia de FastAPI (normalmente `main.py` o `app.py`) y añade Quiver:

```python
# main.py (tu fichero existente)
from fastapi import FastAPI
from quiver import QuiverApp

# Tu app existente
app = FastAPI(title="Mi API")

# Tus routers existentes — no se modifican
app.include_router(products_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")

# Montar Quiver — añade esta línea
quiver = QuiverApp(app)
```

Eso es todo en el lado de Python para tenerlo funcionando. Quiver monta automáticamente bajo `/quiver/v1`.

---

## Paso 4 — Crear las tablas de Quiver en tu base de datos

Quiver gestiona sus propias migraciones con Alembic. Ejecuta:

```bash
quiver db migrate
```

Este comando crea las tablas necesarias en tu base de datos:

- `admin_users` — usuarios del sistema
- `roles` — roles disponibles
- `permissions` — permisos registrados
- `role_has_permissions` — qué permisos tiene cada rol
- `user_has_roles` — qué roles tiene cada usuario
- `refresh_tokens` — sesiones activas
- `password_reset_tokens` — tokens de reset de contraseña

> **Importante:** este comando solo crea tablas nuevas. Nunca modifica ni elimina las tablas de tu proyecto.

---

## Paso 5 — Crear el primer usuario administrador

Antes de poder acceder al panel necesitas crear un superuser:

```bash
quiver create-superuser
```

El comando te pedirá el email y la contraseña:

```
Quiver — Crear superuser
Email: admin@tuempresa.com
Contraseña:
Confirmar contraseña:

✓ Superuser creado correctamente: admin@tuempresa.com
```

---

## Paso 6 — Instalar el frontend

El panel de administración y el portal de usuario son una aplicación React. A diferencia del backend (que es un paquete pip), el frontend se copia en tu proyecto porque **lo vas a modificar**: al menos el `UserLayout.tsx` y las páginas del portal son tuyas.

### Opción A — Clonar solo el directorio `frontend/` con sparse checkout (recomendado)

Este método descarga únicamente la carpeta del frontend sin traer todo el historial del repositorio de Quiver:

```bash
# Desde la raíz de tu proyecto
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/tu-organizacion/quiver.git /tmp/quiver-clone

cd /tmp/quiver-clone
git sparse-checkout set frontend

# Copiar el frontend a tu proyecto
cp -r frontend /ruta/a/tu-proyecto/quiver-ui

# Limpiar el clon temporal
cd /ruta/a/tu-proyecto
rm -rf /tmp/quiver-clone
```

### Opción B — Clonar el repo completo y quedarte solo con el frontend

Si ya tienes el repo clonado o prefieres un proceso más simple:

```bash
# Clonar el repo completo (solo el último commit, sin historial)
git clone --depth 1 https://github.com/tu-organizacion/quiver.git /tmp/quiver-clone

# Copiar el frontend a tu proyecto
cp -r /tmp/quiver-clone/frontend /ruta/a/tu-proyecto/quiver-ui

# Limpiar
rm -rf /tmp/quiver-clone
```

### Instalar las dependencias del frontend

```bash
cd quiver-ui
npm install
```

Esto crea una carpeta `quiver-ui/` en tu proyecto con el código fuente del frontend.

> **¿Por qué no se añade como submódulo git?** Porque el frontend es tuyo una vez instalado — lo vas a modificar para adaptarlo a tu proyecto. Un submódulo te forzaría a sincronizarlo con el repo de Quiver en cada pull, sobreescribiendo tus cambios. Copia limpia es más simple y más honesta con la realidad.

### Configurar el frontend

Crea el fichero `quiver-ui/.env.local` con tus valores:

```env
# URL base de la API de Quiver
VITE_API_BASE_URL=http://localhost:8000

# Entorno (development o production)
VITE_QUIVER_ENV=development

# Roles del portal (deben coincidir con QUIVER_PORTAL_ROLES en el backend)
VITE_PORTAL_ROLES=cliente,cliente_premium
```

### Arrancar el frontend en desarrollo

```bash
cd quiver-ui
npm run dev
```

El frontend arrancará en `http://localhost:5173` con el proxy configurado hacia tu API en `http://localhost:8000`.

---

## Paso 7 — Verificar la instalación

Con tu API y el frontend corriendo:

1. Abre `http://localhost:5173/auth/login`
2. Entra con las credenciales del superuser que creaste en el Paso 5
3. Deberías ver el panel de administración

Para verificar que la API de Quiver responde correctamente:

```bash
curl http://localhost:8000/quiver/v1/portal/
```

Respuesta esperada:

```json
{
  "message": "Quiver portal",
  "version": "0.1.0",
  "env": "development"
}
```

---

## Paso 8 — Crear roles iniciales

Quiver no crea roles por defecto. Necesitas crear al menos el rol `admin` y los roles de portal que hayas configurado. Puedes hacerlo desde la UI o con el siguiente comando:

```bash
quiver create-roles
```

El comando interactivo te guía:

```
Quiver — Crear roles iniciales

Roles a crear basados en tu configuración:
  • admin        (área de administración)
  • cliente      (portal de usuario)
  • cliente_premium (portal de usuario)

¿Crear estos roles ahora? [S/n]: S

✓ Rol "admin" creado
✓ Rol "cliente" creado
✓ Rol "cliente_premium" creado

Asignar rol "admin" al superuser admin@tuempresa.com? [S/n]: S
✓ Rol asignado correctamente
```

---

## Uso básico

### Registrar un CRUD para tus modelos existentes

Si tienes un modelo SQLModel en tu proyecto, puedes añadir su gestión al panel de admin en menos de 10 líneas:

```python
# cruds/product_crud.py (fichero nuevo en tu proyecto)
from quiver import QuiverCRUD
from quiver.fields import TextField, NumberField, SelectField, CheckboxField
from quiver.columns import Column

from models import Product  # tu modelo existente

class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    columns = [
        Column("name",      label="Nombre",    sortable=True),
        Column("price",     label="Precio",    col_type="currency"),
        Column("is_active", label="Estado",    col_type="badge",
               badge_map={True: ("Activo", "green"), False: ("Inactivo", "red")}),
    ]

    fields = [
        TextField("name",      label="Nombre",   required=True),
        NumberField("price",   label="Precio"),
        CheckboxField("is_active", label="Activo", default=True),
    ]

    search_fields = ["name"]
    order_by = "-created_at"
```

Luego registrarlo en tu `main.py`:

```python
from cruds.product_crud import ProductCRUD

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
```

Quiver genera automáticamente los endpoints y la UI para listar, crear, editar y eliminar productos.

---

### Configurar el menú del admin

Define la estructura del menú lateral en tu `main.py`:

```python
from quiver import QuiverApp
from quiver.menu import MenuGroup, MenuItem

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register(CategoryCRUD)

quiver.set_menu([
    MenuGroup("Catálogo", icon="tag", items=[
        MenuItem("Productos",   route="/admin/products",   permission="products.list"),
        MenuItem("Categorías",  route="/admin/categories", permission="categories.list"),
    ]),
    MenuItem("Usuarios", route="/admin/users", permission="users.list"),
])
```

---

### Añadir lógica de negocio a un CRUD

Si crear un producto implica lógica adicional (notificaciones, generar un slug, etc.), usa los hooks:

```python
from slugify import slugify

class ProductCRUD(QuiverCRUD):
    model = Product
    route = "products"

    async def before_create(self, data, db, user):
        # Generar slug automáticamente antes de guardar
        data["slug"] = slugify(data["name"])
        return data

    async def after_create(self, instance, db, user):
        # Notificar al equipo tras crear un producto
        await notify_team(f"Nuevo producto creado: {instance.name}")
```

---

### Añadir una página custom al admin

Para páginas que no son CRUDs estándar (reportes, herramientas, dashboards específicos):

```python
# pages/sales_report.py
from quiver import quiver_page, QuiverPage

@quiver_page(
    route="/admin/reportes/ventas",
    layout="admin",
    permission="reports.view",
    title="Ventas del mes",
    component="SalesReportPage",   # nombre del componente React
)
class SalesReportPage(QuiverPage):
    pass
```

Luego registrar el decorador antes de que `QuiverApp` arranque:

```python
# main.py
import pages.sales_report  # la importación activa el decorador

quiver = QuiverApp(app)
```

Y crear el componente React en `quiver-ui/src/pages/portal/SalesReportPage.tsx` y registrarlo:

```tsx
// quiver-ui/src/main.tsx
import { PageRegistry } from "@/plugin/PageRegistry"
import { SalesReportPage } from "@/pages/admin/SalesReportPage"

PageRegistry.register("SalesReportPage", SalesReportPage)
```

---

### Añadir una página custom al portal

Igual que las páginas de admin, pero con `layout="portal"` y `allowed_roles`:

```python
@quiver_page(
    route="/portal/vip",
    layout="portal",
    allowed_roles=["cliente_premium", "admin"],
    title="Zona VIP",
    component="VipPage",
)
class VipPage(QuiverPage):
    pass
```

---

### Configurar el envío de emails

Para que el reset de contraseña funcione, implementa la interfaz `EmailSender`:

```python
# email.py (fichero nuevo en tu proyecto)
from quiver import EmailSender
import httpx  # o el cliente que uses para tu proveedor de email

class SendGridEmailSender(EmailSender):
    async def send_reset_email(self, to: str, token: str, reset_url: str) -> None:
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {SENDGRID_API_KEY}"},
                json={
                    "to": [{"email": to}],
                    "subject": "Restablecer contraseña",
                    "html": f'<a href="{reset_url}">Haz clic aquí para restablecer tu contraseña</a>',
                }
            )
```

Registrarlo en `QuiverApp`:

```python
from email import SendGridEmailSender

quiver = QuiverApp(app, email_sender=SendGridEmailSender())
```

---

## Producción

### Compilar el frontend

```bash
cd quiver-ui
npm run build
```

El build de producción se copia automáticamente a `tu_proyecto/quiver_static/` (configurable en `vite.config.ts`). FastAPI lo sirve como archivos estáticos.

### Configurar las variables de entorno de producción

```env
QUIVER_SECRET_KEY=clave-segura-de-produccion-diferente-a-la-de-desarrollo
QUIVER_DATABASE_URL=postgresql://usuario:contraseña@host-produccion:5432/db
QUIVER_ENV=production
QUIVER_FRONTEND_URL=https://admin.tudominio.com
```

### Servir el frontend desde FastAPI en producción

Quiver sirve automáticamente el build de React cuando `QUIVER_ENV=production`. No necesitas un servidor de frontend separado.

```python
# main.py — sin cambios, Quiver detecta el entorno automáticamente
quiver = QuiverApp(app)
```

---

## Estructura recomendada del proyecto tras la integración

```
tu-proyecto/
├── main.py                  # tu app FastAPI + QuiverApp
├── models/                  # tus modelos SQLModel existentes
├── routers/                 # tus routers existentes
├── cruds/                   # nuevo: tus QuiverCRUD
│   ├── product_crud.py
│   └── category_crud.py
├── pages/                   # nuevo: tus páginas custom @quiver_page
│   └── sales_report.py
├── email.py                 # nuevo: tu implementación de EmailSender
├── quiver-ui/               # nuevo: frontend de Quiver
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/       # tus páginas custom del admin
│   │   │   └── portal/      # tus páginas del portal
│   │   └── layout/
│   │       └── UserLayout.tsx  # personaliza el portal aquí
│   └── .env.local
└── .env
```

---

---

## Actualizar Quiver

### Actualizar el backend

Para actualizar a una nueva versión del paquete Python:

```bash
pip install --force-reinstall git+https://github.com/tu-organizacion/quiver.git@v0.2.0
```

Si usas `pyproject.toml`, actualiza el tag en la dependencia y reinstala:

```toml
"quiver-framework @ git+https://github.com/tu-organizacion/quiver.git@v0.2.0",
```

```bash
pip install -e .
```

Después de actualizar, aplica las nuevas migraciones si las hay:

```bash
quiver db migrate
```

### Actualizar el frontend

El frontend vive en tu proyecto como código propio — no se actualiza automáticamente. Para incorporar cambios de una nueva versión de Quiver al frontend tienes dos opciones:

**Opción A — Revisar el changelog y aplicar los cambios manualmente.** Recomendado si has personalizado mucho el frontend. Consulta el `CHANGELOG.md` del repositorio de Quiver para ver exactamente qué ficheros han cambiado.

**Opción B — Copiar la nueva versión y re-aplicar tus cambios.** Más rápido si tus cambios son pocos y están bien localizados (principalmente `UserLayout.tsx` y las páginas del portal).

> **Convención recomendada:** mantén tus personalizaciones en ficheros separados de los built-in de Quiver. Si no modificas los ficheros del core (AdminLayout, guards, componentes de CRUD), actualizar el frontend será siempre una copia limpia sin conflictos.

---

## Preguntas frecuentes

**¿Quiver modifica mis modelos o tablas existentes?**
No. Quiver crea exclusivamente sus propias tablas con el prefijo de nombre `admin_*`. Nunca toca las tablas de tu proyecto.

**¿Puedo usar mis modelos existentes en los CRUDs de Quiver?**
Sí. `QuiverCRUD` acepta cualquier modelo SQLModel, incluidos los de tu proyecto. Solo define `model = TuModelo` y `route = "tu-ruta"`.

**¿Puedo tener mi propio sistema de auth además del de Quiver?**
Sí. Quiver monta su auth bajo `/quiver/v1/auth` y no interfiere con ningún otro sistema de autenticación que tengas. Los endpoints de tu API siguen funcionando con su propia auth si la tienen.

**¿Quiver funciona con SQLite para desarrollo?**
Sí. Cambia `QUIVER_DATABASE_URL` a `sqlite:///./quiver.db` y funcionará. Para producción se recomienda PostgreSQL.

**¿Puedo cambiar el prefijo `/quiver/v1`?**
Sí. Establece `QUIVER_PREFIX=/admin` (o lo que prefieras) en tu `.env`. El frontend se configura automáticamente a través de `VITE_API_BASE_URL`.

**¿Qué pasa si ya tengo una tabla de usuarios en mi proyecto?**
Quiver crea su propia tabla `admin_users` independiente. Ambas tablas conviven sin interferirse. La decisión de qué hacer con tus usuarios existentes (migrarlos, sincronizarlos o mantenerlos separados) es tuya. Consulta la guía de migración de usuarios en la documentación avanzada.

---

## Resumen de comandos

### Instalación

| Comando | Descripción |
|---|---|
| `pip install git+https://github.com/tu-org/quiver.git@v0.1.0` | Instalar versión específica |
| `pip install git+https://github.com/tu-org/quiver.git` | Instalar última versión de main |
| `pip install --force-reinstall git+https://...@v0.2.0` | Actualizar a una nueva versión |

### CLI de Quiver

| Comando | Descripción |
|---|---|
| `quiver db migrate` | Crea las tablas de Quiver en la base de datos |
| `quiver create-superuser` | Crea el primer usuario administrador |
| `quiver create-roles` | Crea los roles iniciales basados en la configuración |
| `quiver db rollback` | Revierte la última migración de Quiver |
| `quiver --version` | Muestra la versión instalada |

---

*Quiver — Panel de administración y portal de usuario para FastAPI.*
