# Quiver — Build Stories (historias para construir el framework)

> Los agentes deben tratar este documento como fuente de verdad única.

---

## Convenciones del documento

### Tipos de historia
| Tipo | Descripción |
|---|---|
| `backend` | Solo código Python / FastAPI |
| `frontend` | Solo código React / TypeScript |
| `fullstack` | Backend + frontend coordinados |
| `infra` | Configuración, tooling, estructura de proyecto |

### Escala de complejidad
| Nivel | Rango estimado | Descripción |
|---|---|---|
| `XS` | < 2h | Fichero de configuración, schema simple, utilidad pequeña |
| `S` | 2–4h | Endpoint único o componente simple con lógica directa |
| `M` | 4–8h | Feature con múltiples partes, integración y tests |
| `L` | 8–16h | Sistema con múltiples endpoints + frontend + tests de integración |
| `XL` | > 16h | Engine central, sistema transversal, múltiples módulos coordinados |

### Campos de cada historia
- **id** — identificador único. Formato: `E{n}-US{n}`
- **título** — verbo imperativo + objeto. Describe qué se construye, no qué hace el usuario final.
- **tipo** — backend / frontend / fullstack / infra
- **complejidad** — XS / S / M / L / XL
- **depende_de** — lista de IDs que deben estar implementados y en verde antes de empezar esta historia. `[]` si no hay dependencias.
- **crea** — ficheros nuevos que produce esta historia
- **modifica** — ficheros existentes que esta historia altera
- **contexto** — descripción técnica de qué hay que construir y por qué existe esta pieza en el sistema
- **criterios_funcionales** — comportamiento observable desde fuera del código (qué hace)
- **criterios_tecnicos** — restricciones y requisitos de implementación (cómo debe estar construido)

### Referencia de documentos base
Los agentes deben leer estos documentos antes de procesar cualquier historia:
- `quiver-mvp-definition.md` — arquitectura, ERD, decisiones de diseño, contrato de API
- `quiver-design-spec.md` — sistema de diseño, layouts, especificación de pantallas
- `quiver-epics-user-stories.md` — historias de usuario del producto final (para entender el objetivo)

---

---

## E1 — Setup e inicialización del proyecto

> Objetivo: tener el proyecto arrancando en local con estructura correcta, base de datos inicializada y un superuser creado. Sin E1 completa, ninguna otra épica puede empezar.

---

### E1-US1

```
id:           E1-US1
título:       Inicializar estructura del monorepo backend + frontend
tipo:         infra
complejidad:  M
depende_de:   []
```

**crea:**
```
quiver/
├── backend/
│   ├── pyproject.toml
│   ├── .python-version
│   └── quiver/
│       ├── __init__.py
│       └── config.py
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       └── main.tsx
├── .env.example
├── .gitignore
└── README.md
```

**modifica:** `[]`

**contexto:**
Punto de partida del proyecto. Establece la estructura de directorios, la configuración de herramientas de build, y los ficheros de entorno. El monorepo tiene dos workspaces independientes: `backend/` (Python/FastAPI con uv o pip) y `frontend/` (React/TypeScript con Vite). No comparten dependencias pero sí se ejecutan coordinados en desarrollo. El `vite.config.ts` debe configurar un proxy que reenvíe las llamadas a `/quiver` al servidor FastAPI en `localhost:8000` durante el desarrollo.

**criterios_funcionales:**
- [ ] Ejecutar `cd backend && pip install -e .` instala el paquete y sus dependencias sin errores
- [ ] Ejecutar `cd frontend && npm install` instala todas las dependencias sin errores
- [ ] Ejecutar `cd frontend && npm run dev` arranca Vite en puerto 5173
- [ ] El fichero `.env.example` documenta todas las variables de entorno requeridas con descripción de cada una
- [ ] El `README.md` tiene la sección "Quick start" con los pasos exactos para arrancar el proyecto desde cero

**criterios_tecnicos:**
- [ ] `pyproject.toml` usa formato PEP 517/518 con `[project]` y `[build-system]`. Dependencias mínimas declaradas: `fastapi`, `sqlmodel`, `alembic`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-dotenv`, `uvicorn`
- [ ] `tsconfig.json` configurado con `strict: true`, path alias `@/` → `src/`, `@components/` → `src/components/`
- [ ] `vite.config.ts` configura proxy: todas las requests a `/quiver` se reenvían a `http://localhost:8000`
- [ ] `vite.config.ts` configura `build.outDir` apuntando a `../backend/quiver/static/`
- [ ] `QuiverConfig` en `config.py` lee variables de entorno con valores por defecto documentados. Campos mínimos: `SECRET_KEY`, `DATABASE_URL`, `QUIVER_ENV` (development|production), `QUIVER_PREFIX` (default: `/quiver`), `QUIVER_PORTAL_ROLES`
- [ ] Si `SECRET_KEY` o `DATABASE_URL` están vacíos, la importación del módulo lanza `QuiverConfigError` con mensaje explícito
- [ ] `.env.example` contiene exactamente las mismas variables que lee `QuiverConfig`, con valores de ejemplo no funcionales
- [ ] `.gitignore` excluye: `.env`, `__pycache__`, `*.pyc`, `node_modules`, `dist`, `build`, `*.egg-info`


---

### E1-US2

```
id:           E1-US2
título:       Configurar base de datos, sesión SQLModel y migraciones Alembic
tipo:         backend
complejidad:  M
depende_de:   [E1-US1]
```

**crea:**
```
backend/quiver/
├── database/
│   ├── __init__.py
│   ├── session.py
│   └── migrations/
│       ├── env.py
│       ├── script.py.mako
│       └── versions/   (vacío, se poblará en E2)
└── alembic.ini
```

**modifica:**
```
backend/quiver/__init__.py
```

**contexto:**
Establece la capa de persistencia del framework. SQLModel se usa como ORM (wrapper sobre SQLAlchemy con integración Pydantic). La sesión de DB es una FastAPI dependency (`get_db`) que gestiona el ciclo de vida de la conexión. Alembic gestiona las migraciones de las tablas propias de Quiver (no las del proyecto del developer). El `env.py` de Alembic debe detectar automáticamente los modelos de Quiver para generar migraciones sin configuración adicional.

**criterios_funcionales:**
- [ ] Llamar a `get_db` en un endpoint FastAPI proporciona una sesión SQLModel funcional
- [ ] Ejecutar `alembic upgrade head` sin modelos creados aún no falla — aplica 0 migraciones
- [ ] La URL de la base de datos se lee de `QuiverConfig.DATABASE_URL`

**criterios_tecnicos:**
- [ ] `session.py` expone `engine` (SQLAlchemy engine), `get_db` (FastAPI dependency con `yield`) y `create_all_tables()` (para tests)
- [ ] `get_db` usa `Session(engine)` de SQLModel, no `SessionLocal()` de SQLAlchemy directamente
- [ ] El engine se crea con `connect_args={"check_same_thread": False}` solo si la URL es SQLite (para compatibilidad en tests). En PostgreSQL no se aplica.
- [ ] `alembic.ini` apunta a `quiver/database/migrations/` como `script_location`
- [ ] `env.py` de Alembic importa `SQLModel.metadata` para `target_metadata`, de forma que detecta todos los modelos de Quiver que importen de `quiver.models`
- [ ] `env.py` lee la URL de DB desde `QuiverConfig` — no hardcodeada en `alembic.ini`


---

### E1-US3

```
id:           E1-US3
título:       Implementar QuiverApp — clase principal de montaje en FastAPI
tipo:         backend
complejidad:  M
depende_de:   [E1-US1, E1-US2]
```

**crea:**
```
backend/quiver/
├── app.py
└── exceptions.py
```

**modifica:**
```
backend/quiver/__init__.py    ← expone QuiverApp en la API pública
```

**contexto:**
`QuiverApp` es el punto de entrada del framework. El developer la instancia pasando su app FastAPI y opcionalmente su configuración. Al instanciar, monta todos los routers de Quiver bajo el prefijo configurado y registra los handlers de excepciones. También expone el método `register(CRUDClass)` para registrar CRUDs (que se implementa en E5). En esta historia solo se implementa el esqueleto de la clase y el sistema de excepciones — los routers reales se montan en las épicas correspondientes.

**criterios_funcionales:**
- [ ] `quiver = QuiverApp(app)` no lanza ninguna excepción con una app FastAPI válida
- [ ] El prefijo por defecto es `/quiver/v1`, configurable vía `QuiverConfig.QUIVER_PREFIX`
- [ ] `quiver.register(MiCRUD)` está disponible aunque no hace nada hasta E5
- [ ] Las excepciones `QuiverNotFound`, `QuiverUnauthorized`, `QuiverForbidden`, `QuiverBadRequest` se convierten automáticamente en respuestas JSON con el formato `{detail: string, code: string}`

**criterios_tecnicos:**
- [ ] `QuiverApp.__init__` acepta `app: FastAPI` y `config: QuiverConfig = None`. Si config es None, instancia `QuiverConfig()` desde variables de entorno
- [ ] `QuiverApp` registra los exception handlers en la app FastAPI para `QuiverNotFound` (404), `QuiverUnauthorized` (401), `QuiverForbidden` (403), `QuiverBadRequest` (400)
- [ ] El formato de respuesta de error es `{"detail": "mensaje legible", "code": "QUIVER_NOT_FOUND"}`. El campo `code` usa SCREAMING_SNAKE_CASE prefijado con `QUIVER_`
- [ ] `QuiverApp` expone una propiedad `router: APIRouter` que es el router principal bajo el que se montan todos los sub-routers
- [ ] `QuiverApp.register()` en esta historia solo almacena la clase en `self._cruds: list` y valida que no haya slugs reservados — lanza `QuiverConfigError` si hay colisión. Lista de slugs reservados definida como constante en `app.py`
- [ ] El método `_validate_on_startup()` se llama automáticamente al instanciar y ejecuta todas las validaciones de configuración


---

### E1-US4

```
id:           E1-US4
título:       Implementar comando CLI para crear superuser inicial
tipo:         backend
complejidad:  S
depende_de:   [E1-US3, E2-US1, E2-US2]
```

**crea:**
```
backend/quiver/
└── cli.py
```

**modifica:**
```
backend/pyproject.toml    ← registra el entry point del comando
```

**contexto:**
El superuser es el primer usuario del sistema y debe crearse antes de poder usar el panel. Por seguridad, no se puede crear desde la UI (ver DP-05 en quiver-mvp-definition.md). El comando CLI es la única vía. Depende de E2-US1 (modelo AdminUser) y E2-US2 (hashing de contraseñas) por lo que se implementa tras ellas aunque pertenezca a E1 cronológicamente en el pipeline — el pipeline procesará E1 completo y estas dependencias se resolverán antes de ejecutar esta historia.

**criterios_funcionales:**
- [ ] `quiver create-superuser` solicita email y contraseña de forma interactiva (con confirmación de contraseña)
- [ ] Si el email ya existe en la DB, muestra aviso y pide confirmación antes de continuar
- [ ] Si la contraseña no cumple el mínimo de 8 caracteres, muestra error y vuelve a pedir
- [ ] Tras crear el superuser, muestra confirmación con el email creado
- [ ] El comando está documentado en el README como paso obligatorio de setup

**criterios_tecnicos:**
- [ ] Implementado con el módulo `click` o equivalente ligero (no typer en MVP para reducir dependencias)
- [ ] Registrado en `pyproject.toml` bajo `[project.scripts]`: `quiver = "quiver.cli:cli"`
- [ ] El comando lee `DATABASE_URL` desde `QuiverConfig` — no acepta la URL como argumento
- [ ] La contraseña se introduce con `getpass` (no visible en terminal)
- [ ] El campo `is_superuser=True` e `is_active=True` se establecen automáticamente
- [ ] El comando hace commit y cierra la sesión correctamente aunque falle a mitad


---

---

## E2 — Autenticación

> Objetivo: sistema completo de autenticación JWT con login, logout, refresco de token, reset de contraseña y la pantalla de login en React. Al completar E2, un superuser puede entrar al sistema.

---

### E2-US1

```
id:           E2-US1
título:       Implementar modelos SQLModel de AdminUser, RefreshToken y PasswordResetToken
tipo:         backend
complejidad:  S
depende_de:   [E1-US2]
```

**crea:**
```
backend/quiver/models/
├── __init__.py
├── admin_user.py
├── token.py
└── mixins.py
```

**modifica:**
```
backend/quiver/__init__.py
backend/quiver/database/migrations/env.py    ← asegurar que detecta los nuevos modelos
```

**contexto:**
Define las tres tablas de infraestructura de autenticación. Los campos exactos están en la Sección 4 del `quiver-mvp-definition.md`. `AdminUser` es la tabla única de todos los usuarios del sistema. `RefreshToken` almacena hashes de tokens de refresco activos y revocados. `PasswordResetToken` almacena tokens de un solo uso para recuperación de contraseña.

**criterios_funcionales:**
- [ ] Ejecutar `alembic revision --autogenerate -m "create_auth_tables"` genera una migración con las tres tablas
- [ ] Ejecutar `alembic upgrade head` crea las tablas en la DB sin errores
- [ ] Los modelos son importables desde `quiver.models`

**criterios_tecnicos:**
- [ ] `AdminUser` hereda de `SQLModel, table=True`. Campos según quiver-mvp-definition.md Sección 4. `id` es UUID generado automáticamente. `created_at` y `updated_at` con `default_factory=datetime.utcnow`. `updated_at` se actualiza en cada escritura via `sa_column_kwargs={"onupdate": datetime.utcnow}`
- [ ] `AdminUser.password_hash` nunca aparece en ningún schema Pydantic de respuesta — garantizado excluyéndolo con `field(exclude=True)` en los schemas de lectura
- [ ] `RefreshToken.token_hash` almacena el SHA-256 del token opaco, no el token en claro
- [ ] `PasswordResetToken.token_hash` igual que refresh_token
- [ ] `mixins.py` define `TimestampMixin` con `created_at` y `updated_at` reutilizable
- [ ] Los índices de DB: `admin_users.email` (unique), `refresh_tokens.token_hash` (index), `refresh_tokens.user_id` (index), `password_reset_tokens.token_hash` (index)


---

### E2-US2

```
id:           E2-US2
título:       Implementar utilidades de hashing de contraseñas y generación de JWT
tipo:         backend
complejidad:  S
depende_de:   [E1-US1]
```

**crea:**
```
backend/quiver/auth/
├── __init__.py
├── password.py
└── jwt.py
```

**contexto:**
Capa de utilidades criptográficas. Sin estado, sin dependencias de DB. `password.py` encapsula bcrypt para no acoplarlo en múltiples sitios. `jwt.py` gestiona la generación y validación de access tokens y la generación de refresh tokens opacos. Los access tokens llevan en el payload: `user_id`, `roles[]`, `permissions[]`, `is_superuser`, `exp`, `jti` (JWT ID único para futura blacklist).

**criterios_funcionales:**
- [ ] `hash_password("texto")` devuelve un hash bcrypt diferente en cada llamada
- [ ] `verify_password("texto", hash)` devuelve True si coinciden, False si no
- [ ] `create_access_token(user)` devuelve un JWT válido que expira en `QUIVER_ACCESS_TOKEN_EXPIRE_MINUTES` (default: 15)
- [ ] `decode_access_token(token)` devuelve el payload si el token es válido, lanza `QuiverUnauthorized` si es inválido o expirado
- [ ] `create_refresh_token()` devuelve un token opaco seguro (32 bytes aleatorios en hex) y su hash SHA-256

**criterios_tecnicos:**
- [ ] `password.py` usa `passlib.context.CryptContext` con `schemes=["bcrypt"]`, `deprecated="auto"`
- [ ] `jwt.py` usa `python-jose` con algoritmo `HS256`
- [ ] El payload del access token incluye exactamente: `sub` (user_id como string), `roles` (list[str]), `permissions` (list[str]), `is_superuser` (bool), `exp` (timestamp), `jti` (uuid4 string)
- [ ] `create_refresh_token()` retorna una tupla `(token_plain: str, token_hash: str)`. El hash se guarda en DB, el plain se envía al cliente
- [ ] El hash del refresh token usa `hashlib.sha256(token.encode()).hexdigest()`
- [ ] `decode_access_token` distingue entre token expirado (`TokenExpiredError`) y token inválido (`TokenInvalidError`), ambas subclases de `QuiverUnauthorized`


---

### E2-US3

```
id:           E2-US3
título:       Implementar AuthService — lógica de negocio de autenticación
tipo:         backend
complejidad:  M
depende_de:   [E2-US1, E2-US2]
```

**crea:**
```
backend/quiver/auth/
├── service.py
└── schemas.py
```

**contexto:**
Capa de servicio que orquesta las operaciones de autenticación. Encapsula toda la lógica de negocio de auth: autenticar usuario, crear sesión, refrescar token, revocar sesión, iniciar y completar el flujo de reset de contraseña. Los endpoints de auth (siguiente historia) serán delegaciones directas a este servicio.

**criterios_funcionales:**
- [ ] `authenticate_user(email, password, db)` devuelve el usuario si las credenciales son válidas
- [ ] `create_session(user, db)` crea un refresh token en DB y devuelve access token + token plain
- [ ] `refresh_session(token_plain, db)` valida el refresh token y devuelve nuevo access token
- [ ] `revoke_session(token_plain, db)` marca el refresh token como revocado
- [ ] `initiate_password_reset(email, db)` crea el token de reset (sin enviar email — eso es responsabilidad del EmailSender)
- [ ] `complete_password_reset(token_plain, new_password, db)` cambia la contraseña y revoca todas las sesiones del usuario

**criterios_tecnicos:**
- [ ] `authenticate_user`: si el usuario no existe, simula la verificación de contraseña igualmente (timing attack mitigation) antes de devolver None
- [ ] `create_session`: al crear el RefreshToken, popula `user_agent` e `ip_address` si se pasan como parámetros opcionales
- [ ] `refresh_session`: verifica que `revoked_at IS NULL` y `expires_at > now()`. Si cualquiera falla lanza `QuiverUnauthorized`
- [ ] `complete_password_reset`: en una transacción única → actualiza password_hash → marca token `used_at` → revoca todos los refresh_tokens del usuario (UPDATE SET revoked_at = now() WHERE user_id = X AND revoked_at IS NULL)
- [ ] `schemas.py` define: `LoginRequest`, `TokenResponse` (`access_token`, `token_type="bearer"`), `MeResponse` (`id`, `email`, `first_name`, `last_name`, `roles[]`, `permissions[]`, `is_superuser`)
- [ ] `MeResponse` nunca incluye `password_hash`


---

### E2-US4

```
id:           E2-US4
título:       Implementar router de autenticación — endpoints HTTP
tipo:         backend
complejidad:  M
depende_de:   [E2-US3, E2-US5, E1-US3]
```

**crea:**
```
backend/quiver/auth/
├── router.py
└── dependencies.py
```

**modifica:**
```
backend/quiver/app.py    ← monta el auth router en QuiverApp
```

**contexto:**
Expone los 6 endpoints de autenticación definidos en la Sección 8 del `quiver-mvp-definition.md`. El router gestiona la cookie del refresh token (HttpOnly, SameSite=Strict). Las dependencias de seguridad (`require_permission`, `require_any_role`, `require_authenticated`) se implementan aquí ya que las usarán todos los demás routers.

**criterios_funcionales:**
- [ ] `POST /auth/login` acepta JSON, devuelve access_token en body y refresh_token en cookie
- [ ] `POST /auth/refresh` lee la cookie automáticamente, devuelve nuevo access_token
- [ ] `POST /auth/logout` revoca el refresh token y vacía la cookie
- [ ] `GET /auth/me` devuelve el usuario actual con roles y permisos
- [ ] `POST /auth/forgot-password` siempre devuelve 200 independientemente de si el email existe
- [ ] `POST /auth/reset-password` valida el token y cambia la contraseña

**criterios_tecnicos:**
- [ ] La cookie del refresh token se configura: `httponly=True`, `samesite="strict"`, `secure=True` solo si `QUIVER_ENV=production`, `max_age=604800` (7 días), `path="/quiver/v1/auth/refresh"` (scope mínimo)
- [ ] `dependencies.py` implementa tres dependencias FastAPI reutilizables:
  - `require_authenticated()` → extrae y valida JWT del header `Authorization: Bearer`. Devuelve payload del token
  - `require_permission(perm: str)` → factory que devuelve una dependency. Verifica que `perm` está en `payload.permissions` o `is_superuser=True`
  - `require_any_role(roles: list[str])` → factory. Verifica intersección con `payload.roles` o `is_superuser=True`
- [ ] El header de autorización usa el formato estándar `Bearer <token>`. Si está ausente → 401. Si es inválido → 401. Si está presente pero sin permisos → 403
- [ ] `POST /auth/forgot-password`: si `EmailSender` no está configurado en `QuiverConfig`, devuelve 503 con `{"detail": "EmailSender not configured. See documentation.", "code": "QUIVER_EMAIL_NOT_CONFIGURED"}`
- [ ] El router se monta en `QuiverApp` bajo `{QUIVER_PREFIX}/auth`


---

### E2-US5

```
id:           E2-US5
título:       Implementar interfaz EmailSender y registro en QuiverConfig
tipo:         backend
complejidad:  XS
depende_de:   [E1-US3]
```

**crea:**
```
backend/quiver/
└── email.py
```

**modifica:**
```
backend/quiver/config.py    ← añade campo email_sender opcional
```

**contexto:**
Interfaz abstracta que desacopla Quiver de cualquier proveedor de email concreto. El developer implementa esta clase en su proyecto para conectar con su servicio (SendGrid, SES, SMTP, etc.). Si no se configura, el endpoint de forgot-password devuelve 503.

**criterios_funcionales:**
- [ ] El developer puede implementar `EmailSender` en su proyecto en < 5 líneas de código
- [ ] Sin EmailSender configurado, el sistema arranca sin errores — solo falla el endpoint concreto

**criterios_tecnicos:**
- [ ] `EmailSender` es una clase abstracta Python (`ABC`) con un único método abstracto: `async send_reset_email(self, to: str, token: str, reset_url: str) -> None`
- [ ] `QuiverConfig.email_sender: Optional[EmailSender] = None`
- [ ] El `reset_url` se construye en el servicio como `{QUIVER_FRONTEND_URL}/auth/reset-password?token={token}`. `QUIVER_FRONTEND_URL` es una nueva variable de entorno en `QuiverConfig`
- [ ] La documentación en el docstring de `EmailSender` incluye un ejemplo de implementación SMTP mínimo


---

### E2-US6

```
id:           E2-US6
título:       Implementar pantalla de login en React con auth store y cliente HTTP
tipo:         frontend
complejidad:  L
depende_de:   [E2-US4, E1-US1]
```

**crea:**
```
frontend/src/
├── store/
│   ├── auth.store.ts
│   └── ui.store.ts
├── api/
│   ├── client.ts
│   └── auth.api.ts
├── hooks/
│   └── useAuth.ts
├── pages/
│   └── auth/
│       ├── LoginPage.tsx
│       └── ForgotPasswordPage.tsx
└── router.tsx             (esqueleto inicial)
```

**modifica:**
```
frontend/src/main.tsx
```

**contexto:**
Primera historia del frontend. Establece la infraestructura base del SPA: el store de auth (Zustand), el cliente HTTP con interceptors JWT, y las dos primeras pantallas. El access token se guarda ÚNICAMENTE en memoria (variable Zustand) — nunca en localStorage ni sessionStorage. El refresh token viaja en cookie HttpOnly gestionada por el servidor. El interceptor de Axios detecta 401s y refresca el token automáticamente.

**criterios_funcionales:**
- [ ] El developer puede navegar a `/auth/login` y hacer login con credenciales válidas
- [ ] Tras login exitoso, el SPA redirige a `/admin` o `/portal` según el campo `redirect_to`
- [ ] Al recargar la página, si hay cookie de refresh válida, el usuario no ve el login
- [ ] El formulario de login muestra errores claros para credenciales incorrectas y cuenta inactiva
- [ ] `/auth/forgot-password` muestra confirmación neutral tras enviar el email

**criterios_tecnicos:**
- [ ] `auth.store.ts` (Zustand): estado `{user, accessToken, permissions[], roles[], isAuthenticated, isLoading}`. Actions: `login(credentials)`, `logout()`, `setAccessToken(token)`, `hydrate()`. `accessToken` es una variable de módulo, NO parte del estado serializable — esto es crítico para que no acabe en herramientas de debugging ni logs
- [ ] `client.ts`: instancia Axios con `baseURL` leída de `import.meta.env.VITE_API_BASE_URL`. Interceptor de request: añade `Authorization: Bearer {accessToken}`. Interceptor de response: si 401 → llama `POST /auth/refresh` → si éxito, reintenta la request original con nuevo token → si falla, llama `auth.store.logout()` y redirige a `/auth/login`. Implementar el patrón de cola para evitar múltiples refreshes simultáneos
- [ ] `auth.api.ts` tipado con los schemas exactos de E2-US3
- [ ] `hydrate()`: al montar el SPA, llama `POST /auth/refresh`. Si éxito → setea usuario y token. Si falla → no hace nada (el router redirigirá a login)
- [ ] `LoginPage.tsx`: implementar exactamente la especificación de SCREEN-01 de `quiver-design-spec.md`. Colores y estilos según el sistema de diseño del mismo documento
- [ ] `ForgotPasswordPage.tsx`: implementar SCREEN-02 de `quiver-design-spec.md`
- [ ] `router.tsx` inicial: solo AuthLayout con LoginPage y ForgotPasswordPage. Se expandirá en E7


---

### E2-US7

```
id:           E2-US7
título:       Implementar pantalla de reset de contraseña en React
tipo:         frontend
complejidad:  S
depende_de:   [E2-US6]
```

**crea:**
```
frontend/src/pages/auth/
└── ResetPasswordPage.tsx
```

**modifica:**
```
frontend/src/router.tsx    ← añade ruta /auth/reset-password
```

**contexto:**
Tercera pantalla del flujo de auth. El usuario llega desde un link en su email con un token en la query string. El componente extrae el token, muestra el formulario, y gestiona todos los estados: token válido, inválido, expirado, ya usado, y éxito.

**criterios_funcionales:**
- [ ] El formulario pide nueva contraseña y confirmación
- [ ] Si el token es inválido o expirado, muestra error con link a `/auth/forgot-password`
- [ ] Si las contraseñas no coinciden, muestra error antes de enviar
- [ ] Tras éxito, informa que se han cerrado todas las sesiones y redirige al login

**criterios_tecnicos:**
- [ ] Implementar SCREEN-03 de `quiver-design-spec.md`
- [ ] El token se extrae de `useSearchParams()` de React Router
- [ ] Si no hay token en la URL, redirige directamente a `/auth/login`
- [ ] El estado del componente gestiona: `idle`, `validating`, `valid`, `invalid`, `expired`, `used`, `submitting`, `success`
- [ ] La respuesta del backend distingue entre token inválido (400) y token expirado (400 con código diferente) — el frontend muestra mensajes distintos


---

---

## E3 — Roles y permisos

> Objetivo: sistema RBAC completo con modelos, sincronización de permisos, dependencias de seguridad reutilizables, y pantallas de gestión de roles en el admin.

---

### E3-US1

```
id:           E3-US1
título:       Implementar modelos SQLModel de Role, Permission y tablas pivot
tipo:         backend
complejidad:  S
depende_de:   [E2-US1]
```

**crea:**
```
backend/quiver/models/
├── role.py
├── permission.py
└── associations.py
```

**modifica:**
```
backend/quiver/models/admin_user.py    ← añade relación con roles
backend/quiver/models/__init__.py
```

**contexto:**
Modelos de datos para el sistema RBAC. Cuatro tablas: `roles`, `permissions`, `role_has_permissions` (pivot), `user_has_roles` (pivot con `assigned_at`). Los permisos se definen en código Python — esta tabla es un espejo sincronizado de los permisos registrados en el arranque.

**criterios_funcionales:**
- [ ] La migración crea las 4 tablas nuevas con sus índices y foreign keys
- [ ] `AdminUser` tiene una relación `roles: list[Role]` accesible via ORM

**criterios_tecnicos:**
- [ ] `Role`: campos `id` (UUID PK), `name` (string unique, index), `display_name` (string), `description` (string nullable), `created_at` (datetime)
- [ ] `Permission`: campos `id` (UUID PK), `name` (string unique, index), `display_name` (string), `group` (string, index)
- [ ] `associations.py` define las dos tablas pivot como `SQLModel` con `table=True` sin clase Python propia (tabla pura). `user_has_roles` incluye `assigned_at: datetime`
- [ ] Las relaciones se definen usando `Relationship` de SQLModel con `link_model`
- [ ] La validación de `Role.name` en el modelo: slug (lowercase, sin espacios, sin caracteres especiales) — validator Pydantic que lanza error si no cumple el patrón `^[a-z0-9_]+$`
- [ ] La validación de `Permission.name`: patrón `^[a-z0-9_]+\.[a-z0-9_]+$` (exactamente un punto)


---

### E3-US2

```
id:           E3-US2
título:       Implementar sincronización de permisos y función quiver_permission
tipo:         backend
complejidad:  S
depende_de:   [E3-US1, E1-US3]
```

**crea:**
```
backend/quiver/rbac/
├── __init__.py
├── registry.py
└── sync.py
```

**modifica:**
```
backend/quiver/app.py    ← llama a sync_permissions en el startup de QuiverApp
```

**contexto:**
Los permisos se declaran en código Python y se sincronizan automáticamente a la tabla `permissions` en cada arranque. La función `quiver_permission()` registra un permiso en el registry en memoria. `sync_permissions()` reconcilia el registry con la DB (upsert). Los permisos eliminados del código NO se borran de la DB.

**criterios_funcionales:**
- [ ] `quiver_permission("products.list", group="Productos", display_name="Listar productos")` registra el permiso
- [ ] Al arrancar la app, los permisos registrados aparecen en la tabla `permissions`
- [ ] Si un permiso ya existe en DB, solo actualiza `display_name` y `group` (no recrea el registro)
- [ ] Los permisos generados por el CRUD engine (E5) usan el mismo mecanismo

**criterios_tecnicos:**
- [ ] `registry.py` mantiene `_PERMISSION_REGISTRY: dict[str, PermissionDefinition]` como singleton de módulo. `PermissionDefinition` es un dataclass con `name`, `display_name`, `group`
- [ ] `quiver_permission()` valida el formato del nombre antes de registrar — lanza `QuiverConfigError` si no cumple el patrón
- [ ] `sync.py` implementa `sync_permissions(db: Session)`: upsert de todos los permisos del registry. Usa `INSERT ... ON CONFLICT DO UPDATE` para PostgreSQL o equivalente SQLAlchemy
- [ ] `sync_permissions` se ejecuta en el evento `startup` de FastAPI registrado en `QuiverApp.__init__`
- [ ] Los permisos built-in de Quiver (users.list, users.create, etc.) se registran automáticamente en `quiver/rbac/__init__.py` al importar el módulo


---

### E3-US3

```
id:           E3-US3
título:       Implementar RBACService y endpoints de gestión de roles
tipo:         backend
complejidad:  M
depende_de:   [E3-US2, E2-US4]
```

**crea:**
```
backend/quiver/rbac/
├── service.py
├── schemas.py
└── router.py
```

**modifica:**
```
backend/quiver/app.py    ← monta el rbac router
```

**contexto:**
Capa de servicio RBAC y sus endpoints HTTP. Gestiona la asignación de roles a usuarios y permisos a roles. Los endpoints de roles son la interfaz de administración del sistema de control de acceso.

**criterios_funcionales:**
- [ ] `GET /admin/roles` devuelve todos los roles con conteo de permisos y usuarios
- [ ] `POST /admin/roles` crea un nuevo rol
- [ ] `PUT /admin/roles/{id}` actualiza display_name y description (name es inmutable)
- [ ] `DELETE /admin/roles/{id}` elimina el rol y desvincula usuarios
- [ ] `GET /admin/permissions` devuelve permisos agrupados por group
- [ ] `PUT /admin/roles/{id}/permissions` replace-all de permisos de un rol

**criterios_tecnicos:**
- [ ] `RBACService` métodos: `get_user_permissions(user_id, db) -> list[str]` (nombres planos), `assign_roles_to_user(user_id, role_ids, db)`, `get_roles_with_stats(db)`, `replace_role_permissions(role_id, permission_ids, db)`
- [ ] `get_user_permissions` devuelve la unión de todos los permisos de todos los roles del usuario — sin duplicados
- [ ] Todos los endpoints requieren permiso `roles.list` o `roles.update` según corresponda (usando `require_permission` de E2-US4)
- [ ] `DELETE /admin/roles/{id}`: si es el único rol con acceso al área admin, lanza `QuiverBadRequest` con mensaje explicativo
- [ ] `schemas.py`: `RoleCreate`, `RoleUpdate`, `RoleResponse` (con `permissions_count`, `users_count`), `PermissionGroupResponse` (con `group`, `permissions: list[PermissionResponse]`), `RolePermissionsUpdate` (con `permission_ids: list[UUID]`)
- [ ] `replace_role_permissions` es atómica: DELETE todos los permisos del rol → INSERT los nuevos en una transacción


---

### E3-US4

```
id:           E3-US4
título:       Implementar pantallas de gestión de roles en React
tipo:         frontend
complejidad:  M
depende_de:   [E3-US3, E7-US1]
```

**crea:**
```
frontend/src/pages/roles/
├── RolesPage.tsx
└── RoleEditPage.tsx
frontend/src/api/
└── roles.api.ts
```

**modifica:**
```
frontend/src/router.tsx    ← añade rutas /admin/roles y /admin/roles/:id/edit
```

**contexto:**
Dos pantallas del área admin: listado de roles y edición de rol con matriz de permisos. La matriz de permisos es el componente más complejo: agrupa permisos por `group`, permite selección individual y selección de grupo completo, y guarda con operación replace-all.

**criterios_funcionales:**
- [ ] `RolesPage` muestra la tabla de roles según SCREEN-12 de `quiver-design-spec.md`
- [ ] `RoleEditPage` muestra el formulario y la matriz de checkboxes según SCREEN-13
- [ ] Los checkboxes marcados se precargan con los permisos actuales del rol
- [ ] "Seleccionar todos" de un grupo selecciona/deselecciona todos los permisos de ese grupo
- [ ] Guardar envía el array completo de IDs seleccionados y muestra toast de éxito

**criterios_tecnicos:**
- [ ] La matriz de permisos se construye a partir de `GET /admin/permissions` (agrupados por group)
- [ ] El estado de la matriz es `Map<permissionId, boolean>` — inicializado con los permisos actuales del rol
- [ ] Implementar según SCREEN-12 y SCREEN-13 de `quiver-design-spec.md` (colores, tipografía, layout)
- [ ] La nota "los cambios pueden tardar hasta 15 minutos" aparece como tooltip o texto informativo junto al botón guardar
- [ ] `<Can do="roles.update">` envuelve el botón de guardar y los checkboxes


---

---

## E4 — Gestión de usuarios

> Objetivo: CRUD completo de admin_users accesible desde el panel. Al completar E4, el admin puede gestionar todos los usuarios del sistema.

---

### E4-US1

```
id:           E4-US1
título:       Implementar endpoints built-in de gestión de admin_users
tipo:         backend
complejidad:  M
depende_de:   [E3-US3, E2-US4]
```

**crea:**
```
backend/quiver/users/
├── __init__.py
├── service.py
├── schemas.py
└── router.py
```

**modifica:**
```
backend/quiver/app.py    ← monta el users router
```

**contexto:**
Endpoints de gestión de usuarios del sistema. Diferente al CRUD engine genérico (E5) porque tiene lógica específica: hashear contraseñas, asignar roles en la misma operación, soft-disable en lugar de delete, y reglas de auto-protección.

**criterios_funcionales:**
- [ ] Los 5 endpoints de la Sección 8 del quiver-mvp-definition.md están implementados
- [ ] Crear usuario con roles en la misma request
- [ ] Desactivar usuario revoca todos sus refresh tokens activos
- [ ] Un admin no puede desactivarse ni quitarse el rol admin a sí mismo

**criterios_tecnicos:**
- [ ] `UserService.create_user`: hashea password, crea usuario, asigna roles — en una transacción
- [ ] `UserService.deactivate_user`: SET `is_active=False` + revoca todos los `refresh_tokens` del usuario en una transacción
- [ ] `UserService.update_user`: si se pasa `password` en el body → hashear y actualizar. Si no se pasa → no modificar
- [ ] Reglas de auto-protección verificadas en el servicio (no solo en el frontend): si `current_user.id == target_user.id` y la operación es deactivate o remove-admin-role → `QuiverForbidden`
- [ ] `schemas.py`: `UserCreate` (con `password: str` requerido, `roles: list[UUID]` opcional), `UserUpdate` (todo opcional incluyendo `password`), `UserResponse` (sin `password_hash`, con `roles: list[RoleResponse]`), `UserListResponse`


---

### E4-US2

```
id:           E4-US2
título:       Implementar pantallas de gestión de usuarios en React
tipo:         frontend
complejidad:  M
depende_de:   [E4-US1, E7-US1]
```

**crea:**
```
frontend/src/pages/users/
├── UsersPage.tsx
├── UserCreateEditPage.tsx
└── UserDetailPage.tsx
frontend/src/api/
└── users.api.ts
```

**modifica:**
```
frontend/src/router.tsx
```

**contexto:**
Tres pantallas para la gestión completa de usuarios: listado, crear/editar, y detalle. Implementan las especificaciones SCREEN-09, SCREEN-10 y SCREEN-11 de `quiver-design-spec.md`. El listado usa el componente `DataTable` del CRUD engine (implementado en E5) — si E5 no está completo, usar una tabla básica provisional.

**criterios_funcionales:**
- [ ] El listado muestra avatar con iniciales, nombre, email, badges de roles, estado y último acceso
- [ ] El formulario de crear/editar tiene el selector de roles como tags removibles
- [ ] La pantalla de detalle muestra toda la información del usuario con los botones de acción

**criterios_tecnicos:**
- [ ] Implementar SCREEN-09, SCREEN-10, SCREEN-11 de `quiver-design-spec.md`
- [ ] El avatar con iniciales: tomar primera letra de `first_name` y primera de `last_name`, fondo `brand-50`, texto `brand-700`
- [ ] El selector de roles: `GET /admin/roles` para cargar las opciones. Mostrar como tags removibles con dropdown para añadir
- [ ] La acción "Desactivar" usa el componente Modal de confirmación (SCREEN-20)
- [ ] `<Can do="users.create">`, `<Can do="users.update">`, `<Can do="users.delete">` envuelven las acciones correspondientes


---

---

## E5 — CRUD Engine

> Objetivo: el corazón del framework. Al completar E5, el developer puede generar un módulo admin completo para cualquier modelo SQLModel con mínima configuración.

---

### E5-US1

```
id:           E5-US1
título:       Implementar clase base QuiverCRUD con declaración y validación
tipo:         backend
complejidad:  M
depende_de:   [E3-US2, E1-US3]
```

**crea:**
```
backend/quiver/crud/
├── __init__.py
├── base.py
├── columns.py
└── fields/
    ├── __init__.py
    ├── base.py
    ├── text.py
    ├── select.py
    ├── date.py
    └── misc.py
```

**contexto:**
La clase `QuiverCRUD` que el developer extiende. Define el contrato de declaración (model, route, columns/exclude_columns, fields/exclude_fields, etc.) y la lógica de introspección del modelo SQLModel para auto-generar columnas y fields cuando no se declaran explícitamente.

**criterios_funcionales:**
- [ ] `class ProductCRUD(QuiverCRUD): model = Product; route = "products"` es válido y completo
- [ ] Sin declarar `columns`, se usan todos los campos del modelo
- [ ] Con `exclude_columns`, se usan todos menos los excluidos
- [ ] Los campos `id`, `created_at`, `updated_at` se excluyen de `fields` por defecto (no de `columns`)
- [ ] Si el `route` colisiona con slugs reservados, `QuiverApp.register()` lanza error

**criterios_tecnicos:**
- [ ] `QuiverCRUD` es una clase Python (no ABCMeta) con metaclass que detecta la declaración de atributos de clase
- [ ] La introspección de modelos SQLModel usa `model.__fields__` o `model.model_fields` (Pydantic v2) para obtener los campos y sus tipos
- [ ] El mapeo de tipo Python → tipo de columna/field: `str → text`, `int/float → number`, `bool → boolean`, `datetime → datetime`, `date → date`, `UUID → hidden`, `Enum → select`
- [ ] Los tipos de columna definidos en `columns.py`: `Column(key, label, col_type, sortable, badge_map)`
- [ ] Los tipos de campo en `fields/`: cada clase hereda de `QuiverField` que define `key`, `label`, `required`, `help_text`, `read_only`, `default`
- [ ] `QuiverCRUD._get_effective_columns()` y `_get_effective_fields()` son métodos internos que resuelven el modo de declaración (explícito / exclude / auto)
- [ ] Los permisos se auto-registran en el RBAC registry: si `permissions = "products"` → registra `products.list`, `products.create`, `products.show`, `products.update`, `products.delete`


---

### E5-US2

```
id:           E5-US2
título:       Implementar router_factory — generación automática de endpoints CRUD
tipo:         backend
complejidad:  L
depende_de:   [E5-US1, E2-US4]
```

**crea:**
```
backend/quiver/crud/
├── router_factory.py
├── schema_factory.py
└── filters.py
```

**modifica:**
```
backend/quiver/app.py    ← register() ahora genera y monta routers
backend/quiver/crud/base.py    ← añade hooks vacíos
```

**contexto:**
Dado un `QuiverCRUD`, genera un `APIRouter` FastAPI con los 7 endpoints estándar. Los endpoints aplican automáticamente los permisos correctos. Los schemas de request/response se generan dinámicamente a partir de la declaración de `fields`. Los hooks de ciclo de vida (`before_create`, `after_create`, etc.) se llaman en los puntos correctos.

**criterios_funcionales:**
- [ ] Un CRUD registrado genera 7 endpoints funcionales sin código adicional
- [ ] Los permisos se aplican automáticamente en cada endpoint
- [ ] Los hooks se llaman en el orden correcto
- [ ] La paginación, búsqueda, filtros y ordenación funcionan en el listado

**criterios_tecnicos:**
- [ ] `router_factory.py` expone `create_crud_router(crud_class: type[QuiverCRUD]) -> APIRouter`
- [ ] El endpoint de listado acepta: `?page` (default 1), `?page_size` (default del CRUD), `?search` (aplica ILIKE sobre `search_fields`), `?order_by` y `?order_dir` (asc/desc), más un query param por cada filtro declarado
- [ ] La búsqueda usa `OR` entre todos los `search_fields`
- [ ] `schema_factory.py` genera dinámicamente: `{Resource}CreateSchema` (campos requeridos/opcionales según field.required), `{Resource}UpdateSchema` (todos opcionales), `{Resource}ReadSchema` (todos los campos menos password)
- [ ] Los campos `PasswordField` NUNCA aparecen en `ReadSchema` ni en las respuestas GET
- [ ] Los hooks se implementan con `await` — son todos `async def` en `QuiverCRUD` con implementación vacía por defecto
- [ ] El endpoint de choices `GET /{resource}/choices` se genera automáticamente si algún `SelectField` de cualquier CRUD lo referencia
- [ ] `filters.py`: `TextFilter`, `SelectFilter`, `BooleanFilter`, `DateRangeFilter` — cada uno implementa `apply(query, value) -> query`
- [ ] `QuiverApp.register()` ahora llama a `create_crud_router()` y monta el router resultante


---

### E5-US3

```
id:           E5-US3
título:       Implementar endpoint /config y contrato de configuración del CRUD
tipo:         backend
complejidad:  S
depende_de:   [E5-US2]
```

**modifica:**
```
backend/quiver/crud/router_factory.py    ← añade el endpoint /config
```

**contexto:**
El endpoint `GET /admin/{resource}/config` es el mecanismo por el que el frontend React sabe cómo renderizarse para un recurso dado. Devuelve la configuración completa: columnas, fields, filtros, permisos del usuario actual, y metadatos del CRUD. Es la pieza que hace que el frontend sea genérico.

**criterios_funcionales:**
- [ ] `GET /admin/products/config` devuelve la estructura JSON completa del CRUD de productos
- [ ] El campo `permissions` refleja los permisos del usuario actual (no los globales del CRUD)
- [ ] El endpoint requiere el permiso `{resource}.list`

**criterios_tecnicos:**
- [ ] La respuesta sigue exactamente el contrato definido en la Sección 9 de `quiver-mvp-definition.md`
- [ ] El campo `permissions` se construye verificando cada permiso del CRUD contra los permisos del usuario actual: `{"list": true, "create": false, ...}`
- [ ] Las columnas incluyen: `key`, `label`, `type`, `sortable` y opcionalmente `badge_map`
- [ ] Los fields incluyen: `key`, `label`, `type`, `required`, `help_text`, `read_only`, `default`, y para SelectField: `choices_endpoint` (URL del endpoint de choices)
- [ ] Los filtros incluyen: `key`, `label`, `type`, y para SelectFilter: `choices` (array estático)
- [ ] La respuesta es cacheable en el frontend — no cambia entre requests del mismo usuario si no cambian los permisos


---

### E5-US4

```
id:           E5-US4
título:       Implementar componentes de tabla, filtros y paginación en React
tipo:         frontend
complejidad:  L
depende_de:   [E5-US3, E7-US1]
```

**crea:**
```
frontend/src/components/crud/
├── DataTable.tsx
├── Filters.tsx
├── BulkActions.tsx
└── Pagination.tsx
frontend/src/components/ui/
├── Badge.tsx
├── Modal.tsx
├── Button.tsx
└── Toast.tsx
frontend/src/api/
└── crud.api.ts
frontend/src/hooks/
└── useCrud.ts
```

**contexto:**
Los componentes base del CRUD engine en el frontend. `DataTable` es el componente central: tabla configurable que acepta las columnas del `/config` y los datos del listado. Los demás componentes dan soporte a la tabla. `useCrud` encapsula TanStack Query para el fetching con caché.

**criterios_funcionales:**
- [ ] `DataTable` renderiza columnas tipadas (text, badge, date, boolean, currency, link, actions)
- [ ] Hacer clic en columna sortable → reordena la tabla
- [ ] Seleccionar filas → muestra `BulkActions` con contador
- [ ] `Filters` se expande/colapsa y aplica filtros sobre la tabla
- [ ] `Pagination` navega entre páginas manteniendo filtros y orden

**criterios_tecnicos:**
- [ ] `DataTable` acepta: `columns: ColumnConfig[]`, `data: Record<string, any>[]`, `onSort`, `onSelect`, `isLoading`. Cuando `isLoading=true` muestra 8 filas de skeleton
- [ ] El skeleton de carga usa `gray-100` con animación pulse CSS
- [ ] `Badge` acepta: `value`, `color` (green, red, gray, amber, blue). Colores según `quiver-design-spec.md`
- [ ] `useCrud(resource)` devuelve `{list, create, update, remove, config}` basados en TanStack Query. `list` acepta params de paginación/filtro/orden
- [ ] `crud.api.ts` implementa la API genérica: `list(resource, params)`, `create(resource, data)`, `update(resource, id, data)`, `remove(resource, id)`, `bulkRemove(resource, ids)`, `getConfig(resource)`
- [ ] `Modal` para confirmación de borrado implementa SCREEN-20 de `quiver-design-spec.md`
- [ ] `Toast` implementa el sistema de notificaciones de la Sección 4 de `quiver-design-spec.md`
- [ ] Todos los componentes implementan los estilos según `quiver-design-spec.md`


---

### E5-US5

```
id:           E5-US5
título:       Implementar páginas genéricas del CRUD engine en React (List, Create, Edit, Show)
tipo:         frontend
complejidad:  L
depende_de:   [E5-US4]
```

**crea:**
```
frontend/src/pages/crud/
├── ListPage.tsx
├── CreatePage.tsx
├── EditPage.tsx
└── ShowPage.tsx
frontend/src/components/fields/
├── TextField.tsx
├── SelectField.tsx
├── DateField.tsx
├── CheckboxField.tsx
├── NumberField.tsx
├── TextareaField.tsx
├── HiddenField.tsx
└── index.ts         ← FieldRegistry
```

**modifica:**
```
frontend/src/router.tsx    ← añade rutas /admin/:resource, /admin/:resource/new, etc.
```

**contexto:**
Las cuatro páginas genéricas que el CRUD engine usa para cualquier recurso. Cada página carga `GET /admin/:resource/config` para saber qué renderizar, luego llama los endpoints correspondientes. El formulario dinámico usa el `FieldRegistry` para instanciar el componente de campo correcto según el `type` devuelto por `/config`.

**criterios_funcionales:**
- [ ] Navegar a `/admin/products` → lista de productos con tabla, filtros y paginación
- [ ] Navegar a `/admin/products/new` → formulario de creación con los fields configurados
- [ ] Navegar a `/admin/products/{id}/edit` → formulario con valores pre-rellenados
- [ ] Navegar a `/admin/products/{id}` → vista de detalle en modo lectura
- [ ] El tipo de campo correcto se renderiza para cada field del CRUD

**criterios_tecnicos:**
- [ ] `ListPage` carga el config con TanStack Query (caché de 5 minutos). Pasa las columnas a `DataTable` y los filtros a `Filters`. La URL refleja el estado de paginación/filtros para navegación con botón atrás
- [ ] `CreatePage` y `EditPage` comparten el componente `CrudForm` con prop `mode`. `EditPage` precarga `GET /{resource}/{id}` para los valores iniciales
- [ ] `FieldRegistry` en `index.ts` es un `Map<string, React.ComponentType>`. Los tipos registrados: `text`, `email`, `password`, `number`, `textarea`, `select`, `select_multiple`, `checkbox`, `date`, `datetime`, `hidden`
- [ ] `SelectField` con `choices_endpoint` hace `GET` al endpoint de choices y muestra las opciones. Carga lazy al abrir el select
- [ ] `ShowPage` renderiza todos los fields en modo lectura usando el mismo `FieldRegistry` con prop `readOnly`. Implementa SCREEN-08 de `quiver-design-spec.md`
- [ ] Si el recurso no existe (404 del backend) → muestra mensaje de error con botón volver al listado


---

---

## E6 — Dashboard

> Objetivo: pantalla de inicio del admin con widgets configurables. Al completar E6, el admin ve métricas en tiempo real al entrar al panel.

---

### E6-US1

```
id:           E6-US1
título:       Implementar sistema de widgets, StatCardWidget y endpoint de dashboard
tipo:         backend
complejidad:  M
depende_de:   [E3-US2, E2-US4]
```

**crea:**
```
backend/quiver/dashboard/
├── __init__.py
├── base.py
├── registry.py
├── widgets/
│   ├── stat_card.py
│   └── chart.py
└── router.py
```

**modifica:**
```
backend/quiver/app.py
```

**contexto:**
Motor de widgets del dashboard. El developer registra widgets en su proyecto; el endpoint `GET /admin/dashboard` los ejecuta, filtra por permisos, y devuelve los datos. Cada widget define su propio método `fetch_data(db, user)` que se llama en el momento de la request.

**criterios_funcionales:**
- [ ] `StatCardWidget("Usuarios", model=AdminUser, permission="users.list")` devuelve el conteo
- [ ] `ChartWidget` acepta una función Python que devuelve datos y los serializa para Recharts
- [ ] El endpoint solo devuelve widgets para los que el usuario tiene el permiso requerido
- [ ] Sin widgets configurados, el endpoint devuelve array vacío sin error

**criterios_tecnicos:**
- [ ] `QuiverWidget` base: `title: str`, `component: str`, `permission: Optional[str]`, método abstracto `async fetch_data(db, user) -> dict`
- [ ] `registry.py`: `_WIDGET_REGISTRY: list[QuiverWidget]` singleton. Función `register_widget(widget: QuiverWidget)` para añadir widgets
- [ ] `StatCardWidget.fetch_data` ejecuta `SELECT COUNT(*) FROM {model.__tablename__}` con filtro opcional
- [ ] `ChartWidget.fetch_data` llama a una función `data_fn: Callable[[Session], list[dict]]` provista por el developer
- [ ] La respuesta de `GET /admin/dashboard` es `[{type, title, component, data: {...}}]`
- [ ] Los widgets se ejecutan en paralelo con `asyncio.gather` para reducir latencia total
- [ ] `QuiverApp` expone `quiver.register_widget(widget)` como API pública


---

### E6-US2

```
id:           E6-US2
título:       Implementar DashboardPage y componentes de widgets en React
tipo:         frontend
complejidad:  M
depende_de:   [E6-US1, E7-US1]
```

**crea:**
```
frontend/src/pages/dashboard/
└── DashboardPage.tsx
frontend/src/components/dashboard/
├── StatCard.tsx
├── ChartWidget.tsx
└── WidgetGrid.tsx
```

**contexto:**
La pantalla de inicio del área admin. Carga `GET /admin/dashboard` y renderiza cada widget usando un `WidgetRegistry` que mapea `component: string` al componente React correspondiente. El layout es un grid responsive.

**criterios_funcionales:**
- [ ] Al entrar a `/admin`, se cargan y muestran los widgets configurados
- [ ] Los contadores de StatCard muestran números reales de la DB
- [ ] Los gráficos de ChartWidget se renderizan con Recharts
- [ ] Sin widgets configurados, muestra un estado vacío informativo

**criterios_tecnicos:**
- [ ] Implementar SCREEN-04 de `quiver-design-spec.md`
- [ ] `WidgetRegistry` es un `Map<string, React.ComponentType<{data: any, title: string}>>` — análogo al FieldRegistry
- [ ] `StatCard` implementa la anatomía exacta de SCREEN-04 (icono, número grande, título, variación opcional)
- [ ] `ChartWidget` usa `LineChart` o `BarChart` de Recharts con el color `brand-500` como color primario
- [ ] El grid: `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` — adapta el número de columnas al ancho
- [ ] Estado de carga: skeleton de cards mientras llega la respuesta


---

---

## E7 — Layouts y navegación

> Objetivo: los tres layouts funcionales (Admin, Auth, User), el menú lateral dinámico y el sistema de guardas de ruta. Al completar E7, la navegación del SPA está completa.

---

### E7-US1

```
id:           E7-US1
título:       Implementar AdminLayout, AuthLayout y sistema de guards de ruta
tipo:         frontend
complejidad:  L
depende_de:   [E2-US6]
```

**crea:**
```
frontend/src/layout/
├── AdminLayout.tsx
├── AuthLayout.tsx
└── Topbar.tsx
frontend/src/guards/
├── RequireAuth.tsx
└── RequireRole.tsx
frontend/src/pages/errors/
└── ForbiddenPage.tsx
```

**modifica:**
```
frontend/src/router.tsx    ← estructura completa con tres zonas
```

**contexto:**
Los layouts son los contenedores visuales de todas las páginas del SPA. `AdminLayout` incluye el sidebar (implementado en E7-US2) y el topbar. Los guards controlan el acceso: `RequireAuth` redirige a login si no autenticado, `RequireRole` redirige a 403 si no tiene el rol. La estructura del router define las tres zonas anidadas.

**criterios_funcionales:**
- [ ] Las rutas del admin solo son accesibles para usuarios con rol `admin`
- [ ] Las rutas del portal solo son accesibles para usuarios en `QUIVER_PORTAL_ROLES`
- [ ] Un usuario no autenticado que intenta acceder a cualquier ruta protegida → va al login
- [ ] Un usuario autenticado sin el rol correcto → ve la página 403

**criterios_tecnicos:**
- [ ] `AdminLayout`: sidebar (240px) + topbar (56px) + outlet. Implementar la anatomía de la Sección 2.2 de `quiver-design-spec.md`. Sidebar colapsable a 56px en tablet
- [ ] `AuthLayout`: card centrada, fondo `gray-50`. Implementar la Sección 2.1 de `quiver-design-spec.md`
- [ ] `RequireAuth`: si `!isAuthenticated && !isLoading` → redirige a `/auth/login` preservando `?redirect=/ruta/original`
- [ ] `RequireRole`: acepta `roles: string[]`. Si el usuario no tiene ninguno de los roles Y no es superuser → redirige a `/403`
- [ ] `RequireRole` siempre permite el paso si `is_superuser=true`
- [ ] `ForbiddenPage`: implementar SCREEN-18 de `quiver-design-spec.md`. El botón "volver al inicio" lleva a `/admin` si tiene rol admin, a `/portal` si no
- [ ] `router.tsx` completo: zona auth (sin guard) → zona admin (RequireRole=["admin"]) → zona portal (RequireRole=PORTAL_ROLES). Los PORTAL_ROLES se leen de `import.meta.env.VITE_PORTAL_ROLES` (comma-separated)


---

### E7-US2

```
id:           E7-US2
título:       Implementar sistema de menú dinámico — backend y sidebar React
tipo:         fullstack
complejidad:  M
depende_de:   [E7-US1, E3-US3]
```

**crea:**
```
backend/quiver/menu/
├── __init__.py
├── builder.py
├── schemas.py
└── router.py
frontend/src/layout/
└── Sidebar.tsx
frontend/src/store/
└── menu.store.ts
frontend/src/api/
└── menu.api.ts
```

**contexto:**
El menú lateral del admin es dinámico: el developer define su estructura en Python y el backend filtra los items según los permisos del usuario antes de devolver la lista. El sidebar React lo renderiza con grupos colapsables y resalta el item activo.

**criterios_funcionales:**
- [ ] El developer define el menú con `QUIVER_MENU = [MenuGroup(...), MenuItem(...)]` en su config
- [ ] Los items para los que el usuario no tiene permiso no aparecen en la respuesta
- [ ] El sidebar muestra exactamente lo que devuelve el backend
- [ ] El item de la ruta activa está resaltado visualmente

**criterios_tecnicos:**
- [ ] `MenuBuilder.build(menu_config, user_permissions, is_superuser) -> list[MenuGroup]`: filtra items. Si `is_superuser=True` devuelve todo sin filtrar
- [ ] Si un grupo queda sin items tras el filtrado, el grupo tampoco aparece
- [ ] `schemas.py`: `MenuItem(label, route, permission, icon)`, `MenuGroup(title, icon, items)`
- [ ] El endpoint `GET /admin/menu` requiere `require_authenticated()`. La respuesta es la lista de grupos filtrada
- [ ] `Sidebar.tsx` implementa exactamente la anatomía de la Sección 2.2 de `quiver-design-spec.md`: item activo con fondo `brand-50` y borde izquierdo `3px solid brand-500`, hover con fondo `gray-100`
- [ ] `menu.store.ts` (Zustand): `{items, isLoaded}`. Action `fetchMenu()` que llama al endpoint. Se llama tras login exitoso
- [ ] Los grupos son colapsables — el estado abierto/cerrado se persiste en `localStorage` para recordar la preferencia


---

### E7-US3

```
id:           E7-US3
título:       Implementar UserLayout base para el portal
tipo:         frontend
complejidad:  S
depende_de:   [E7-US1]
```

**crea:**
```
frontend/src/layout/
└── UserLayout.tsx
```

**contexto:**
El layout base del portal de usuario. A diferencia del AdminLayout, este es territorio del developer — se proporciona como punto de partida funcional pero está diseñado para ser modificado. Incluye navbar, área de contenido y footer. El link "Panel de admin" se muestra solo para usuarios con rol admin.

**criterios_funcionales:**
- [ ] Las rutas del portal usan `UserLayout` como contenedor visual
- [ ] El link "Panel de admin" es visible solo para usuarios con rol `admin`
- [ ] El `AdminLayout` incluye el link "Ver portal" para usuarios en `QUIVER_PORTAL_ROLES`

**criterios_tecnicos:**
- [ ] Implementar la Sección 2.3 de `quiver-design-spec.md` como punto de partida
- [ ] El componente está marcado con comentario `// CUSTOMIZE: edit this layout for your project`
- [ ] El link "Panel de admin" usa `<HasRole roles={["admin"]}>` (implementado en E10-US1)
- [ ] El link "Ver portal" en AdminLayout usa `<HasRole roles={PORTAL_ROLES}>`
- [ ] `UserLayout` incluye el nombre del usuario y botón de logout en la navbar


---

---

## E8 — Páginas custom

> Objetivo: el developer puede registrar páginas React propias en el admin y el portal usando `@quiver_page`, integradas con el sistema de auth, permisos y layout.

---

### E8-US1

```
id:           E8-US1
título:       Implementar PageRegistry, decorador @quiver_page y endpoints de páginas
tipo:         backend
complejidad:  S
depende_de:   [E3-US2, E2-US4]
```

**crea:**
```
backend/quiver/pages/
├── __init__.py
├── registry.py
└── router.py
```

**modifica:**
```
backend/quiver/app.py
backend/quiver/__init__.py    ← expone quiver_page y QuiverPage en la API pública
```

**contexto:**
Permite al developer registrar páginas React propias que usan el sistema de auth y layout de Quiver. El decorador `@quiver_page` registra la página con su ruta, layout, permiso o roles requeridos, y el nombre del componente React. Los endpoints devuelven esta configuración al frontend para crear las rutas dinámicamente.

**criterios_funcionales:**
- [ ] `@quiver_page(route="/admin/reportes", layout="admin", permission="reports.view", title="Reportes", component="ReportsPage")` registra la página
- [ ] `GET /admin/pages` devuelve solo las páginas admin para las que el usuario tiene permiso
- [ ] `GET /portal/pages` devuelve solo las páginas portal para las que el usuario tiene el rol

**criterios_tecnicos:**
- [ ] `PageRegistry` singleton con `_ADMIN_PAGES: list[PageDefinition]` y `_PORTAL_PAGES: list[PageDefinition]`
- [ ] `PageDefinition`: dataclass con `route`, `layout`, `title`, `component`, `permission` (para admin), `allowed_roles` (para portal)
- [ ] `@quiver_page` valida que `layout` es `"admin"` o `"portal"`. Para admin requiere `permission`. Para portal requiere `allowed_roles`
- [ ] `GET /admin/pages`: filtra por `user.permissions` (o `is_superuser`). Requiere `require_authenticated()`
- [ ] `GET /portal/pages`: filtra por intersección de `user.roles` con `allowed_roles` de cada página. Requiere `require_authenticated()`
- [ ] `QuiverPage` es una clase base vacía (solo para herencia semántica)


---

### E8-US2

```
id:           E8-US2
título:       Implementar enrutamiento dinámico de páginas custom en React
tipo:         frontend
complejidad:  M
depende_de:   [E8-US1, E7-US1]
```

**crea:**
```
frontend/src/plugin/
├── PageRegistry.tsx
└── DynamicRoutes.tsx
```

**modifica:**
```
frontend/src/router.tsx    ← integra DynamicRoutes en ambas zonas
```

**contexto:**
El frontend carga `GET /admin/pages` y `GET /portal/pages` al iniciar y crea rutas React Router dinámicas para cada página registrada. El componente de la página se busca en el `PageRegistry` del frontend por nombre de string. El developer registra sus componentes React en el PageRegistry de su proyecto.

**criterios_funcionales:**
- [ ] Una página registrada con `@quiver_page` aparece como ruta navegable en el SPA
- [ ] El developer puede registrar su componente React con `PageRegistry.register("ReportsPage", ReportsPage)`
- [ ] Si el componente no está registrado, la ruta muestra un error claro (no crash)
- [ ] Las rutas dinámicas usan el layout correcto (AdminLayout o UserLayout)

**criterios_tecnicos:**
- [ ] `PageRegistry` es un `Map<string, React.ComponentType>` — igual que FieldRegistry y WidgetRegistry
- [ ] `DynamicRoutes` es un componente que hace `GET /admin/pages` y `GET /portal/pages` y devuelve un fragmento de `<Route>` para cada página
- [ ] Las rutas dinámicas se envuelven automáticamente en el guard correcto: `RequireRole(["admin"])` para admin, `RequireRole(allowed_roles)` para portal
- [ ] Si un componente no está en el PageRegistry, renderiza `<FallbackPage name={componentName} />` con mensaje: "Componente '{componentName}' no encontrado en PageRegistry. Regístralo en main.tsx."
- [ ] `DynamicRoutes` se renderiza dentro de cada zona de rutas en `router.tsx`


---

---

## E9 — Portal

> Objetivo: el portal de usuario está completo y funcional con welcome page, perfil, y la infraestructura para páginas custom.

---

### E9-US1

```
id:           E9-US1
título:       Implementar router base del portal y endpoints de perfil
tipo:         backend
complejidad:  S
depende_de:   [E2-US4]
```

**crea:**
```
backend/quiver/portal/
├── __init__.py
├── schemas.py
└── router.py
```

**modifica:**
```
backend/quiver/app.py
```

**contexto:**
El router del portal con los tres endpoints propios de Quiver: welcome, perfil (lectura) y perfil (actualización). El endpoint de bienvenida devuelve información diferente según `QUIVER_ENV`.

**criterios_funcionales:**
- [ ] `GET /portal/` devuelve datos de bienvenida según el entorno
- [ ] `GET /portal/me` devuelve el perfil del usuario logueado
- [ ] `PUT /portal/me` actualiza nombre, apellidos y/o contraseña

**criterios_tecnicos:**
- [ ] `GET /portal/` en development: `{message, version, user: {name, roles[]}, env: "development"}`. En production: `{message: QUIVER_PORTAL_WELCOME_MESSAGE}`
- [ ] `QUIVER_PORTAL_WELCOME_MESSAGE` es una nueva variable en `QuiverConfig` con default "Bienvenido. Esta sección estará disponible próximamente."
- [ ] `PUT /portal/me` schema: `{first_name?, last_name?, current_password?, new_password?}`. Si `new_password` está presente, `current_password` es obligatorio. Verificar `current_password` antes de actualizar
- [ ] El usuario no puede cambiar su propio email ni sus roles vía este endpoint
- [ ] Todos los endpoints requieren `require_authenticated()`


---

### E9-US2

```
id:           E9-US2
título:       Implementar PortalWelcomePage y páginas de perfil en React
tipo:         frontend
complejidad:  M
depende_de:   [E9-US1, E7-US3]
```

**crea:**
```
frontend/src/pages/portal/
├── PortalWelcomePage.tsx
├── ProfilePage.tsx
└── EditProfilePage.tsx
frontend/src/api/
└── portal.api.ts
```

**modifica:**
```
frontend/src/router.tsx    ← añade rutas /portal, /portal/perfil, /portal/perfil/editar
```

**contexto:**
Las páginas built-in del portal. `PortalWelcomePage` se comporta diferente según el entorno. Las páginas de perfil implementan SCREEN-16 y SCREEN-17 de `quiver-design-spec.md`.

**criterios_funcionales:**
- [ ] En development, `/portal` muestra info técnica del dev (SCREEN-14)
- [ ] En production, `/portal` muestra mensaje de bienvenida neutro (SCREEN-15)
- [ ] `/portal/perfil` muestra los datos del usuario (SCREEN-16)
- [ ] `/portal/perfil/editar` permite actualizar nombre y contraseña (SCREEN-17)

**criterios_tecnicos:**
- [ ] `PortalWelcomePage` lee `import.meta.env.VITE_QUIVER_ENV` para determinar el modo de display. Incluye el banner informativo de desarrollo con comentario `// REMOVE OR REPLACE: this is the default portal welcome page`
- [ ] Implementar SCREEN-14, SCREEN-15, SCREEN-16, SCREEN-17 de `quiver-design-spec.md`
- [ ] El avatar con iniciales en ProfilePage: misma lógica que en la gestión de usuarios
- [ ] `EditProfilePage` valida localmente que las contraseñas coinciden antes de enviar
- [ ] Toast de éxito tras actualizar perfil


---

---

## E10 — Control de acceso en frontend

> Objetivo: componentes y hooks de control de acceso disponibles en todo el SPA. Al completar E10, el MVP está completo.

---

### E10-US1

```
id:           E10-US1
título:       Implementar componentes Can y HasRole
tipo:         frontend
complejidad:  S
depende_de:   [E2-US6]
```

**crea:**
```
frontend/src/components/access/
├── Can.tsx
└── HasRole.tsx
frontend/src/hooks/
├── usePermission.ts
└── useRole.ts
```

**modifica:**
```
frontend/src/components/access/index.ts    ← expone todo desde un único import
```

**contexto:**
Los componentes declarativos de control de acceso y sus hooks equivalentes. Son puramente de UI — no son una barrera de seguridad (esa la proveen los guards de ruta y el backend). Su propósito es evitar mostrar elementos que el usuario no puede usar.

**criterios_funcionales:**
- [ ] `<Can do="products.create">` renderiza hijos si el usuario tiene ese permiso
- [ ] `<HasRole roles={["admin"]}>` renderiza hijos si el usuario tiene ese rol
- [ ] Ambos aceptan prop `fallback` que se renderiza cuando no se cumple la condición
- [ ] `is_superuser=true` hace que ambos componentes siempre rendericen los hijos

**criterios_tecnicos:**
- [ ] `usePermission()` devuelve `{ can(perm: string): boolean, canAny(perms: string[]): boolean }`
- [ ] `useRole()` devuelve `{ hasRole(role: string): boolean, hasAnyRole(roles: string[]): boolean }`
- [ ] Ambos hooks leen de `auth.store` — cero llamadas a la API
- [ ] Si `is_superuser=true` en el store, `can()` y `hasRole()` devuelven siempre `true`
- [ ] `Can` y `HasRole` internamente usan `usePermission` y `useRole` respectivamente
- [ ] Si no hay `fallback` y no se cumple la condición, no se renderiza nada (`null`) — sin elementos vacíos en el DOM
- [ ] Los hooks y componentes son importables desde `@/components/access`


---

---

## Apéndice A — Mapa de dependencias entre historias

```
E1-US1 ──► E1-US2 ──► E1-US3 ──► E1-US4*
                │                   ▲
                ▼                   │
             E2-US1 ──► E2-US2 ──► E2-US3 ──► E2-US4 ──► E2-US5
                │              │         │          │
                ▼              └──────── ┼──────────┤
             E3-US1 ──► E3-US2           ▼          │
                    │       │          E2-US6 ──► E2-US7
                    ▼       ▼
                 E3-US3 ──► E3-US4 (necesita E7-US1)
                    │
                    ▼
                 E4-US1 ──► E4-US2 (necesita E7-US1)

E3-US2 ──► E5-US1 ──► E5-US2 ──► E5-US3 ──► E5-US4 ──► E5-US5
                                       │
                                       ▼
E6-US1 ──► E6-US2 (necesita E7-US1)  E5-US5

E2-US6 ──► E7-US1 ──► E7-US2 ──► E7-US3
                │
                ▼
             E8-US1 ──► E8-US2
             E9-US1 ──► E9-US2 (necesita E7-US3)
             E10-US1

* E1-US4 necesita E2-US1 y E2-US2 — cross-epic dependency
```

---

## Apéndice B — Historias por tipo

| Tipo | IDs |
|---|---|
| `infra` | E1-US1 |
| `backend` | E1-US2, E1-US3, E1-US4, E2-US1, E2-US2, E2-US3, E2-US4, E2-US5, E3-US1, E3-US2, E3-US3, E4-US1, E5-US1, E5-US2, E5-US3, E6-US1, E7-US2(be), E8-US1, E9-US1 |
| `frontend` | E2-US6, E2-US7, E3-US4, E4-US2, E5-US4, E5-US5, E6-US2, E7-US1, E7-US3, E8-US2, E9-US2, E10-US1 |
| `fullstack` | E7-US2 |

---

## Apéndice C — Historias por complejidad

| Complejidad | IDs | Total estimado |
|---|---|---|
| `XS` | E2-US5 | ~2h |
| `S` | E1-US4, E2-US2, E2-US7, E3-US1, E3-US2, E5-US3, E7-US3, E8-US1, E9-US1, E10-US1 | ~30h |
| `M` | E1-US1, E1-US2, E1-US3, E2-US3, E2-US4, E3-US3, E3-US4, E4-US1, E4-US2, E5-US1, E6-US1, E6-US2, E7-US2, E8-US2, E9-US2 | ~90h |
| `L` | E2-US6, E5-US2, E5-US4, E5-US5, E7-US1 | ~60h |
| **Total estimado** | | **~182h** |

---

*Documento de build stories para el pipeline multiagente de Claude Code. Versión 1.0.*
*Referencias: quiver-mvp-definition.md · quiver-design-spec.md · quiver-epics-user-stories.md*
