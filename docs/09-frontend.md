# Frontend

El frontend de Quiver es una aplicación React + TypeScript que copias a tu proyecto. Esta guía cubre la personalización: tokens de diseño, componentes reutilizables y cómo estructurar tus propias páginas.

---

## Estructura de ficheros

```
quiver-ui/
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
│       └── menu.store.ts     # Estado del menú
├── index.html               # CSS variables del sistema de diseño
└── .env.local
```

---

## Tokens de diseño (CSS variables)

Todos los estilos del frontend usan CSS custom properties definidas en `index.html`. Puedes sobreescribirlas para cambiar la apariencia de toda la app:

```css
/* index.html — sección :root */
:root {
  /* Colores de marca — cámbialos para adaptar Quiver a tu identidad */
  --brand-500: #009ca6;   /* color principal */
  --brand-400: #00b3be;
  --brand-600: #007a83;
  --brand-50:  #e6f7f8;   /* fondos sutiles */
  --brand-100: #b3e8ec;
  --brand-700: #005e63;   /* texto sobre fondo de marca */

  /* Escala de grises */
  --gray-50:  #f9f9f9;
  --gray-100: #f3f3f3;
  --gray-200: #e8e8e8;
  --gray-300: #d4d4d4;
  --gray-400: #c0c0c0;
  --gray-500: #adadad;
  --gray-600: #8a8a8a;
  --gray-700: #6b6b6b;
  --gray-800: #3d3d3d;
  --gray-900: #1a1a1a;

  /* Estado */
  --success-500: #2d9e6b;
  --success-50:  #edf7f2;
  --danger-500:  #d94040;
  --danger-50:   #fdf0f0;
  --warning-500: #c78b1a;
  --warning-50:  #fdf6e6;

  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
}
```

Para cambiar el color principal de Quiver a, por ejemplo, un azul corporativo:

```css
:root {
  --brand-500: #2563eb;
  --brand-400: #3b82f6;
  --brand-600: #1d4ed8;
  --brand-50:  #eff6ff;
  --brand-100: #dbeafe;
  --brand-700: #1e40af;
}
```

---

## Componentes UI disponibles

Todos los componentes están en `src/components/ui/` y usan los tokens CSS del sistema de diseño.

### `Button`

```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" onClick={handleClick}>Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="ghost">Más opciones</Button>
<Button variant="link" href="/ruta">Enlace</Button>

// Con icono
import { Plus } from 'lucide-react'
<Button variant="primary" icon={<Plus size={14} />}>Nuevo</Button>

// Cargando
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
  help_text="Máximo 100 caracteres"
/>

<PasswordInput label="Contraseña" value={pass} onChange={...} />

<QSelect label="Estado" value={status} onChange={...}>
  <option value="active">Activo</option>
  <option value="inactive">Inactivo</option>
</QSelect>

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

<Card style={{ padding: 20 }}>
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

```tsx
import { useToast } from '@/store/toast.store'

const { toast } = useToast()

toast({ type: 'success', message: 'Producto creado correctamente' })
toast({ type: 'error',   message: 'Error al guardar' })
toast({ type: 'warning', message: 'Los cambios no se han guardado' })
```

---

## Personalizar el portal (`UserLayout.tsx`)

El fichero que más vas a modificar es `src/layout/UserLayout.tsx`. Controla la navbar y el footer del portal.

```tsx
// src/layout/UserLayout.tsx
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'

export function UserLayout() {
  const { user, logout } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>

      {/* Navbar — personaliza aquí */}
      <nav style={{ height: 60, background: 'white', borderBottom: '1px solid var(--gray-200)',
        display: 'flex', alignItems: 'center', padding: '0 32px', gap: 24, position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Logo/nombre de tu empresa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <QuiverLogo size={26} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Mi Empresa</span>
        </div>

        {/* Tus enlaces de navegación */}
        <NavLink to="/portal/mis-pedidos" style={navLinkStyle}>Mis pedidos</NavLink>
        <NavLink to="/portal/facturas"    style={navLinkStyle}>Facturas</NavLink>
        <NavLink to="/portal/perfil"      style={navLinkStyle}>Mi perfil</NavLink>

        {/* Usuario actual */}
        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{user?.first_name}</span>
        <button onClick={logout}>Salir</button>
      </nav>

      {/* Contenido */}
      <main style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: 32 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid var(--gray-200)', padding: '14px 32px', fontSize: 12, color: 'var(--gray-500)' }}>
        © 2025 Mi Empresa S.L.
      </footer>
    </div>
  )
}
```

---

## Acceder a los datos del usuario en el frontend

```tsx
import { useAuthStore } from '@/store/auth.store'

const { user } = useAuthStore()

// user.id, user.email, user.first_name, user.last_name
// user.is_superuser, user.roles (array de strings)
```

---

## Icono library

Quiver usa [lucide-react](https://lucide.dev/) para todos los iconos. Ya está instalado:

```tsx
import { Package, ShoppingCart, Users, Settings, ChevronRight } from 'lucide-react'

<Package size={20} color="var(--brand-500)" />
```

---

← [Portal](08-portal.md)
