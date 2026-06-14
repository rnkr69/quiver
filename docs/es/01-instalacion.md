> 🇬🇧 [English version](../01-installation.md)

# Instalación

> Esta guía asume que ya tienes un proyecto FastAPI funcionando y quieres añadir Quiver para obtener un panel de administración y un portal de usuario. Tu proyecto **no tiene tabla de usuarios propia** — Quiver gestionará todos los usuarios del sistema.

---

## Requisitos previos

- Python 3.11+
- Un proyecto FastAPI funcionando con SQLModel como ORM
- PostgreSQL (recomendado) o SQLite (solo para desarrollo)
- Node.js 18+ y npm — **solo** si quieres arrancar o compilar la SPA tú mismo (el paquete ya incluye una SPA compilada)

---

## Paso 1 — Instalar el paquete Python

Quiver se publica en PyPI con el nombre de distribución **`fastapi-quiver`**. El nombre de import en el código sigue siendo `quiver` (por ejemplo, `from quiver import QuiverApp`).

> **Entorno virtual:** instala Quiver dentro del entorno virtual de tu proyecto (`venv`, `virtualenv`, `conda`…). Si aún no tienes uno:
> ```bash
> python -m venv .venv
> source .venv/bin/activate   # Windows: .venv\Scripts\activate
> ```

### Instalación básica (recomendada)

```bash
pip install fastapi-quiver
```

### Fijar una versión específica (recomendado para producción)

Fija siempre una versión en proyectos en producción para evitar cambios inesperados:

```bash
pip install "fastapi-quiver==0.1.0"
```

### Instalar desde un tag de Git (alternativa)

El paquete también vive en el repositorio público, dentro del subdirectorio `backend/`. Puedes instalarlo directamente desde un tag de Git:

```bash
pip install "git+https://github.com/rnkr69/quiver.git@v0.1.0#subdirectory=backend"
```

### Declarar la dependencia en `pyproject.toml`

```toml
[project]
dependencies = [
    "fastapi-quiver>=0.1.0",
]
```

```bash
pip install -e .
```

O si usas `requirements.txt`:

```txt
fastapi-quiver>=0.1.0
```

```bash
pip install -r requirements.txt
```

### Importante: ejecuta el CLI desde la raíz de tu proyecto

El CLI de Quiver (`quiver db migrate`, `quiver create-superuser`) busca el fichero `.env` en el **directorio de trabajo actual**. Ejecuta siempre estos comandos desde la carpeta donde está tu `.env`:

```bash
# Correcto — .env está en la raíz del proyecto
cd /ruta/a/tu-proyecto
quiver db migrate

# Incorrecto — no encontrará el .env
cd /otra/carpeta
quiver db migrate
```

### pyenv: el comando `quiver` no se encuentra

Si usas pyenv y tras instalar el paquete recibes `pyenv: quiver: command not found`, ejecuta:

```bash
pyenv rehash
```

pyenv necesita este comando para actualizar sus shims cada vez que se instala un paquete que expone un nuevo ejecutable. Después, verifica:

```bash
quiver --help
```

---

## Paso 2 — Añadir las variables de entorno

Añade las siguientes variables a tu fichero `.env`:

```env
# ── Quiver ────────────────────────────────────────────────────────────────────

# Clave secreta para firmar los JWT. Genera una con:
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=pon-aqui-tu-clave-secreta-de-al-menos-32-caracteres

# URL de tu base de datos (puede ser la misma que usa tu proyecto)
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tu_base_de_datos

# Entorno: development muestra información extra en el portal
QUIVER_ENV=development

# Prefijo de las rutas de la API de Quiver (por defecto /quiver/v1)
# QUIVER_PREFIX=/quiver/v1

# Ruta donde se sirve la SPA de administración/portal incluida (por defecto /quiver)
# Debe coincidir con el VITE_BASE_PATH del frontend (por defecto /quiver/)
# QUIVER_FRONTEND_PATH=/quiver

# URL del frontend (necesaria para los emails de reset de contraseña)
QUIVER_FRONTEND_URL=http://localhost:8000/quiver

# Roles que tienen acceso al portal de usuario (separados por coma)
# El superuser siempre tiene acceso, no hace falta incluirlo aquí
QUIVER_PORTAL_ROLES=cliente,cliente_premium

# Mensaje de bienvenida del portal en producción (opcional)
# QUIVER_PORTAL_WELCOME_MESSAGE=Bienvenido. Esta sección estará disponible próximamente.
```

> `DATABASE_URL` puede apuntar a la misma base de datos que usa tu proyecto. Quiver solo crea sus propias tablas (`admin_users`, `roles`, `permissions`, etc.) y nunca modifica las tuyas.

### Referencia completa de variables

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `SECRET_KEY` | Sí | — | Clave para firmar JWT. Mínimo 32 caracteres. |
| `DATABASE_URL` | Sí | — | SQLAlchemy URL. PostgreSQL o SQLite. |
| `QUIVER_ENV` | No | `development` | `development` o `production`. |
| `QUIVER_PREFIX` | No | `/quiver/v1` | Prefijo de las rutas de la API de Quiver. |
| `QUIVER_FRONTEND_PATH` | No | `/quiver` | Ruta donde se sirve la SPA incluida. Debe coincidir con `VITE_BASE_PATH` del frontend. |
| `QUIVER_FRONTEND_URL` | No | `http://localhost:5173` | URL base para los enlaces en emails. |
| `QUIVER_PORTAL_ROLES` | No | *(vacío)* | Roles con acceso al portal, separados por coma. |
| `QUIVER_PORTAL_WELCOME_MESSAGE` | No | *(texto genérico)* | Mensaje de bienvenida en producción. |

---

## Paso 3 — Montar Quiver en tu aplicación FastAPI

Localiza el fichero donde creas tu instancia de FastAPI (normalmente `main.py` o `app.py`) y añade Quiver:

```python
# main.py
from fastapi import FastAPI
from quiver import QuiverApp

# Tu app existente
app = FastAPI(title="Mi API")

# Tus routers existentes — no se modifican
app.include_router(products_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")

# Montar Quiver — una línea
quiver = QuiverApp(app)

# Registra aquí tus CRUDs, widgets, páginas y menú…
# quiver.register(MiCRUD)
# quiver.set_menu([...])

# Servir la SPA de administración/portal incluida — DEBE ser la ÚLTIMA línea de configuración
quiver.serve_frontend()
```

Quiver monta automáticamente todos sus routers de API bajo `/quiver/v1` y registra los manejadores de excepciones necesarios.

### Servir el frontend incluido

El wheel publicado **incluye la SPA de administración/portal ya compilada**. Llamar a `quiver.serve_frontend()` la monta para que puedas abrir el panel de administración desde el mismo servidor que ejecuta tu API — sin proceso ni compilación de frontend aparte.

> **Llama a `serve_frontend()` AL FINAL**, después de haber registrado todos tus CRUDs, páginas y rutas. Monta un manejador estático catch-all, por lo que cualquier cosa registrada bajo la misma ruta después quedaría eclipsada.

La SPA se sirve en `/quiver` (configurable con `QUIVER_FRONTEND_PATH`), mientras que la API permanece bajo `QUIVER_PREFIX` (por defecto `/quiver/v1`). Con uvicorn en el puerto 8000, el panel de administración se abre en `http://localhost:8000/quiver/`.

> **Es seguro llamarlo siempre.** Si no hay una SPA compilada presente — por ejemplo, instalaste sin build, o prefieres arrancar la SPA por separado en desarrollo — `serve_frontend()` no hace nada y simplemente registra un aviso. Puedes dejar la llamada en su sitio en todo momento.

---

## Paso 4 — Crear las tablas en la base de datos

```bash
quiver db migrate
```

Este comando crea las tablas de Quiver en tu base de datos:

| Tabla | Contenido |
|---|---|
| `admin_users` | Usuarios del sistema |
| `roles` | Roles disponibles |
| `permissions` | Permisos registrados |
| `role_has_permissions` | Qué permisos tiene cada rol |
| `user_has_roles` | Qué roles tiene cada usuario |
| `refresh_tokens` | Sesiones activas |
| `password_reset_tokens` | Tokens de reset de contraseña |

> Este comando solo **crea** tablas nuevas. Nunca modifica ni elimina las tablas de tu proyecto.

Para revertir la última migración:

```bash
quiver db rollback
```

---

## Paso 5 — Crear el primer usuario administrador

```bash
quiver create-superuser
```

El comando te pedirá los datos interactivamente:

```
=== Quiver — Create Superuser ===
Email: admin@tuempresa.com
First name: Ana
Last name: García
Password:
Confirm password:

Superuser 'admin@tuempresa.com' created successfully.
```

---

## Paso 6 — Abrir el panel de administración

El wheel publicado **incluye la SPA de administración/portal ya compilada**, y ya la montaste en el Paso 3 con `quiver.serve_frontend()`. **No hay nada más que instalar ni compilar** — solo arranca tu backend y ábrelo en el navegador.

```bash
uvicorn main:app --reload
```

Después abre:

```
http://localhost:8000/quiver/
```

La SPA es genérica: lee todo (columnas, campos, filtros, menú, páginas dinámicas) del backend en tiempo de ejecución, así que rara vez necesita cambios por aplicación. La administración vive en `/quiver` y la API en `/quiver/v1` — ambas servidas por el mismo proceso.

> Si cambiaste `QUIVER_FRONTEND_PATH`, abre esa ruta en su lugar.

---

### Desarrollo / avanzado: arrancar la SPA por separado

Solo necesitas esto si estás **modificando el frontend** y quieres hot reload, o si prefieres servir la SPA tú mismo. Para el uso normal, basta con el `serve_frontend()` del Paso 3.

Obtén el frontend desde el repositorio público:

```bash
git clone --depth 1 https://github.com/rnkr69/quiver.git
cd quiver/frontend
```

Instala las dependencias:

```bash
npm install
```

Crea el fichero `frontend/.env.local`:

```env
# Ruta base bajo la que se sirve la SPA — mantén la barra final.
# DEBE coincidir con el QUIVER_FRONTEND_PATH del backend (por defecto /quiver).
VITE_BASE_PATH=/quiver/

# URL base de la API
VITE_API_BASE_URL=http://localhost:8000/quiver/v1

# Roles que tienen acceso al portal de usuario (separados por coma)
VITE_PORTAL_ROLES=cliente,cliente_premium
```

Arranca el servidor de desarrollo:

```bash
npm run dev
```

El frontend arrancará en `http://localhost:5173/quiver/` y hará proxy de las llamadas a la API (`/quiver/v1`) hacia el backend. Con la SPA corriendo por separado, `serve_frontend()` en el backend sigue siendo un no-op inofensivo (o simplemente no lo llames).

---

## Paso 7 — Verificar la instalación

Con el backend corriendo (la SPA la sirve él):

1. Abre `http://localhost:8000/quiver/`
2. Entra con las credenciales del superuser
3. Deberías ver el panel de administración

> ¿Arrancas la SPA por separado en desarrollo? Abre `http://localhost:5173/quiver/` en su lugar.

Para verificar que la API responde, prueba el login:

```bash
curl -s -X POST http://localhost:8000/quiver/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tu-contraseña"}'
```

Respuesta esperada:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "redirect_to": "/admin"
}
```

---

## Estructura recomendada del proyecto

Tras la integración, tu proyecto quedará así:

```
tu-proyecto/
├── main.py                  # tu app FastAPI + QuiverApp
├── models/                  # tus modelos SQLModel existentes
├── routers/                 # tus routers existentes
├── cruds/                   # nuevo: tus QuiverCRUD
│   ├── product_crud.py
│   └── category_crud.py
├── pages/                   # nuevo: tus páginas custom (@quiver_page)
│   └── sales_report.py
├── email.py                 # nuevo: tu implementación de EmailSender
└── .env
```

La SPA de administración/portal viene **incluida en el paquete** y la sirve `quiver.serve_frontend()` — no necesitas un directorio `frontend/` en tu proyecto. El código fuente de la SPA vive en el repositorio de Quiver solo para desarrollo o builds personalizados.

---

## Producción

### El camino simple: servir la SPA incluida

Como el wheel incluye la SPA ya compilada, la configuración de producción recomendada es la misma que en desarrollo: mantén `quiver.serve_frontend()` como última línea de configuración y ejecuta tu app con un servidor ASGI de producción (por ejemplo `uvicorn`/`gunicorn` detrás de un reverse proxy). El panel de administración se sirve en `QUIVER_FRONTEND_PATH` (por defecto `/quiver`) por el mismo proceso que tu API.

### Variables de entorno de producción

```env
SECRET_KEY=clave-segura-diferente-a-desarrollo
DATABASE_URL=postgresql://usuario:contraseña@host-prod:5432/db
QUIVER_ENV=production
QUIVER_FRONTEND_URL=https://tudominio.com/quiver
# Opcional — cambia dónde se sirve la SPA (debe coincidir con VITE_BASE_PATH si recompilas)
# QUIVER_FRONTEND_PATH=/quiver
```

### Build personalizado (avanzado)

Si necesitas servir la SPA detrás de tu propio servidor web o CDN, todavía puedes compilarla tú mismo:

```bash
cd frontend
npm run build
```

Esto genera los assets estáticos en `backend/quiver/static`. Establece `VITE_BASE_PATH` (por defecto `/quiver/`, mantén la barra final) y `VITE_API_BASE_URL` en tiempo de compilación para que coincidan con tu despliegue. Mantén `VITE_BASE_PATH` sincronizado con el `QUIVER_FRONTEND_PATH` del backend.

---

## Actualizar Quiver

### Actualizar el backend

```bash
pip install --upgrade "fastapi-quiver==0.2.0"
quiver db migrate
```

Si usas `pyproject.toml`, actualiza la versión y reinstala:

```toml
"fastapi-quiver>=0.2.0",
```

```bash
pip install -e .
quiver db migrate
```

### Actualizar el frontend

El frontend viene incluido con el paquete, así que actualizar `fastapi-quiver` (arriba) también actualiza la SPA de administración/portal. No hay nada extra que hacer.

Si mantienes un **build personalizado** de la SPA, trae la versión correspondiente del repositorio y recompila:

```bash
cd quiver
git pull
cd frontend
npm install
npm run build
```

---

## Comandos de referencia

### CLI de Quiver

| Comando | Descripción |
|---|---|
| `quiver db migrate` | Crea/actualiza las tablas de Quiver en la base de datos |
| `quiver db rollback` | Revierte la última migración de Quiver |
| `quiver create-superuser` | Crea el primer usuario administrador de forma interactiva |
| `quiver --help` | Muestra todos los comandos disponibles |

---

## Preguntas frecuentes

**¿Quiver modifica mis tablas existentes?**
No. Quiver solo crea sus propias tablas. Nunca toca las de tu proyecto.

**¿Puedo usar mis modelos SQLModel existentes en los CRUDs?**
Sí. `QuiverCRUD` acepta cualquier modelo SQLModel. Solo define `model = TuModelo` y `route = "tu-ruta"`.

**¿Puedo tener mi propio sistema de auth además del de Quiver?**
Sí. Quiver monta su auth bajo `/quiver/v1/auth` y no interfiere con otros sistemas de autenticación que ya tengas.

**¿Funciona con SQLite para desarrollo?**
Sí. Usa `DATABASE_URL=sqlite:///./quiver.db`.

**¿Puedo cambiar el prefijo `/quiver/v1`?**
Sí. Establece `QUIVER_PREFIX=/admin` en tu `.env`. Esto cambia el prefijo de la API; para mover la SPA incluida, establece `QUIVER_FRONTEND_PATH` (y mantén `VITE_BASE_PATH` sincronizado si recompilas la SPA).

**¿Tengo que arrancar el frontend por separado?**
No. El wheel incluye la SPA ya compilada; llama a `quiver.serve_frontend()` como última línea de configuración y abre `/quiver/`. Arrancar la SPA por separado solo hace falta para desarrollo del frontend o despliegues personalizados.

**¿Qué pasa si ya tengo una tabla de usuarios?**
Quiver crea su propia tabla `admin_users` independiente. Ambas conviven sin interferirse.

---

Siguiente: [Inicio rápido →](02-inicio-rapido.md)
