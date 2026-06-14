<p align="center">
  <img src="assets/quiver-logo.png" alt="Quiver" width="380" />
</p>

<p align="center">
  <a href="https://github.com/rnkr69/quiver/actions/workflows/ci.yml"><img src="https://github.com/rnkr69/quiver/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://pypi.org/project/fastapi-quiver/"><img src="https://img.shields.io/pypi/v/fastapi-quiver?color=blue" alt="PyPI" /></a>
  <a href="https://pypi.org/project/fastapi-quiver/"><img src="https://img.shields.io/pypi/pyversions/fastapi-quiver" alt="Python" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

**Un panel de administración y portal de usuario completo para cualquier app FastAPI + SQLModel, declarado en Python.**

Quiver es una librería, no una aplicación independiente. Móntala sobre tu aplicación FastAPI
existente en una línea, declara tus CRUDs, widgets, páginas y permisos en Python, y obtén un
panel de administración completo (UI de list/create/edit/delete, dashboard, RBAC) más un portal
de cliente — sin escribir nada de frontend.

> 🇬🇧 *This README is also available in [English](README.md).*

<p align="center">
  <img src="assets/quiver-install.gif" alt="Instala Quiver y monta un panel de administración completo en una línea" width="840" />
</p>

<p align="center"><sub>▶️ Mira el recorrido completo (con audio): <a href="assets/quiver-demo.mp4">assets/quiver-demo.mp4</a> — login, dashboard y CRUD automático</sub></p>

---

## Cómo funciona

- El **backend** (`fastapi-quiver`, el paquete instalable) genera los endpoints REST y sirve toda
  la definición de la UI (columnas, campos, filtros, menú, páginas) a partir de tus declaraciones
  en Python.
- El **frontend** es una SPA genérica de Vite + React + TypeScript que lo lee todo del backend en
  tiempo de ejecución — así que añadir un recurso de admin **no requiere cambios en el frontend**.

```python
# main.py
from fastapi import FastAPI
from quiver import QuiverApp
import permissions  # noqa: F401 — registra permisos en tiempo de import

app = FastAPI()
quiver = QuiverApp(app)  # monta auth, RBAC, usuarios, dashboard, menú, páginas y portal
```

---

## Inicio rápido

### 1. Instalar el paquete backend

```bash
pip install fastapi-quiver
```

<sub>¿Instalar desde el código fuente? Mira la [guía de instalación](docs/es/01-instalacion.md).</sub>

### 2. Configurar el entorno

`SECRET_KEY` y `DATABASE_URL` son obligatorias (ver [`.env.example`](.env.example)):

```env
SECRET_KEY=cambia-esto
DATABASE_URL=sqlite:///./app.db
```

### 3. Montar Quiver, migrar y crear el primer usuario

```bash
quiver db migrate          # aplica las migraciones de auth/RBAC de Quiver
quiver create-superuser    # creación interactiva del primer usuario
uvicorn main:app --reload  # API servida bajo /quiver/v1
```

### 4. Servir la UI de administración

El wheel publicado **incluye la SPA compilada**. Móntala al final de tu configuración (tras
registrar tus CRUDs) y queda servida en `/quiver`, con la API bajo `/quiver/v1`:

```python
quiver.serve_frontend()   # sirve el admin/portal en /quiver
```

Abre `http://localhost:8000/quiver/` — sin proceso de frontend aparte.

**¿Desarrollando el frontend?** Arranca la SPA desde [`frontend/`](frontend/) con hot reload;
se sirve en `http://localhost:5173/quiver/` y hace proxy de la API a tu backend:

```bash
npm install
npm run dev
```

> `serve_frontend()` no hace nada si no hay build presente, así que servir la SPA por separado
> funciona sin más. El base path de la SPA (`/quiver`) es configurable vía `QUIVER_FRONTEND_PATH`
> (backend) y `VITE_BASE_PATH` (frontend) — mantenlos sincronizados.

---

## Documentación

| Documento | Contenido |
|---|---|
| [Instalación](docs/es/01-instalacion.md) | Instalar el backend, configurar variables de entorno, montar el frontend |
| [Inicio rápido](docs/es/02-inicio-rapido.md) | Primer CRUD, primer widget — app funcional en 20 minutos |
| [CRUD Engine](docs/es/03-crud.md) | Campos, columnas, filtros, hooks de ciclo de vida, permisos |
| [Dashboard](docs/es/04-dashboard.md) | StatCards, gráficas, permisos por widget |
| [Roles y permisos](docs/es/05-rbac.md) | Definir permisos, crear roles, proteger rutas |
| [Menú](docs/es/06-menu.md) | Estructura del menú lateral del admin |
| [Páginas custom](docs/es/07-paginas-custom.md) | Páginas React arbitrarias en el admin o el portal |
| [Portal de usuario](docs/es/08-portal.md) | Portal de cliente: roles de acceso, personalización |
| [Frontend](docs/es/09-frontend.md) | Tokens de diseño, componentes, layouts |
| [Ejemplos](docs/es/10-ejemplos.md) | Proyectos funcionales listos para ejecutar |

---

## Ejemplo

[`examples/almacen/`](examples/almacen/) es una app de referencia completa (gestión de almacén):
4 CRUDs interconectados, movimientos de stock con lógica de negocio, widgets de dashboard,
permisos personalizados y una página custom. Es el mejor sitio para ver cómo se monta todo.

---

## Requisitos

- Python 3.11+
- Node.js 18+ (solo para el frontend)
- PostgreSQL o SQLite (desarrollo)
- Un proyecto FastAPI existente que use SQLModel como ORM

---

## ¿Qué incluye Quiver?

- **Autenticación completa** — login, tokens JWT de acceso/refresh, reset de contraseña por email
- **CRUD automático** — declara un modelo SQLModel y obtén list/create/edit/delete con UI incluida
- **Dashboard** — StatCards y gráficas configurables con datos de tu base de datos
- **Roles y permisos** — RBAC granular, asignación desde la UI
- **Portal de usuario** — área separada para tus clientes, con roles propios
- **Páginas custom** — añade tus propias páginas React al admin o al portal
- **Menú configurable** — estructura el sidebar con grupos, ítems y control de permisos
- **Internacionalización** — UI en inglés/español lista para usar (react-i18next) con selector de idioma; detecta el idioma del navegador y es fácil de ampliar con nuevos idiomas

---

## Capturas

| Dashboard | Listado CRUD autogenerado |
|---|---|
| ![Dashboard](assets/screenshots/02-dashboard.png) | ![Listado CRUD](assets/screenshots/03-crud-list.png) |
| **Formulario autogenerado** | **Login** |
| ![Formulario CRUD](assets/screenshots/04-crud-form.png) | ![Login](assets/screenshots/01-login.png) |

<sub>Capturas de la app de referencia [`examples/almacen`](examples/almacen/).</sub>

---

## Contribuir

Las contribuciones son bienvenidas — ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[MIT](LICENSE) © rnkr69
