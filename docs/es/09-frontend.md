> 🇬🇧 [English version](../09-frontend.md)

# Frontend

El frontend de Quiver es una aplicación genérica de React + TypeScript (el directorio `frontend/` del repo). Es **dirigido por el servidor**: lee columnas, campos, filtros, el menú y las páginas dinámicas del backend en tiempo de ejecución, así que rara vez necesita cambios por aplicación.

Esta guía cubre la personalización: tokens de diseño, componentes reutilizables y cómo estructurar tus propias páginas.

---

## Servir la SPA

La SPA **no** se sirve en la raíz del sitio. Vive bajo una **ruta base** configurable (por defecto `/quiver/`) para poder montarse junto a las rutas propias de la app anfitriona. La API se mantiene bajo `QUIVER_PREFIX` (por defecto `/quiver/v1`), que está anidada dentro de esa ruta base.

Hay dos formas de hacer llegar la SPA a los usuarios:

### 1. Empaquetada en el wheel (producción)

`npm run build` genera la SPA compilada en `../backend/quiver/static`, y ese directorio se empaqueta dentro del wheel en el momento de la release. La app anfitriona la monta con `serve_frontend()`:

```python
quiver = QuiverApp(app)
quiver.register(...)        # registra primero todos los CRUDs, páginas, etc.
quiver.set_menu([...])
quiver.serve_frontend()     # llámalo el ÚLTIMO — monta un manejador estático catch-all
```

`serve_frontend()` monta el build empaquetado en `QUIVER_FRONTEND_PATH` (por defecto `/quiver`). Como instala un manejador estático catch-all, **llámalo después de registrar todo lo demás** — cualquier cosa registrada después bajo el mismo prefijo de ruta quedaría tapada. La app se abre entonces en `http://localhost:8000/quiver/`.

Si no hay ningún build presente (p. ej. el paquete se instaló sin build del frontend, o sirves la SPA por separado), `serve_frontend()` no hace nada y emite un aviso.

### 2. Ejecutada por separado (desarrollo)

Durante el desarrollo normalmente ejecutas el servidor de desarrollo de Vite, que sirve la SPA y hace de proxy de la API hacia el backend:

```bash
cd frontend/
npm install
npm run dev        # SPA en http://localhost:5173/quiver/
```

El servidor de desarrollo sirve la SPA bajo la misma ruta base (`http://localhost:5173/quiver/`) y hace de proxy de las peticiones a la API (`/quiver/v1`) hacia el backend en `http://localhost:8000` (configurado en `frontend/vite.config.ts`).

### Ruta base: mantén frontend y backend sincronizados

La ruta base del frontend y la ruta de montaje del backend **deben coincidir**:

| Lado     | Ajuste                               | Dónde                                                                  | Por defecto |
| -------- | ------------------------------------ | --------------------------------------------------------------------- | ----------- |
| Frontend | `VITE_BASE_PATH`                     | `base` de Vite (`vite.config.ts`) y `basename` de React Router (`src/router.tsx`) | `/quiver/`  |
| Backend  | `QUIVER_FRONTEND_PATH`               | ruta de montaje usada por `QuiverApp.serve_frontend()` (`backend/quiver/app.py`) | `/quiver`   |

Mantén la barra final en `VITE_BASE_PATH`. Si cambias una, cambia la otra para que coincida.

### Variables de entorno del frontend

El frontend lee estas variables de entorno de Vite (ver `frontend/.env.example`):

| Variable            | Por defecto  | Propósito                                                                                 |
| ------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/quiver/v1` | URL base de la API del backend de Quiver. Vive bajo la ruta base.                          |
| `VITE_BASE_PATH`    | `/quiver/`   | Ruta base desde la que se sirve la SPA. Debe coincidir con `QUIVER_FRONTEND_PATH` del backend. Mantén la barra final. |
| `VITE_PORTAL_ROLES` | _(vacío)_    | Roles separados por comas con acceso al portal de cliente (`/portal/*`). Vacío desactiva el portal. |

---

## Estructura de ficheros

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base (Button, Input, Badge, etc.)
│   │   ├── crud/            # Componentes del CRUD Engine
│   │   ├── dashboard/       # StatCard, ChartWidget
│   │   ├── fields/          # Campos de formulario del CRUD
│   │   └── access/          # Can, HasRole
│   ├── layout/
│   │   ├── AdminLayout.tsx  # Layout del admin (sidebar + topbar)
│   │   ├── AuthLayout.tsx   # Layout de login/reset
│   │   ├── UserLayout.tsx   # Layout del portal ← personaliza esto
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
│   │   ├── PageRegistry.tsx  # Registro de páginas custom
│   │   └── DynamicRoutes.tsx # Rutas generadas desde el backend
│   └── store/
│       ├── auth.store.ts     # Estado de autenticación
│       ├── menu.store.ts     # Estado del menú
│       └── ui.store.ts       # Estado de la UI
├── tailwind.config.ts        # Tokens del sistema de diseño (colores, fuentes, sombras)
├── src/index.css             # Capas de Tailwind + estilos base globales
└── .env.local
```

---

## Tokens de diseño (tema de Tailwind)

El frontend usa **Tailwind CSS**. Los tokens del sistema de diseño (colores de marca, escala de grises, colores de estado, sombras, fuentes) viven en `tailwind.config.ts` dentro de `theme.extend`. Edítalos ahí para cambiar la apariencia de toda la app:

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
          500: '#009ca6',   // color principal
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

Para cambiar el color principal de Quiver a, por ejemplo, un azul corporativo, sobreescribe la escala `brand`:

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

## Componentes UI disponibles

Todos los componentes están en `src/components/ui/` y usan los tokens del tema de Tailwind.

### `Button`

```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" onClick={handleClick}>Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="ghost">Más opciones</Button>
<Button variant="link">Enlace</Button>

// Tamaños
<Button variant="primary" size="sm">Pequeño</Button>

// Cargando (muestra un spinner y deshabilita el botón)
<Button variant="primary" loading>Guardando...</Button>
```

### `Input`, `PasswordInput`, `QSelect`, `Textarea`

```tsx
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { QSelect } from '@/components/ui/QSelect'
import { Textarea } from '@/components/ui/Textarea'

<Input
  label="Nombre"
  value={name}
  onChange={e => setName(e.target.value)}
  required
  error="El nombre es obligatorio"
  hint="Máximo 100 caracteres"
/>

<PasswordInput label="Contraseña" value={pass} onChange={...} />

// QSelect recibe un array `options` (strings o { value, label }) — también puedes pasar hijos <option>
<QSelect
  label="Estado"
  value={status}
  onChange={...}
  options={[
    { value: 'active',   label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
  ]}
/>

<Textarea label="Descripción" value={desc} onChange={...} rows={5} />
```

### `Badge`

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="active">Activo</Badge>
<Badge variant="inactive">Inactivo</Badge>
<Badge variant="success">Completado</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="admin">Admin</Badge>
<Badge variant="client">Cliente</Badge>
```

### `Alert`

Para mensajes de error o información inline en formularios:

```tsx
import { Alert } from '@/components/ui/Alert'

<Alert type="error" message="Credenciales incorrectas" />
<Alert type="success" message="Cambios guardados" />
<Alert type="warning" message="Esta acción no se puede deshacer" />
<Alert type="info" message="El proceso puede tardar unos segundos" />
```

### `Card`

```tsx
import { Card } from '@/components/ui/Card'

<Card className="p-5">
  Contenido con fondo blanco y sombra suave
</Card>
```

### `Toggle`

```tsx
import { Toggle } from '@/components/ui/Toggle'

<Toggle
  checked={isActive}
  onChange={setIsActive}
  label="Activo"
/>
```

### `EmptyState`

```tsx
import { EmptyState } from '@/components/ui/EmptyState'
import { Package } from 'lucide-react'

<EmptyState
  icon={<Package size={40} />}
  title="Sin productos"
  description="Crea tu primer producto para empezar."
  action={<Button variant="primary">Nuevo producto</Button>}
/>
```

### `PageHeader`

```tsx
import { PageHeader } from '@/components/ui/PageHeader'

<PageHeader
  title="Productos"
  subtitle="Gestiona el catálogo de productos"
  actions={<Button variant="primary">Nuevo producto</Button>}
/>
```

### Toast (notificaciones)

Los toasts los provee el contexto `ToastProvider`. Usa el hook `useToast` y llama a `toast(message, type)`:

```tsx
import { useToast } from '@/components/ui/Toast'

const { toast } = useToast()

toast('Producto creado correctamente', 'success')
toast('Error al guardar', 'error')
toast('Los cambios no se han guardado', 'warning')
toast('Atención', 'info')
```

---

## Personalizar el portal (`UserLayout.tsx`)

El fichero que más vas a modificar es `src/layout/UserLayout.tsx`. Controla la navbar y el footer del portal, y se estiliza con clases de Tailwind.

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

      {/* Navbar — personaliza aquí */}
      <header className="h-[60px] shrink-0 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-[100]">

        {/* Logo/nombre de tu empresa */}
        <Link to="/portal" className="flex items-center gap-2 no-underline">
          <QuiverLogo size={26} />
          <span className="text-base font-semibold text-gray-900">Mi Empresa</span>
        </Link>

        {/* Tus enlaces de navegación */}
        <nav className="flex items-center gap-1 ml-2">
          <Link to="/portal/mis-pedidos" className={navLinkClass('/portal/mis-pedidos')}>Mis pedidos</Link>
          <Link to="/portal/facturas"    className={navLinkClass('/portal/facturas')}>Facturas</Link>
          <Link to="/portal/perfil"      className={navLinkClass('/portal/perfil')}>Mi perfil</Link>
        </nav>

        <div className="flex-1" />

        {/* Usuario actual */}
        {user && (
          <span className="text-md text-gray-800">{user.first_name}</span>
        )}
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-8 py-[14px] text-xs text-gray-400">
        © {new Date().getFullYear()} Mi Empresa S.L.
      </footer>
    </div>
  )
}
```

---

## Acceder a los datos del usuario en el frontend

```tsx
import { useAuthStore } from '@/store/auth.store'

const { user, logout } = useAuthStore()

// user.id, user.email, user.first_name, user.last_name
// user.is_superuser, user.roles (array de strings)
// logout() — cierra la sesión y redirige al login
```

---

## Icono library

Quiver usa [lucide-react](https://lucide.dev/) para todos los iconos. Ya está instalado:

```tsx
import { Package, ShoppingCart, Users, Settings, ChevronRight } from 'lucide-react'

<Package size={20} className="text-brand-500" />
```

---

← [Portal](08-portal.md)
