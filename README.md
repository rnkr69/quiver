# Quiver

Panel de administración y portal de usuario para FastAPI. Añade un admin completo —gestión de usuarios, roles, CRUDs automáticos, dashboard y portal de cliente— a cualquier aplicación FastAPI existente en menos de 30 minutos.

→ **[Resumen ejecutivo del proyecto](docs/quiver-executive-summary.html)**

---

## Inicio rápido

```bash
# 1. Instalar el paquete Python
pip install git+https://github.com/tu-organizacion/quiver.git@v0.1.0

# 2. Montar Quiver en tu app
# main.py
from fastapi import FastAPI
from quiver import QuiverApp

app = FastAPI()
quiver = QuiverApp(app)   # ← una línea

# 3. Crear tablas y primer usuario
quiver db migrate
quiver create-superuser

# 4. Arrancar
uvicorn main:app --reload
```

El panel queda disponible en `http://localhost:5173` (frontend) y la API bajo `/quiver/v1`.

---

## Documentación

| Documento | Contenido |
|---|---|
| [Instalación](docs/01-instalacion.md) | Instalar backend vía git, configurar variables de entorno, copiar frontend |
| [Inicio rápido](docs/02-inicio-rapido.md) | Primer CRUD, primer widget — app funcional en 20 minutos |
| [CRUD Engine](docs/03-crud.md) | Campos, columnas, filtros, hooks, permisos |
| [Dashboard](docs/04-dashboard.md) | StatCards, gráficas, permisos por widget |
| [Roles y permisos](docs/05-rbac.md) | Definir permisos, crear roles, proteger rutas |
| [Menú](docs/06-menu.md) | Estructura del menú lateral del admin |
| [Páginas custom](docs/07-paginas-custom.md) | Páginas React arbitrarias en el admin o el portal |
| [Portal de usuario](docs/08-portal.md) | Portal de cliente: roles de acceso, personalización |
| [Frontend](docs/09-frontend.md) | Tokens de diseño, componentes, UserLayout |
| [Ejemplos](docs/10-ejemplos.md) | Proyectos funcionales listos para ejecutar |

---

## Ejemplos

El directorio `examples/` contiene proyectos de referencia funcionales:

- **[`examples/almacen/`](examples/almacen/)** — Gestión de materiales de almacén: 4 CRUDs interconectados, movimientos de stock con lógica de negocio, widgets de dashboard, permisos personalizados y página custom.

---

## Requisitos

- Python 3.11+
- Node.js 18+ (solo para el frontend)
- PostgreSQL o SQLite (desarrollo)
- Un proyecto FastAPI existente con SQLModel como ORM

---

## ¿Qué incluye Quiver?

- **Autenticación completa** — login, tokens JWT, refresh, reset de contraseña por email
- **CRUD automático** — define un modelo SQLModel y obtén list/create/edit/delete con UI incluida
- **Dashboard** — StatCards y gráficas configurables con datos de tu base de datos
- **Roles y permisos** — RBAC granular, asignación desde la UI
- **Portal de usuario** — área separada para tus clientes, con roles propios
- **Páginas custom** — añade tus propias páginas React al admin o al portal
- **Menú configurable** — estructura el sidebar con grupos, ítems y control de permisos

---

*Quiver v0.1.0*
