> 🇪🇸 [Versión en español](es/09-frontend.md)

# Frontend

Quiver's frontend is a generic React + TypeScript single-page application (the `frontend/` directory of the repo). It is **server-driven**: it reads columns, fields, filters, the menu and dynamic pages from the backend at runtime, so it rarely needs per-app changes.

This guide covers customization: design tokens, reusable components and how to structure your own pages.

---

## Serving the SPA

The SPA is **not** served at the site root. It lives under a configurable **base path** (default `/quiver/`) so it can be mounted alongside a host app's own routes. The API stays under `QUIVER_PREFIX` (default `/quiver/v1`), which is nested inside that base path.

There are two ways the SPA reaches users:

### 1. Bundled in the wheel (production)

`npm run build` outputs the compiled SPA to `../backend/quiver/static`, and that directory is bundled into the wheel at release time. The host app mounts it with `serve_frontend()`:

```python
quiver = QuiverApp(app)
quiver.register(...)        # register all CRUDs, pages, etc. first
quiver.set_menu([...])
quiver.serve_frontend()     # call this LAST — it mounts a catch-all static handler
```

`serve_frontend()` mounts the bundled build at `QUIVER_FRONTEND_PATH` (default `/quiver`). Because it installs a catch-all static handler, **call it after registering everything else** — anything registered afterwards under the same path prefix would be shadowed. The app then opens at `http://localhost:8000/quiver/`.

If no build is present (e.g. the package was installed without a frontend build, or you run the SPA separately), `serve_frontend()` is a no-op with a warning.

### 2. Run separately (development)

During development you typically run the Vite dev server, which serves the SPA and proxies the API to the backend:

```bash
cd frontend/
npm install
npm run dev        # SPA on http://localhost:5173/quiver/
```

The dev server serves the SPA under the same base path (`http://localhost:5173/quiver/`) and proxies API requests (`/quiver/v1`) to the backend at `http://localhost:8000` (configured in `frontend/vite.config.ts`).

### Base path: keep frontend and backend in sync

The frontend base path and the backend mount path **must match**:

| Side     | Setting                              | Where                                                                 | Default     |
| -------- | ------------------------------------ | --------------------------------------------------------------------- | ----------- |
| Frontend | `VITE_BASE_PATH`                     | Vite `base` (`vite.config.ts`) and React Router `basename` (`src/router.tsx`) | `/quiver/`  |
| Backend  | `QUIVER_FRONTEND_PATH`               | mount path used by `QuiverApp.serve_frontend()` (`backend/quiver/app.py`) | `/quiver`   |

Keep the trailing slash on `VITE_BASE_PATH`. If you change one, change the other to match.

### Frontend environment variables

The frontend reads these Vite env vars (see `frontend/.env.example`):

| Variable            | Default      | Purpose                                                                                  |
| ------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/quiver/v1` | Base URL of the Quiver backend API. Lives under the base path.                            |
| `VITE_BASE_PATH`    | `/quiver/`   | Base path the SPA is served from. Must match the backend `QUIVER_FRONTEND_PATH`. Keep the trailing slash. |
| `VITE_PORTAL_ROLES` | _(empty)_    | Comma-separated roles allowed into the client portal (`/portal/*`). Empty disables the portal. |

---

## File structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Base components (Button, Input, Badge, etc.)
│   │   ├── crud/            # CRUD Engine components
│   │   ├── dashboard/       # StatCard, ChartWidget
│   │   ├── fields/          # CRUD form fields
│   │   └── access/          # Can, HasRole
│   ├── layout/
│   │   ├── AdminLayout.tsx  # Admin layout (sidebar + topbar)
│   │   ├── AuthLayout.tsx   # Login/reset layout
│   │   ├── UserLayout.tsx   # Portal layout ← customize this
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── pages/
│   │   ├── admin/           # DashboardPage
│   │   ├── auth/            # LoginPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── crud/            # ListPage, CreatePage, EditPage, ShowPage
│   │   ├── portal/          # PortalWelcomePage, ProfilePage, EditProfilePage
│   │   ├── roles/           # RolesPage, RoleEditPage
│   │   └── users/           # UsersPage, UserCreateEditPage, UserDetailPage
│   ├── plugin/
│   │   ├── PageRegistry.tsx  # Custom page registry
│   │   └── DynamicRoutes.tsx # Routes generated from the backend
│   └── store/
│       ├── auth.store.ts     # Authentication state
│       ├── menu.store.ts     # Menu state
│       └── ui.store.ts       # UI state
├── tailwind.config.ts        # Design-system tokens (colors, fonts, shadows)
├── src/index.css             # Tailwind layers + global base styles
└── .env.local
```

---

## Design tokens (Tailwind theme)

The frontend is styled with **Tailwind CSS**. The design-system tokens (brand colors, gray scale, status colors, shadows, fonts) live in `tailwind.config.ts` under `theme.extend`. Edit them there to change the look of the whole app:

```ts
// tailwind.config.ts — theme.extend.colors
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f7f8',
          100: '#b3e8ec',
          400: '#00b3be',
          500: '#009ca6',   // primary color
          600: '#007a83',
          700: '#005e63',
        },
        gray: {
          50:  '#f9f9f9',
          100: '#f3f3f3',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#c0c0c0',
          500: '#adadad',
          600: '#8a8a8a',
          700: '#6b6b6b',
          800: '#3d3d3d',
          900: '#1a1a1a',
        },
        success: { 50: '#edf7f2', 500: '#2d9e6b' },
        danger:  { 50: '#fdf0f0', 500: '#d94040' },
        warning: { 50: '#fdf6e6', 500: '#c78b1a' },
      },
    },
  },
} satisfies Config
```

To change Quiver's primary color to, for example, a corporate blue, override the `brand` scale:

```ts
brand: {
  50:  '#eff6ff',
  100: '#dbeafe',
  400: '#3b82f6',
  500: '#2563eb',
  600: '#1d4ed8',
  700: '#1e40af',
},
```

---

## Available UI components

All components live in `src/components/ui/` and are styled with the Tailwind theme tokens.

### `Button`

```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" onClick={handleClick}>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">More options</Button>
<Button variant="link">Link</Button>

// Sizes
<Button variant="primary" size="sm">Small</Button>

// Loading state (shows a spinner and disables the button)
<Button variant="primary" loading>Saving...</Button>
```

### `Input`, `PasswordInput`, `QSelect`, `Textarea`

```tsx
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { QSelect } from '@/components/ui/QSelect'
import { Textarea } from '@/components/ui/Textarea'

<Input
  label="Name"
  value={name}
  onChange={e => setName(e.target.value)}
  required
  error="Name is required"
  hint="Up to 100 characters"
/>

<PasswordInput label="Password" value={pass} onChange={...} />

// QSelect takes an `options` array (strings or { value, label }) — you can also pass <option> children
<QSelect
  label="Status"
  value={status}
  onChange={...}
  options={[
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
/>

<Textarea label="Description" value={desc} onChange={...} rows={5} />
```

### `Badge`

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="active">Active</Badge>
<Badge variant="inactive">Inactive</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="admin">Admin</Badge>
<Badge variant="client">Client</Badge>
```

### `Alert`

For inline error or information messages in forms:

```tsx
import { Alert } from '@/components/ui/Alert'

<Alert type="error" message="Invalid credentials" />
<Alert type="success" message="Changes saved" />
<Alert type="warning" message="This action cannot be undone" />
<Alert type="info" message="The process may take a few seconds" />
```

### `Card`

```tsx
import { Card } from '@/components/ui/Card'

<Card className="p-5">
  Content on a white background with a soft shadow
</Card>
```

### `Toggle`

```tsx
import { Toggle } from '@/components/ui/Toggle'

<Toggle
  checked={isActive}
  onChange={setIsActive}
  label="Active"
/>
```

### `EmptyState`

```tsx
import { EmptyState } from '@/components/ui/EmptyState'
import { Package } from 'lucide-react'

<EmptyState
  icon={<Package size={40} />}
  title="No products"
  description="Create your first product to get started."
  action={<Button variant="primary">New product</Button>}
/>
```

### `PageHeader`

```tsx
import { PageHeader } from '@/components/ui/PageHeader'

<PageHeader
  title="Products"
  subtitle="Manage the product catalog"
  actions={<Button variant="primary">New product</Button>}
/>
```

### Toast (notifications)

Toasts are provided by the `ToastProvider` context. Use the `useToast` hook and call `toast(message, type)`:

```tsx
import { useToast } from '@/components/ui/Toast'

const { toast } = useToast()

toast('Product created successfully', 'success')
toast('Failed to save', 'error')
toast('Your changes have not been saved', 'warning')
toast('Heads up', 'info')
```

---

## Customizing the portal (`UserLayout.tsx`)

The file you will modify most is `src/layout/UserLayout.tsx`. It controls the portal navbar and footer, and is styled with Tailwind classes.

```tsx
// src/layout/UserLayout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'
import { cn } from '@/lib/utils'

export function UserLayout() {
  const { user } = useAuthStore()
  const location = useLocation()

  const navLinkClass = (path: string) => cn(
    'inline-flex items-center px-[10px] py-[5px] rounded text-base no-underline border border-transparent transition-colors',
    location.pathname === path || location.pathname.startsWith(path + '/')
      ? 'text-brand-600 bg-brand-50'
      : 'text-gray-700 bg-transparent hover:bg-gray-100',
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Navbar — customize here */}
      <header className="h-[60px] shrink-0 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-[100]">

        {/* Your company logo/name */}
        <Link to="/portal" className="flex items-center gap-2 no-underline">
          <QuiverLogo size={26} />
          <span className="text-base font-semibold text-gray-900">My Company</span>
        </Link>

        {/* Your navigation links */}
        <nav className="flex items-center gap-1 ml-2">
          <Link to="/portal/orders"   className={navLinkClass('/portal/orders')}>My orders</Link>
          <Link to="/portal/invoices" className={navLinkClass('/portal/invoices')}>Invoices</Link>
          <Link to="/portal/perfil"   className={navLinkClass('/portal/perfil')}>My profile</Link>
        </nav>

        <div className="flex-1" />

        {/* Current user */}
        {user && (
          <span className="text-md text-gray-800">{user.first_name}</span>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-8 py-[14px] text-xs text-gray-400">
        © {new Date().getFullYear()} My Company Ltd.
      </footer>
    </div>
  )
}
```

---

## Accessing the user's data in the frontend

```tsx
import { useAuthStore } from '@/store/auth.store'

const { user, logout } = useAuthStore()

// user.id, user.email, user.first_name, user.last_name
// user.is_superuser, user.roles (array of strings)
// logout() — clears the session and redirects to login
```

---

## Icon library

Quiver uses [lucide-react](https://lucide.dev/) for all icons. It is already installed:

```tsx
import { Package, ShoppingCart, Users, Settings, ChevronRight } from 'lucide-react'

<Package size={20} className="text-brand-500" />
```

---

← [Portal](08-portal.md)
