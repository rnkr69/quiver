# Instalación

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

Quiver se instala directamente desde el repositorio privado de la organización. No se publica en PyPI.

> **Entorno virtual:** instala Quiver dentro del entorno virtual de tu proyecto (`venv`, `virtualenv`, `conda`…). Si aún no tienes uno:
> ```bash
> python -m venv .venv
> source .venv/bin/activate   # Windows: .venv\Scripts\activate
> ```

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

Si el repositorio es privado, Git necesita credenciales para clonarlo.

**Con token de acceso personal (recomendado para CI/CD):**

```bash
pip install git+https://TU_TOKEN@github.com/tu-organizacion/quiver.git@v0.1.0
```

O, para no exponer el token en el comando:

```bash
# En las variables de entorno del servidor o en .env (sin commitear)
export GIT_TOKEN=ghp_tu_token_aqui

pip install git+https://${GIT_TOKEN}@github.com/tu-organizacion/quiver.git@v0.1.0
```

**Con SSH (recomendado para desarrollo local si tienes clave SSH configurada):**

```bash
pip install git+ssh://git@github.com/tu-organizacion/quiver.git@v0.1.0
```

> **Seguridad:** nunca escribas el token directamente en `pyproject.toml` ni en `requirements.txt` si esos ficheros están en el repositorio. Usa variables de entorno o el gestor de secretos de tu organización.

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

# Prefijo de las rutas de Quiver (por defecto /quiver/v1)
# QUIVER_PREFIX=/quiver/v1

# URL del frontend (necesaria para los emails de reset de contraseña)
QUIVER_FRONTEND_URL=http://localhost:5173

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
| `QUIVER_PREFIX` | No | `/quiver/v1` | Prefijo de todas las rutas de Quiver. |
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
```

Quiver monta automáticamente todos sus routers bajo `/quiver/v1` y registra los manejadores de excepciones necesarios.

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

## Paso 6 — Instalar el frontend

El panel de administración y el portal son una aplicación React. A diferencia del backend (que es un paquete pip), **el frontend se copia en tu proyecto** porque lo vas a personalizar: el `UserLayout.tsx` y las páginas del portal son tuyas.

### Opción A — Sparse checkout (recomendado, descarga solo el frontend)

```bash
# Desde la raíz de tu proyecto
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/tu-organizacion/quiver.git /tmp/quiver-clone

cd /tmp/quiver-clone
git sparse-checkout set frontend

# Copiar el frontend a tu proyecto
cp -r frontend /ruta/a/tu-proyecto/quiver-ui

# Limpiar
rm -rf /tmp/quiver-clone
```

### Opción B — Clonar el repo completo

```bash
git clone --depth 1 https://github.com/tu-organizacion/quiver.git /tmp/quiver-clone
cp -r /tmp/quiver-clone/frontend /ruta/a/tu-proyecto/quiver-ui
rm -rf /tmp/quiver-clone
```

### Instalar dependencias y configurar

```bash
cd quiver-ui
npm install
```

Crea el fichero `quiver-ui/.env.local`:

```env
# URL base de la API
VITE_API_BASE_URL=http://localhost:8000
```

### Arrancar en desarrollo

```bash
cd quiver-ui
npm run dev
```

El frontend arrancará en `http://localhost:5173` con proxy configurado hacia `http://localhost:8000`.

> **¿Por qué no es un submódulo git?** Porque el frontend es tuyo una vez instalado. Lo vas a modificar para adaptar el portal a tu proyecto. Un submódulo te forzaría a sincronizarlo con el repo de Quiver en cada `pull`, sobreescribiendo tus cambios. Copia limpia es más simple.

---

## Paso 7 — Verificar la instalación

Con el backend y el frontend corriendo:

1. Abre `http://localhost:5173/auth/login`
2. Entra con las credenciales del superuser
3. Deberías ver el panel de administración

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
├── quiver-ui/               # nuevo: frontend copiado de Quiver
│   ├── src/
│   │   ├── pages/
│   │   │   └── portal/      # personaliza las páginas del portal aquí
│   │   └── layout/
│   │       └── UserLayout.tsx  # personaliza la navbar del portal
│   └── .env.local
└── .env
```

---

## Producción

### Compilar el frontend

```bash
cd quiver-ui
npm run build
```

### Variables de entorno de producción

```env
SECRET_KEY=clave-segura-diferente-a-desarrollo
DATABASE_URL=postgresql://usuario:contraseña@host-prod:5432/db
QUIVER_ENV=production
QUIVER_FRONTEND_URL=https://admin.tudominio.com
```

---

## Actualizar Quiver

### Actualizar el backend

```bash
pip install --force-reinstall git+https://github.com/tu-organizacion/quiver.git@v0.2.0
quiver db migrate
```

Si usas `pyproject.toml`, actualiza el tag y reinstala:

```toml
"quiver-framework @ git+https://github.com/tu-organizacion/quiver.git@v0.2.0",
```

```bash
pip install -e .
quiver db migrate
```

### Actualizar el frontend

El frontend vive en tu proyecto como código propio. Para incorporar cambios de una nueva versión:

- **Si tus cambios son pocos** (solo `UserLayout.tsx` y páginas del portal): copia la nueva versión de `frontend/` y re-aplica tus cambios.
- **Si has personalizado más**: consulta el `CHANGELOG.md` del repositorio de Quiver y aplica los cambios relevantes manualmente.

> Mantén tus personalizaciones en ficheros propios siempre que sea posible. Si no modificas los ficheros del core (AdminLayout, guards, componentes CRUD), actualizar es siempre una copia limpia.

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
Sí. Establece `QUIVER_PREFIX=/admin` en tu `.env`.

**¿Qué pasa si ya tengo una tabla de usuarios?**
Quiver crea su propia tabla `admin_users` independiente. Ambas conviven sin interferirse.

---

Siguiente: [Inicio rápido →](02-inicio-rapido.md)
