# Quiver — Definición de MVP

> Documento de planificación técnica. Recoge todas las decisiones de arquitectura, diseño y scope tomadas durante la fase de definición. Base para la extracción de épicas e historias de usuario.

---

## Índice

1. [Concepto y contexto](#1-concepto-y-contexto)
2. [Decisiones de arquitectura](#2-decisiones-de-arquitectura)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Modelo de datos — ERD](#4-modelo-de-datos--erd)
5. [Sistema de autenticación](#5-sistema-de-autenticación)
6. [Sistema de roles y permisos](#6-sistema-de-roles-y-permisos)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [API — Contrato de endpoints](#8-api--contrato-de-endpoints)
9. [CRUD Engine](#9-crud-engine)
10. [Sistema de layouts](#10-sistema-de-layouts)
11. [Control de acceso en frontend](#11-control-de-acceso-en-frontend)
12. [Scope del MVP vs Post-MVP](#12-scope-del-mvp-vs-post-mvp)
13. [Decisiones pendientes de implementación](#13-decisiones-pendientes-de-implementación)

---

## 1. Concepto y contexto

### Qué es Quiver

Quiver es un starter kit que el developer clona una vez por proyecto. Proporciona de forma inmediata:

- Un panel de administración completo (`/admin`) con autenticación, gestión de usuarios, roles y permisos, motor CRUD y dashboard.
- Un portal de usuario (`/portal`) con layout independiente, autenticación compartida y páginas custom por proyecto.
- Un sistema de control de acceso basado en roles (portal) y permisos granulares (admin).

Es el equivalente a Laravel Backpack en el ecosistema FastAPI, extendido con una zona de portal de usuario.

### A quién va dirigido

Developers con perfil backend (Python / Laravel) y experiencia media-baja en React. La documentación y las decisiones de diseño deben tener esto en cuenta: explicar el porqué, no solo el cómo.

### Analogía de referencia

| Laravel / Backpack | Quiver |
|---|---|
| `php artisan backpack:install` | `git clone` del starter kit |
| `CrudController` | `QuiverCRUD` |
| `@can('permission')` (Blade) | `<Can do="permission">` (React) |
| `@role('admin')` (Blade) | `<HasRole roles={[...]}>`(React) |
| Spatie Roles & Permissions | Sistema de roles y permisos integrado |
| Rutas de admin protegidas | `RequireRole` + `require_permission()` |

---

## 2. Decisiones de arquitectura

Estas decisiones fueron tomadas explícitamente durante la planificación y no deben revisarse sin evaluar el impacto en cascada.

### DA-01 — Modelo de distribución: starter kit

Quiver es un repositorio que se clona, no un paquete pip instalable. El developer posee el código fuente completo desde el primer día. Las actualizaciones del core son responsabilidad del equipo del proyecto (merge manual).

**Consecuencia:** el frontend React es completamente modificable. No hay sistema de plugins ni ComponentRegistry. Para añadir una página se crea el componente y se añade la ruta. Para personalizar el portal se edita `UserLayout.tsx`.

### DA-02 — Relación con el FastAPI existente: montado dentro

El router de Quiver se monta dentro del FastAPI existente del proyecto:

```python
app.include_router(quiver.router, prefix="/quiver")
```

El CRUD engine tiene acceso directo a los modelos SQLModel del proyecto. No hay llamadas HTTP entre Quiver y el API de negocio. No hay capa de proxy.

**Consecuencia:** el developer no necesita un servidor separado para el admin. Todo corre en el mismo proceso FastAPI.

### DA-03 — Tabla única de usuarios

Todos los usuarios del sistema (admins y clientes) viven en la tabla `admin_users`. La diferenciación es por rol, no por tabla.

**Scope:** Quiver asume proyecto nuevo. La integración con tablas de usuarios existentes está fuera del MVP. Es decisión del Product Owner o Project Manager cuando el proyecto ya tiene usuarios.

### DA-04 — Admin y portal son zonas distintas con layouts distintos

- `/admin/*` → `AdminLayout` (built-in, no modificar)
- `/portal/*` → `UserLayout` (del proyecto, modificar libremente)
- `/auth/*` → `AuthLayout` (built-in, no modificar)

Los tres layouts comparten el mismo sistema de auth, store y componentes base.

### DA-05 — Registro de CRUDs explícito

```python
quiver = QuiverApp(app)
quiver.register(ProductCRUD)
quiver.register(CategoryCRUD)
```

No hay autodescubrimiento por directorio. Lo que no se registra explícitamente no existe.

### DA-06 — Versionado de API desde el día 1

Todos los endpoints llevan `/v1/` en el prefijo. El prefix completo por defecto es `/quiver/v1`. Configurable al montar el router.

---

## 3. Stack tecnológico

### Backend

| Tecnología | Decisión | Notas |
|---|---|---|
| FastAPI | ✅ requerido | El proyecto ya lo usa |
| SQLModel | ✅ requerido | ORM del proyecto y de las tablas de Quiver |
| Alembic | ✅ requerido | Migraciones de las tablas de Quiver |
| python-jose | ✅ requerido | Generación y validación de JWT |
| passlib + bcrypt | ✅ requerido | Hashing de contraseñas |
| Base de datos | configurable | PostgreSQL recomendado. Cambio de motor es post-MVP |

### Frontend

| Tecnología | Decisión | Notas |
|---|---|---|
| React 18 | ✅ requerido | |
| TypeScript | ✅ requerido | Estricto |
| React Router 6 | ✅ requerido | Rutas anidadas con Outlet |
| Zustand | ✅ requerido | Estado global (auth, menu, ui) |
| TanStack Query (React Query) | ✅ requerido | Fetching, caché e invalidación |
| Axios | ✅ requerido | Cliente HTTP con interceptors JWT |
| Tailwind CSS | ✅ requerido | Estilos |
| Recharts | ✅ requerido | Gráficos del dashboard |
| Vite | ✅ requerido | Build y dev server |

---

## 4. Modelo de datos — ERD

### Tablas

#### `admin_users`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `email` | string unique | |
| `password_hash` | string | bcrypt, nunca se devuelve en respuestas |
| `first_name` | string | |
| `last_name` | string | |
| `is_active` | bool | false = usuario desactivado, no borrado |
| `is_superuser` | bool | bypasea todos los checks de permisos |
| `created_at` | datetime | |
| `updated_at` | datetime | |
| `last_login_at` | datetime nullable | null si nunca ha hecho login |

#### `roles`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `name` | string unique | slug: `"admin"`, `"cliente"`, `"cliente_premium"` |
| `display_name` | string | nombre legible para la UI |
| `description` | string nullable | |
| `created_at` | datetime | |

**Convención:** `name` es inmutable una vez creado. `display_name` es editable.

#### `permissions`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `name` | string unique | convención `resource.action` (ej: `products.list`) |
| `display_name` | string | nombre legible |
| `group` | string | agrupador para la UI (ej: `"Productos"`) |

**Importante:** los permisos se definen en código Python, no desde la UI. Se sincronizan a la tabla en el arranque de la aplicación. Desde la UI solo se asignan a roles.

#### `user_has_roles` (pivot)

| Campo | Tipo | Notas |
|---|---|---|
| `user_id` | UUID FK → admin_users | |
| `role_id` | UUID FK → roles | |
| `assigned_at` | datetime | auditoría básica |

#### `role_has_permissions` (pivot)

| Campo | Tipo | Notas |
|---|---|---|
| `role_id` | UUID FK → roles | |
| `permission_id` | UUID FK → permissions | |

#### `refresh_tokens`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → admin_users | |
| `token_hash` | string | hash del token, nunca el token en claro |
| `expires_at` | datetime | |
| `revoked_at` | datetime nullable | null = activo |
| `created_at` | datetime | |
| `user_agent` | string nullable | para UI de sesiones activas (post-MVP) |
| `ip_address` | string nullable | para UI de sesiones activas (post-MVP) |

#### `password_reset_tokens`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → admin_users | |
| `token_hash` | string | |
| `expires_at` | datetime | 1 hora |
| `used_at` | datetime nullable | null = no usado |
| `created_at` | datetime | |

**Regla:** un token solo puede usarse una vez aunque no haya expirado.

---

## 5. Sistema de autenticación

### Estrategia de tokens

- **Access token:** JWT firmado, vida de 15 minutos. Se guarda en memoria del SPA (variable Zustand), nunca en `localStorage` ni `sessionStorage`. Contiene en su payload: `user_id`, `roles[]`, `permissions[]`, `is_superuser`.
- **Refresh token:** opaco, vida de 7 días. Se guarda como cookie `HttpOnly`, `SameSite=Strict`. El hash se almacena en `refresh_tokens`.

**Consecuencia de tokens en memoria:** los cambios de permisos tienen una latencia de hasta 15 minutos. Esto es aceptable y debe estar documentado.

### Flujo 1 — Login

1. `POST /auth/login` con `{email, password}`
2. El backend busca el usuario. Si no existe o `is_active=false` → 401.
3. Verifica la contraseña con bcrypt. Si falla → 401.
4. Genera access token (payload: user_id, roles, permissions, is_superuser).
5. Guarda hash del refresh token en `refresh_tokens`. Actualiza `last_login_at`.
6. Responde con `{access_token, user, redirect_to}`. Establece cookie del refresh token.
7. El SPA guarda el access token en el store. Carga el menú. Redirige según `redirect_to`.

**Regla de redirección:** si el usuario tiene rol `"admin"` → `/admin`. Si solo tiene roles de portal → `/portal`. Admin tiene prioridad siempre.

### Flujo 2 — Hidratación al recargar página

El access token vive en memoria y se pierde al recargar. La cookie de refresh persiste.

1. Al montar el SPA, llama a `POST /auth/refresh` (la cookie va automática).
2. El backend verifica que el token no esté revocado ni expirado.
3. Si falla → redirige a `/auth/login`.
4. Si éxito → nuevo access token + user + permissions. El SPA continúa.

### Flujo 3 — Refresco silencioso

El interceptor de Axios gestiona esto de forma transparente para el developer.

1. Request cualquiera → 401 (token expirado).
2. El interceptor llama a `POST /auth/refresh` automáticamente.
3. Si el refresh falla → logout y redirige a login.
4. Si éxito → reintenta la request original con el nuevo token. El usuario no nota nada.

### Flujo 4 — Logout

1. `POST /auth/logout`.
2. El backend actualiza `revoked_at` en `refresh_tokens`. Vacía la cookie.
3. El SPA limpia el store y redirige a `/auth/login`.

### Flujo 5 — Reset de contraseña

1. `POST /auth/forgot-password {email}` → siempre responde 200 (no revela si existe).
2. El backend genera token, lo guarda en `password_reset_tokens`, envía email.
3. El usuario abre el link `/auth/reset?token=...`.
4. `POST /auth/reset-password {token, new_password}`.
5. El backend verifica que el token sea válido, no usado y no expirado.
6. Actualiza `password_hash`. Marca `used_at`. Revoca todos los `refresh_tokens` del usuario.

**Nota:** el envío de email requiere que el developer configure un `EmailSender`. Sin configuración el endpoint devuelve 503 con mensaje claro. La interfaz `EmailSender` es una clase abstracta con un método `send_reset_email(to, token)`.

### Superuser

Si `is_superuser=True` en el JWT, todas las comprobaciones de permisos y roles son bypaseadas tanto en backend como en frontend. Solo debe existir un superuser por instalación, creado mediante comando CLI en la inicialización.

---

## 6. Sistema de roles y permisos

### Modelo conceptual

- **Admin:** control de acceso por **permiso granular** (`products.list`, `products.create`, etc.)
- **Portal:** control de acceso por **rol** (`allowed_roles=["cliente", "cliente_premium", "admin"]`)
- Un usuario tiene uno o más roles. Un rol agrupa uno o más permisos. Los permisos directos en usuario están fuera del MVP.

### Convención de nombres de permisos

```
{resource}.{action}
```

Donde `action` es uno de: `list`, `create`, `show`, `update`, `delete`. Más cualquier permiso custom que el developer defina (`reports.export`, `billing.view`, etc.).

### Roles de portal

Los roles con acceso al portal se configuran en `QUIVER_PORTAL_ROLES`. Quiver añade `"admin"` automáticamente. Ejemplo:

```python
QUIVER_PORTAL_ROLES = ["cliente", "cliente_premium"]
# Resultado efectivo: ["cliente", "cliente_premium", "admin"]
```

El `router.tsx` lee esta configuración en lugar de tener los roles hardcodeados.

### Gestión de roles desde la UI

La pantalla de roles del admin muestra una matriz de checkboxes agrupada por `group` de permiso. El developer selecciona qué permisos tiene cada rol. La operación es replace-all: se envía el array completo de IDs seleccionados.

---

## 7. Estructura del proyecto

```
quiver/
│
├── backend/
│   ├── pyproject.toml
│   └── quiver/
│       ├── __init__.py              # API pública: QuiverApp, QuiverCRUD, ...
│       ├── app.py                   # QuiverApp: monta routers, sirve static
│       ├── config.py                # QuiverConfig: secret_key, db_url, ...
│       ├── exceptions.py            # QuiverUnauthorized, Forbidden, NotFound
│       │
│       ├── auth/
│       │   ├── router.py            # /auth/login, /refresh, /logout, /me, ...
│       │   ├── service.py           # AuthService
│       │   ├── schemas.py           # LoginRequest, TokenResponse, MeResponse
│       │   ├── dependencies.py      # require_permission(), require_any_role()
│       │   ├── jwt.py               # create_access_token, decode_token
│       │   └── password.py          # hash_password, verify_password
│       │
│       ├── rbac/
│       │   ├── router.py            # /admin/roles, /admin/permissions
│       │   ├── service.py           # RBACService
│       │   ├── schemas.py
│       │   └── decorators.py        # @require_permission como alternativa
│       │
│       ├── crud/
│       │   ├── base.py              # QuiverCRUD — clase base a extender
│       │   ├── router_factory.py    # genera los 7 endpoints por CRUD
│       │   ├── schema_factory.py    # genera schemas Pydantic desde fields
│       │   ├── filters.py           # TextFilter, SelectFilter, DateRangeFilter
│       │   └── fields/
│       │       ├── base.py          # QuiverField base
│       │       ├── text.py          # TextField, EmailField, PasswordField, TextareaField
│       │       ├── select.py        # SelectField, SelectMultipleField
│       │       ├── date.py          # DateField, DateTimeField
│       │       └── misc.py          # NumberField, CheckboxField, HiddenField
│       │
│       ├── dashboard/
│       │   ├── router.py            # GET /admin/dashboard
│       │   └── widgets/
│       │       ├── base.py          # QuiverWidget base
│       │       ├── stat_card.py     # StatCardWidget
│       │       └── chart.py         # ChartWidget
│       │
│       ├── pages/
│       │   ├── registry.py          # PageRegistry, @quiver_page
│       │   └── router.py            # GET /admin/pages, GET /portal/pages
│       │
│       ├── menu/
│       │   ├── builder.py           # MenuBuilder — filtra por permisos/roles
│       │   └── schemas.py           # MenuItem, MenuGroup
│       │
│       ├── models/
│       │   ├── admin_user.py        # AdminUser SQLModel
│       │   ├── role.py              # Role SQLModel
│       │   ├── permission.py        # Permission SQLModel
│       │   └── token.py             # RefreshToken, PasswordResetToken
│       │
│       └── database/
│           ├── session.py           # get_db FastAPI dependency
│           └── migrations/          # Alembic — tablas propias de Quiver
│
└── frontend/
    ├── package.json
    ├── vite.config.ts               # proxy → FastAPI en dev, outDir → static/
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── router.tsx               # tres árboles de rutas: auth, admin, portal
        │
        ├── config/
        │   └── quiver.ts            # QUIVER_API_BASE, QUIVER_PORTAL_ROLES, ...
        │
        ├── store/
        │   ├── auth.store.ts        # user, permissions[], roles[], is_superuser
        │   ├── menu.store.ts        # items del menú admin y portal
        │   └── ui.store.ts          # sidebarOpen, theme, breadcrumbs
        │
        ├── api/
        │   ├── client.ts            # Axios + interceptors JWT automáticos
        │   ├── auth.api.ts
        │   ├── crud.api.ts          # API genérica: list, create, update, ...
        │   └── menu.api.ts
        │
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useCrud.ts           # basado en TanStack Query
        │   ├── usePermission.ts     # can(), canAny()
        │   └── useRole.ts           # hasRole(), hasAnyRole()
        │
        ├── layout/
        │   ├── AuthLayout.tsx       # built-in — no modificar
        │   ├── AdminLayout.tsx      # built-in — no modificar
        │   └── UserLayout.tsx       # del proyecto — diseño libre
        │
        ├── guards/
        │   ├── RequireAuth.tsx      # redirige a login si no autenticado
        │   └── RequireRole.tsx      # redirige a 403 si no tiene el rol
        │
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.tsx            # built-in
        │   │   └── ForgotPasswordPage.tsx   # built-in
        │   ├── errors/
        │   │   └── ForbiddenPage.tsx        # built-in — sobreescribible
        │   ├── dashboard/
        │   │   └── DashboardPage.tsx        # built-in
        │   ├── crud/
        │   │   ├── ListPage.tsx             # built-in — CRUD engine
        │   │   ├── CreatePage.tsx           # built-in — CRUD engine
        │   │   ├── EditPage.tsx             # built-in — CRUD engine
        │   │   └── ShowPage.tsx             # built-in — CRUD engine
        │   ├── users/
        │   │   └── UsersPage.tsx            # built-in
        │   ├── roles/
        │   │   └── RolesPage.tsx            # built-in
        │   └── portal/
        │       └── PortalWelcomePage.tsx    # built-in — reemplazar cuando esté listo
        │
        └── components/
            ├── crud/
            │   ├── DataTable.tsx
            │   ├── Filters.tsx
            │   └── BulkActions.tsx
            ├── fields/
            │   ├── TextField.tsx
            │   ├── SelectField.tsx
            │   ├── DateField.tsx
            │   └── index.ts         # FieldRegistry
            ├── dashboard/
            │   ├── StatCard.tsx
            │   └── ChartWidget.tsx
            ├── access/
            │   ├── Can.tsx          # <Can do="permission"> — basado en permiso
            │   └── HasRole.tsx      # <HasRole roles={[...]}> — basado en rol
            └── ui/
                ├── Button.tsx
                ├── Modal.tsx
                ├── Badge.tsx
                └── Toast.tsx
```

---

## 8. API — Contrato de endpoints

Prefijo base: `/quiver/v1` (configurable). Todos los endpoints requieren HTTPS en producción.

### Auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | Login. Devuelve access_token + cookie refresh |
| POST | `/auth/refresh` | público (cookie) | Renueva el access_token usando la cookie |
| POST | `/auth/logout` | autenticado | Revoca refresh token. Vacía la cookie |
| GET | `/auth/me` | autenticado | Usuario actual + roles + permissions |
| POST | `/auth/forgot-password` | público | Solicita reset. Siempre 200 |
| POST | `/auth/reset-password` | público | Cambia contraseña. Revoca todas las sesiones |

### Meta / configuración SPA

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/admin/menu` | admin | Menú admin filtrado por permisos del usuario |
| GET | `/portal/menu` | autenticado | Menú portal filtrado por roles |
| GET | `/admin/config` | admin | Configuración general del panel |
| GET | `/admin/pages` | admin | Páginas custom admin registradas con @quiver_page |
| GET | `/portal/pages` | autenticado | Páginas custom portal registradas con @quiver_page |

### Dashboard

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/admin/dashboard` | admin | Datos de todos los widgets configurados |

### CRUD engine (dinámico por resource)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/admin/{resource}/config` | permiso: `{res}.list` | Configuración del recurso para el SPA |
| GET | `/admin/{resource}` | permiso: `{res}.list` | Listado paginado con filtros y ordenación |
| POST | `/admin/{resource}` | permiso: `{res}.create` | Crear registro |
| GET | `/admin/{resource}/{id}` | permiso: `{res}.show` | Detalle de un registro |
| PUT | `/admin/{resource}/{id}` | permiso: `{res}.update` | Actualizar registro |
| DELETE | `/admin/{resource}/{id}` | permiso: `{res}.delete` | Eliminar registro |
| DELETE | `/admin/{resource}` | permiso: `{res}.delete` | Bulk delete `{ids:[...]}` |
| GET | `/admin/{resource}/choices` | permiso: `{res}.list` | Choices para SelectField de otros CRUDs |

**Slugs reservados** que no pueden usarse como `route` en un `QuiverCRUD`: `config`, `menu`, `dashboard`, `pages`, `users`, `roles`, `permissions`, `choices`.

### Gestión de usuarios (built-in)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/admin/users` | `users.list` | Lista admin_users con roles |
| POST | `/admin/users` | `users.create` | Crea usuario con roles opcionales |
| GET | `/admin/users/{id}` | `users.show` | Detalle de usuario |
| PUT | `/admin/users/{id}` | `users.update` | Actualiza usuario y/o roles |
| DELETE | `/admin/users/{id}` | `users.delete` | Desactiva usuario (is_active=false) |

### Gestión de roles y permisos (built-in)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/admin/roles` | `roles.list` | Lista roles con conteos |
| POST | `/admin/roles` | `roles.create` | Crea rol |
| PUT | `/admin/roles/{id}` | `roles.update` | Actualiza display_name / description |
| DELETE | `/admin/roles/{id}` | `roles.delete` | Elimina rol y desvincula usuarios |
| GET | `/admin/permissions` | `roles.list` | Lista permisos agrupados por group |
| PUT | `/admin/roles/{id}/permissions` | `roles.update` | Replace-all de permisos de un rol |

### Portal

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/portal/` | autenticado | Welcome page / estado del portal |
| GET | `/portal/me` | autenticado | Perfil del usuario logueado |
| PUT | `/portal/me` | autenticado | Actualiza perfil propio |

---

## 9. CRUD Engine

### Declaración

El developer extiende `QuiverCRUD` una vez por recurso y lo registra explícitamente:

```python
class ProductCRUD(QuiverCRUD):
    # Requeridos
    model = Product
    route = "products"

    # Auto-generado si se omite: "products" → products.list, .create, .show, .update, .delete
    permissions = "products"

    # Columnas del listado — tres modos:
    columns = [Column("name", sortable=True), Column("price", col_type="currency")]
    # ó
    exclude_columns = ["internal_notes", "deleted_at"]
    # ó no declarar ninguno → todos los campos del modelo

    # Fields del formulario — mismos tres modos:
    fields = [TextField("name", required=True), NumberField("price")]
    # ó
    exclude_fields = ["slug"]  # id, created_at, updated_at excluidos por defecto
    # ó no declarar ninguno → todos los campos del modelo

    filters = [TextFilter("name"), SelectFilter("is_active", choices=[...])]
    search_fields = ["name", "description"]
    order_by = "-created_at"   # - prefijo = DESC
    page_size = 25
    bulk_actions = ["delete"]

quiver = QuiverApp(app)
quiver.register(ProductCRUD)
```

### Endpoints generados automáticamente

Por cada `QuiverCRUD` registrado se generan 7 endpoints (ver sección 8 — CRUD engine).

### Contrato del endpoint `/config`

```json
{
  "resource": "products",
  "title": "Productos",
  "permissions": { "list": true, "create": true, "show": true, "update": false, "delete": false },
  "columns": [
    { "key": "name", "label": "Nombre", "type": "text", "sortable": true },
    { "key": "is_active", "type": "badge", "badge_map": { "true": {"label":"Activo","color":"green"} } }
  ],
  "fields": [
    { "key": "name", "label": "Nombre", "type": "text", "required": true },
    { "key": "category_id", "type": "select", "choices_endpoint": "/admin/categories/choices" }
  ],
  "filters": [...],
  "bulk_actions": ["delete"],
  "page_size": 25,
  "order_by": "-created_at"
}
```

### Tipos de columna (MVP)

| Tipo | Descripción |
|---|---|
| `text` | Texto plano, truncado si supera el ancho |
| `number` | Número con separador de miles |
| `currency` | Número con símbolo de moneda (configurable en QuiverConfig) |
| `badge` | Pill de color según el valor. Requiere `badge_map` |
| `date` / `datetime` | Fecha formateada según locale del proyecto |
| `boolean` | Icono check / cruz |
| `link` | Texto clicable que navega a la vista show |
| `actions` | Botones edit / delete. Se añade automáticamente, no hay que declararlo |

### Tipos de campo — MVP

| Tipo | Descripción |
|---|---|
| `text` / `email` / `password` | Input básico. Password nunca se devuelve en GET |
| `number` | Input numérico con min, max, step |
| `textarea` | Área de texto |
| `select` | Dropdown con choices estáticos o `choices_from="resource"` |
| `select_multiple` | Multiselect, mismo sistema que select |
| `checkbox` | Toggle booleano |
| `date` / `datetime` | Date picker nativo |
| `hidden` | Campo oculto, valor fijo o generado por hook |

### Tipos de filtro — MVP

| Tipo | Descripción |
|---|---|
| `TextFilter` | ILIKE sobre el campo |
| `SelectFilter` | Exact match con dropdown de opciones |
| `BooleanFilter` | Sí / No / Todos |
| `DateRangeFilter` | Rango de fechas desde / hasta |

### Hooks de ciclo de vida

```python
class ProductCRUD(QuiverCRUD):
    async def before_create(self, data, db, user): return data
    async def after_create(self, instance, db, user): pass
    async def before_update(self, data, db, user): return data
    async def after_update(self, instance, db, user): pass
    async def before_delete(self, instance, db, user): pass
    async def after_delete(self, instance_id, db, user): pass

    # Override total de una acción
    async def create(self, data, db, user): ...

    # Filtrar el queryset base del listado
    async def get_queryset(self, db, user): return db.query(Product)
```

`get_queryset` aplica también cuando se generan los choices de `SelectField` en otros CRUDs que referencian este recurso.

### SelectField — endpoint de choices

`SelectField(choices_from="categories")` genera automáticamente `GET /admin/categories/choices`.

- Requiere el permiso `categories.list`.
- Si el CRUD referenciado no está registrado, Quiver falla en el arranque con error claro.
- Acepta `?label_field=name&value_field=id` como query params.
- Respeta el `get_queryset` del CRUD referenciado.

---

## 10. Sistema de layouts

### Tres zonas

| Zona | Ruta | Layout | Propiedad |
|---|---|---|---|
| Autenticación | `/auth/*` | `AuthLayout` | built-in, no modificar |
| Admin | `/admin/*` | `AdminLayout` | built-in, no modificar |
| Portal | `/portal/*` | `UserLayout` | del proyecto, modificar libremente |

### Registro de páginas custom

```python
# Página en zona admin
@quiver_page(
    route="/admin/reportes",
    layout="admin",
    permission="reports.view",
    title="Reportes",
    component="ReportsPage"
)
class ReportsPage(QuiverPage): pass

# Página en zona portal — acceso por roles
@quiver_page(
    route="/portal/vip",
    layout="portal",
    allowed_roles=["cliente_premium", "admin"],
    title="Zona VIP",
    component="VipPage"
)
class VipPage(QuiverPage): pass
```

El componente React (`"ReportsPage"`, `"VipPage"`) debe existir en `src/pages/` del frontend y estar importado en `router.tsx`.

### Navegación entre zonas

- El `AdminLayout` incluye un link "Ver portal" visible para usuarios con acceso al portal.
- El `UserLayout` incluye un link "Panel de admin" visible solo para usuarios con rol `"admin"`.
- Sin estos links, el usuario queda atrapado en su zona.

### Portal welcome page

La ruta `/portal` renderiza `PortalWelcomePage` por defecto.

- En `QUIVER_ENV=development` muestra información técnica: roles del usuario, instrucciones para personalizar.
- En `QUIVER_ENV=production` muestra un mensaje genérico de bienvenida.
- El developer la reemplaza por su `HomePage` real cuando esté lista.

---

## 11. Control de acceso en frontend

### Guards de rutas

```tsx
// Requiere autenticación — redirige a /auth/login si no
<RequireAuth />

// Requiere rol — redirige a /403 si no tiene ninguno de los roles
<RequireRole roles={["admin"]} />
<RequireRole roles={["cliente", "cliente_premium", "admin"]} />
```

### Componentes de visibilidad

```tsx
// Basado en permiso — zona admin
<Can do="products.create">
  <CreateButton />
</Can>

<Can do="reports.export" fallback={<UpgradePrompt />}>
  <ExportButton />
</Can>

// Basado en rol — zona portal y mixta
<HasRole roles={["cliente_premium", "admin"]}>
  <PremiumContent />
</HasRole>
```

### Hooks

```tsx
const { can, canAny } = usePermission()
const { hasRole, hasAnyRole } = useRole()

const canEdit   = can("products.update")
const isPremium = hasAnyRole(["cliente_premium", "admin"])
```

### Reglas importantes

1. `Can` y `HasRole` son solo UI — no son seguridad. La seguridad real está en el backend.
2. Si `is_superuser=true`, `can()` y `hasRole()` devuelven siempre `true`.
3. 401 del backend → el SPA redirige a login. 403 → el SPA muestra `ForbiddenPage`.
4. Los permisos viajan en el payload del JWT — no hay llamada extra a la API para consultarlos.

---

## 12. Scope del MVP vs Post-MVP

### En el MVP

- Autenticación completa (login, logout, refresh, reset de contraseña)
- Tabla `admin_users` única para admins y clientes
- Sistema de roles y permisos (RBAC por rol para portal, por permiso para admin)
- CRUD engine completo con 8 tipos de columna, 8 tipos de campo, 4 tipos de filtro
- Bulk delete
- Dashboard con StatCard y ChartWidget
- Gestión built-in de usuarios admin
- Gestión built-in de roles y permisos (con matriz de checkboxes)
- Menú lateral dinámico filtrado por permisos/roles
- Sistema de páginas custom para admin y portal con `@quiver_page`
- AdminLayout + UserLayout + AuthLayout
- Portal welcome page
- Componentes `Can` y `HasRole`
- Hooks `usePermission` y `useRole`
- `ForbiddenPage` built-in
- Auto-generación de columnas y fields desde SQLModel con soporte de exclude
- SelectField con choices dinámicos y endpoint de choices automático

### Post-MVP (documentado, no en scope)

| Feature | Prioridad sugerida | Notas |
|---|---|---|
| CLI para inicializar proyecto | media | `quiver new mi-proyecto` |
| Sesiones activas del usuario | alta | `GET /auth/sessions`, `DELETE /auth/sessions/{id}` |
| Soft delete configurable | alta | campo `deleted_at` en el modelo |
| Export de listados | media | CSV / Excel — `GET /admin/{resource}/export` |
| Tipos de campo: `file`, `image` | alta | requiere configurar storage |
| Tipos de campo: `rich_text` | media | TipTap |
| Tipos de campo: `repeatable` | baja | array de sub-formularios |
| Tipos de campo: `relationship` | media | FK con typeahead |
| Audit log | media | historial de cambios por registro |
| Activity log | baja | log de acciones de usuario en el panel |
| Two-factor authentication | media | TOTP — el sistema de auth actual debe no romperlo cuando llegue |
| Notificaciones in-app | baja | polling primero, websocket después |
| Impersonation | baja | super-admin hace login como otro usuario |
| Bulk actions custom | media | más allá de delete |
| Settings management | media | tabla clave-valor editable desde UI |
| Auto-generación de CLI de permisos | baja | `quiver permissions sync` |
| Cambio de motor de BD | baja | actualmente acoplado a SQLModel / PostgreSQL |
| Permisos granulares en portal | media | actualmente solo por rol |
| Integración con tabla de usuarios existente | alta | para proyectos que ya tienen usuarios |

---

## 13. Decisiones pendientes de implementación

Estas decisiones están tomadas en diseño pero tienen detalles que hay que confirmar al implementar.

### DP-01 — Latencia de cambios de permiso

Los cambios de permisos en un rol no se reflejan hasta que el access token del usuario expira (máx 15 min). **Documentar explícitamente** en la guía de administración. Si en el futuro esto es inaceptable, la solución es una blacklist de tokens en DB.

### DP-02 — Desactivar vs borrar usuarios

`DELETE /admin/users/{id}` desactiva (`is_active=false`), no borra. Preserva integridad referencial. No puede desactivarse a sí mismo. Para borrado físico, el developer lo implementa en su lógica de negocio.

### DP-03 — Revocación de sesiones al resetear contraseña

Al hacer reset de contraseña se revocan **todas** las sesiones del usuario en todos los dispositivos. Es la opción más segura. Documentar que el usuario quedará deslogueado en todos sus dispositivos.

### DP-04 — EmailSender como interfaz abstracta

```python
class EmailSender(ABC):
    @abstractmethod
    async def send_reset_email(self, to: str, token: str) -> None: ...
```

Sin configurar → el endpoint `/auth/forgot-password` devuelve `503 Service Unavailable` con mensaje: `"EmailSender not configured. See documentation."`.

### DP-05 — Inicialización del superuser

El primer superuser se crea mediante un comando de gestión en el arranque o CLI. Nunca desde la UI. Debe documentarse como paso obligatorio en el setup inicial del proyecto.

### DP-06 — Slugs reservados del CRUD engine

Quiver valida en el arranque que ningún `route` de un `QuiverCRUD` colisione con los endpoints built-in. Lista de slugs reservados: `config`, `menu`, `dashboard`, `pages`, `users`, `roles`, `permissions`, `choices`, `auth`, `portal`. Error en startup con mensaje claro si hay colisión.

---

*Documento generado durante la sesión de planificación del MVP. Versión 1.0.*
