import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from '@/guards/RequireAuth'
import { RequireRole } from '@/guards/RequireRole'
import { AdminLayout } from '@/layout/AdminLayout'
import { UserLayout } from '@/layout/UserLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { RolesPage } from '@/pages/roles/RolesPage'
import { RoleEditPage } from '@/pages/roles/RoleEditPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { UserCreateEditPage } from '@/pages/users/UserCreateEditPage'
import { UserDetailPage } from '@/pages/users/UserDetailPage'
import { PortalWelcomePage } from '@/pages/portal/PortalWelcomePage'
import { ProfilePage } from '@/pages/portal/ProfilePage'
import { EditProfilePage } from '@/pages/portal/EditProfilePage'
import { DynamicRoutes } from '@/plugin/DynamicRoutes'

const PORTAL_ROLES = (import.meta.env.VITE_PORTAL_ROLES as string | undefined)
  ?.split(',').map(r => r.trim()).filter(Boolean) ?? []

export const router = createBrowserRouter([
  // Auth zone — no guards
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/auth/reset-password', element: <ResetPasswordPage /> },

  // Admin zone
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <RequireRole roles={['admin']}>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      // Users
      { path: 'users', element: <UsersPage /> },
      { path: 'users/new', element: <UserCreateEditPage mode="create" /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'users/:id/edit', element: <UserCreateEditPage mode="edit" /> },
      // Roles
      { path: 'roles', element: <RolesPage /> },
      { path: 'roles/:id/edit', element: <RoleEditPage /> },
      // Dynamic pages + CRUD fallback (DynamicRoutes handles both, giving priority to @quiver_page routes)
      { path: '*', element: <DynamicRoutes zone="admin" /> },
    ],
  },

  // Portal zone
  {
    path: '/portal',
    element: (
      <RequireAuth>
        {PORTAL_ROLES.length > 0
          ? <RequireRole roles={PORTAL_ROLES}><UserLayout /></RequireRole>
          : <UserLayout />}
      </RequireAuth>
    ),
    children: [
      { index: true, element: <PortalWelcomePage /> },
      { path: 'perfil', element: <ProfilePage /> },
      { path: 'perfil/editar', element: <EditProfilePage /> },
      { path: '*', element: <DynamicRoutes zone="portal" /> },
    ],
  },

  // Error pages
  { path: '/403', element: <ForbiddenPage /> },

  // Root redirect
  { path: '/', element: <Navigate to="/auth/login" replace /> },
])
