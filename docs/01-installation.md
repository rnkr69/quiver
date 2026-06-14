> 🇪🇸 [Versión en español](es/01-instalacion.md)

# Installation

> This guide assumes you already have a working FastAPI project and want to add Quiver to get an admin panel and a user portal. Your project **has no users table of its own** — Quiver will manage every system user.

---

## Prerequisites

- Python 3.11+
- A working FastAPI project using SQLModel as its ORM
- PostgreSQL (recommended) or SQLite (development only)
- Node.js 18+ and npm — **only** if you want to run or build the SPA yourself (the package already ships a built SPA)

---

## Step 1 — Install the Python package

Quiver is published on PyPI under the distribution name **`fastapi-quiver`**. The import name in code stays `quiver` (e.g. `from quiver import QuiverApp`).

> **Virtual environment:** install Quiver inside your project's virtual environment (`venv`, `virtualenv`, `conda`…). If you don't have one yet:
> ```bash
> python -m venv .venv
> source .venv/bin/activate   # Windows: .venv\Scripts\activate
> ```

### Basic installation (recommended)

```bash
pip install fastapi-quiver
```

### Pin a specific version (recommended for production)

Always pin a version in production projects to avoid unexpected changes:

```bash
pip install "fastapi-quiver==0.1.0"
```

### Install from a git tag (alternative)

The package also lives in the public repository, inside the `backend/` subdirectory. You can install it straight from a git tag:

```bash
pip install "git+https://github.com/rnkr69/quiver.git@v0.1.0#subdirectory=backend"
```

### Declare the dependency in `pyproject.toml`

```toml
[project]
dependencies = [
    "fastapi-quiver>=0.1.0",
]
```

```bash
pip install -e .
```

Or, if you use `requirements.txt`:

```txt
fastapi-quiver>=0.1.0
```

```bash
pip install -r requirements.txt
```

### Important: run the CLI from your project root

The Quiver CLI (`quiver db migrate`, `quiver create-superuser`) looks for the `.env` file in the **current working directory**. Always run these commands from the folder that contains your `.env`:

```bash
# Correct — .env is in the project root
cd /path/to/your-project
quiver db migrate

# Wrong — it won't find the .env
cd /another/folder
quiver db migrate
```

### pyenv: the `quiver` command is not found

If you use pyenv and, after installing the package, you get `pyenv: quiver: command not found`, run:

```bash
pyenv rehash
```

pyenv needs this command to refresh its shims every time you install a package that exposes a new executable. Then verify:

```bash
quiver --help
```

---

## Step 2 — Add the environment variables

Add the following variables to your `.env` file:

```env
# ── Quiver ────────────────────────────────────────────────────────────────────

# Secret key used to sign JWTs. Generate one with:
# python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=put-your-secret-key-of-at-least-32-characters-here

# Your database URL (it can be the same one your project uses)
DATABASE_URL=postgresql://user:password@localhost:5432/your_database

# Environment: development shows extra information in the portal
QUIVER_ENV=development

# Prefix for Quiver's API routes (defaults to /quiver/v1)
# QUIVER_PREFIX=/quiver/v1

# Path where the bundled admin/portal SPA is served (defaults to /quiver)
# Must match the frontend's VITE_BASE_PATH (default /quiver/)
# QUIVER_FRONTEND_PATH=/quiver

# Frontend URL (required for password reset emails)
QUIVER_FRONTEND_URL=http://localhost:8000/quiver

# Roles that may access the user portal (comma-separated)
# The superuser always has access, no need to include it here
QUIVER_PORTAL_ROLES=client,client_premium

# Portal welcome message in production (optional)
# QUIVER_PORTAL_WELCOME_MESSAGE=Welcome. This section will be available soon.
```

> `DATABASE_URL` can point to the same database your project uses. Quiver only creates its own tables (`admin_users`, `roles`, `permissions`, etc.) and never modifies yours.

### Full variable reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | Yes | — | Key used to sign JWTs. At least 32 characters. |
| `DATABASE_URL` | Yes | — | SQLAlchemy URL. PostgreSQL or SQLite. |
| `QUIVER_ENV` | No | `development` | `development` or `production`. |
| `QUIVER_PREFIX` | No | `/quiver/v1` | Prefix for Quiver's API routes. |
| `QUIVER_FRONTEND_PATH` | No | `/quiver` | Path where the bundled SPA is served. Must match the frontend `VITE_BASE_PATH`. |
| `QUIVER_FRONTEND_URL` | No | `http://localhost:5173` | Base URL for links in emails. |
| `QUIVER_PORTAL_ROLES` | No | *(empty)* | Roles with portal access, comma-separated. |
| `QUIVER_PORTAL_WELCOME_MESSAGE` | No | *(generic text)* | Welcome message in production. |

---

## Step 3 — Mount Quiver in your FastAPI application

Find the file where you create your FastAPI instance (usually `main.py` or `app.py`) and add Quiver:

```python
# main.py
from fastapi import FastAPI
from quiver import QuiverApp

# Your existing app
app = FastAPI(title="My API")

# Your existing routers — left untouched
app.include_router(products_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")

# Mount Quiver — one line
quiver = QuiverApp(app)

# Register your CRUDs, widgets, pages and menu here…
# quiver.register(MyCRUD)
# quiver.set_menu([...])

# Serve the bundled admin/portal SPA — MUST be the LAST line of setup
quiver.serve_frontend()
```

Quiver automatically mounts all of its API routers under `/quiver/v1` and registers the required exception handlers.

### Serving the bundled frontend

The published wheel **bundles the built admin/portal SPA**. Calling `quiver.serve_frontend()` mounts it so you can open the admin panel from the same server that runs your API — no separate frontend process or build needed.

> **Call `serve_frontend()` LAST**, after you have registered every CRUD, page and route. It mounts a catch-all static handler, so anything registered under the same path afterwards would be shadowed.

The SPA is served at `/quiver` (configurable via `QUIVER_FRONTEND_PATH`), while the API stays under `QUIVER_PREFIX` (default `/quiver/v1`). With uvicorn on port 8000, the admin panel opens at `http://localhost:8000/quiver/`.

> **Safe to always call.** If no SPA build is present — for example you installed without a build, or you prefer to run the SPA separately in development — `serve_frontend()` is a no-op and simply logs a warning. You can leave the call in place at all times.

---

## Step 4 — Create the database tables

```bash
quiver db migrate
```

This command creates Quiver's tables in your database:

| Table | Contents |
|---|---|
| `admin_users` | System users |
| `roles` | Available roles |
| `permissions` | Registered permissions |
| `role_has_permissions` | Which permissions each role has |
| `user_has_roles` | Which roles each user has |
| `refresh_tokens` | Active sessions |
| `password_reset_tokens` | Password reset tokens |

> This command only **creates** new tables. It never modifies or deletes your project's tables.

To roll back the last migration:

```bash
quiver db rollback
```

---

## Step 5 — Create the first admin user

```bash
quiver create-superuser
```

The command asks for the details interactively:

```
=== Quiver — Create Superuser ===
Email: admin@yourcompany.com
First name: Ana
Last name: García
Password:
Confirm password:

Superuser 'admin@yourcompany.com' created successfully.
```

---

## Step 6 — Open the admin panel

The published wheel **bundles the built admin/portal SPA**, and you already mounted it in Step 3 with `quiver.serve_frontend()`. There is **nothing else to install or build** — just start your backend and open it in the browser.

```bash
uvicorn main:app --reload
```

Then open:

```
http://localhost:8000/quiver/
```

The SPA is generic: it reads everything (columns, fields, filters, menu, dynamic pages) from the backend at runtime, so it rarely needs per-app changes. The admin lives at `/quiver` and the API at `/quiver/v1` — both served by the same process.

> If you changed `QUIVER_FRONTEND_PATH`, open that path instead.

---

### Development / advanced: run the SPA separately

You only need this if you are **modifying the frontend** and want hot reload, or if you prefer to serve the SPA yourself. For normal usage, Step 3's `serve_frontend()` is all you need.

Get the frontend from the public repository:

```bash
git clone --depth 1 https://github.com/rnkr69/quiver.git
cd quiver/frontend
```

Install dependencies:

```bash
npm install
```

Create the file `frontend/.env.local`:

```env
# Base path the SPA is served under — keep the trailing slash.
# MUST match the backend QUIVER_FRONTEND_PATH (default /quiver).
VITE_BASE_PATH=/quiver/

# Base URL of the API
VITE_API_BASE_URL=http://localhost:8000/quiver/v1

# Roles that have access to the user portal (comma-separated)
VITE_PORTAL_ROLES=client,client_premium
```

Start the dev server:

```bash
npm run dev
```

The frontend starts at `http://localhost:5173/quiver/` and proxies API calls (`/quiver/v1`) to the backend. With the SPA running separately, `serve_frontend()` on the backend stays a harmless no-op (or you can simply not call it).

---

## Step 7 — Verify the installation

With the backend running (the SPA is served by it):

1. Open `http://localhost:8000/quiver/`
2. Sign in with the superuser credentials
3. You should see the admin panel

> Running the SPA separately in development? Open `http://localhost:5173/quiver/` instead.

To check that the API responds, try the login endpoint:

```bash
curl -s -X POST http://localhost:8000/quiver/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@email.com","password":"your-password"}'
```

Expected response:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "redirect_to": "/admin"
}
```

---

## Recommended project structure

After integration, your project will look like this:

```
your-project/
├── main.py                  # your FastAPI app + QuiverApp
├── models/                  # your existing SQLModel models
├── routers/                 # your existing routers
├── cruds/                   # new: your QuiverCRUD classes
│   ├── product_crud.py
│   └── category_crud.py
├── pages/                   # new: your custom pages (@quiver_page)
│   └── sales_report.py
├── email.py                 # new: your EmailSender implementation
└── .env
```

The admin/portal SPA is **bundled in the package** and served by `quiver.serve_frontend()` — you do not need a `frontend/` directory in your project. The SPA source lives in the Quiver repository only for development or custom builds.

---

## Production

### The simple path: serve the bundled SPA

Because the wheel bundles the built SPA, the recommended production setup is the same as development: keep `quiver.serve_frontend()` as the last line of setup and run your app with a production ASGI server (e.g. `uvicorn`/`gunicorn` behind a reverse proxy). The admin panel is served at `QUIVER_FRONTEND_PATH` (default `/quiver`) by the same process as your API.

### Production environment variables

```env
SECRET_KEY=a-secure-key-different-from-development
DATABASE_URL=postgresql://user:password@prod-host:5432/db
QUIVER_ENV=production
QUIVER_FRONTEND_URL=https://yourdomain.com/quiver
# Optional — change where the SPA is served (must match VITE_BASE_PATH if you rebuild)
# QUIVER_FRONTEND_PATH=/quiver
```

### Custom build (advanced)

If you need to serve the SPA behind your own web server or CDN, you can still build it yourself:

```bash
cd frontend
npm run build
```

This outputs static assets to `backend/quiver/static`. Set `VITE_BASE_PATH` (default `/quiver/`, keep the trailing slash) and `VITE_API_BASE_URL` at build time so they match your deployment. Keep `VITE_BASE_PATH` in sync with the backend `QUIVER_FRONTEND_PATH`.

---

## Updating Quiver

### Update the backend

```bash
pip install --upgrade "fastapi-quiver==0.2.0"
quiver db migrate
```

If you use `pyproject.toml`, bump the version and reinstall:

```toml
"fastapi-quiver>=0.2.0",
```

```bash
pip install -e .
quiver db migrate
```

### Update the frontend

The frontend is bundled with the package, so upgrading `fastapi-quiver` (above) also updates the admin/portal SPA. There is nothing extra to do.

If you maintain a **custom build** of the SPA, pull the matching version from the repository and rebuild:

```bash
cd quiver
git pull
cd frontend
npm install
npm run build
```

---

## Command reference

### Quiver CLI

| Command | Description |
|---|---|
| `quiver db migrate` | Creates/updates Quiver's tables in the database |
| `quiver db rollback` | Rolls back Quiver's last migration |
| `quiver create-superuser` | Interactively creates the first admin user |
| `quiver --help` | Lists all available commands |

---

## Frequently asked questions

**Does Quiver modify my existing tables?**
No. Quiver only creates its own tables. It never touches your project's.

**Can I use my existing SQLModel models in CRUDs?**
Yes. `QuiverCRUD` accepts any SQLModel model. Just set `model = YourModel` and `route = "your-route"`.

**Can I keep my own auth system alongside Quiver's?**
Yes. Quiver mounts its auth under `/quiver/v1/auth` and does not interfere with any other authentication systems you already have.

**Does it work with SQLite for development?**
Yes. Use `DATABASE_URL=sqlite:///./quiver.db`.

**Can I change the `/quiver/v1` prefix?**
Yes. Set `QUIVER_PREFIX=/admin` in your `.env`. This changes the API prefix; to move the bundled SPA, set `QUIVER_FRONTEND_PATH` (and keep `VITE_BASE_PATH` in sync if you rebuild the SPA).

**Do I have to run the frontend separately?**
No. The wheel bundles the built SPA; call `quiver.serve_frontend()` as the last line of setup and open `/quiver/`. Running the SPA separately is only needed for frontend development or custom deployments.

**What if I already have a users table?**
Quiver creates its own independent `admin_users` table. Both coexist without interfering.

---

Next: [Quick start →](02-quick-start.md)
