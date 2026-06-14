# Quiver Frontend

The generic admin panel + user portal SPA for [Quiver](https://github.com/rnkr69/quiver).

It is **server-driven**: columns, fields, filters, the menu and dynamic pages are all read from
the backend at runtime, so adding a new admin resource on the backend needs **zero changes
here**.

## Tech stack

- React 18 + TypeScript (strict)
- Vite
- Tailwind CSS
- TanStack Query (server state) + Zustand (client state)
- React Router
- Axios (JWT interceptor with single-flight refresh queue)

## Development

```bash
npm install
npm run dev          # dev server on http://localhost:5173, proxies /quiver to the backend
npm run typecheck    # tsc --noEmit
npm run build        # production build into ../backend/quiver/static
```

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/quiver/v1` | Base URL of the Quiver backend API |
| `VITE_PORTAL_ROLES` | *(empty)* | Comma-separated roles allowed into the `/portal/*` zone |

## Structure

- `src/api/` — axios client + per-resource API services
- `src/components/` — UI primitives, generic CRUD table/form, fields, dashboard, access guards
- `src/pages/` — auth, admin, users, roles, generic CRUD pages, portal
- `src/plugin/` — `PageRegistry` and `DynamicRoutes` (runtime server-driven routing)
- `src/store/` — Zustand stores (auth, menu, ui)
- `src/layout/` — admin / portal / auth layouts

## Custom pages

A host app registers custom React pages in `main.tsx` via
`PageRegistry.register("ComponentName", Component)`; the name must match the
`@quiver_page(component=...)` value declared on the backend.
