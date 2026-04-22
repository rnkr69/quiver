# Portal de usuario

El portal es una sección separada del admin, pensada para los clientes o usuarios finales de tu aplicación. Tiene su propio layout, su propia autenticación y acceso controlado por roles.

---

## Cómo funciona

- El portal usa los mismos usuarios y autenticación que el admin
- El acceso se controla por roles: defines qué roles pueden entrar al portal con `QUIVER_PORTAL_ROLES`
- Los usuarios del portal **no tienen acceso al admin** a menos que sean superuser o tengan permisos de admin
- En desarrollo, el portal muestra un banner informativo con el estado de configuración

---

## Configuración

Define los roles que tienen acceso al portal en tu `.env`:

```env
QUIVER_PORTAL_ROLES=cliente,cliente_premium
```

Un usuario con el rol `cliente` o `cliente_premium` podrá acceder al portal en `/portal`. Un usuario sin esos roles será redirigido al login.

Si el superuser intenta acceder al portal, también puede entrar (sin importar los roles).

---

## Mensaje de bienvenida en producción

En `QUIVER_ENV=production`, el portal muestra la pantalla de bienvenida configurada. Puedes personalizar el mensaje:

```env
QUIVER_PORTAL_WELCOME_MESSAGE=Bienvenido al área de clientes. Tu acceso estará disponible próximamente.
```

O personaliza directamente la página `PortalWelcomePage.tsx` en el frontend.

---

## Páginas del portal incluidas

El portal incluye estas páginas de serie:

| Ruta | Descripción |
|---|---|
| `/portal` | Pantalla de bienvenida |
| `/portal/perfil` | Ver perfil del usuario |
| `/portal/perfil/editar` | Editar nombre y contraseña |

---

## Personalizar el portal

### Navbar del portal (`UserLayout.tsx`)

La navbar del portal está en `quiver-ui/src/layout/UserLayout.tsx`. Es el fichero principal que vas a modificar para adaptar el portal a tu marca:

```tsx
// quiver-ui/src/layout/UserLayout.tsx
export function UserLayout() {
  const { user } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ height: 60, background: 'white', borderBottom: '1px solid var(--gray-200)', ... }}>
        {/* Cambia el logo y el título aquí */}
        <QuiverLogo size={26} />
        <span>Mi Empresa</span>

        {/* Añade tus propios enlaces de navegación */}
        <NavLink to="/portal/mis-pedidos">Mis pedidos</NavLink>
        <NavLink to="/portal/facturas">Facturas</NavLink>
      </nav>

      <main>{/* contenido de las páginas */}</main>

      <footer>© 2025 Mi Empresa S.L.</footer>
    </div>
  )
}
```

### Añadir páginas propias al portal

Consulta la guía de [páginas custom](07-paginas-custom.md) para añadir tus propias pantallas al portal con `@quiver_page(layout="portal", ...)`.

---

## Controlar el acceso dentro del portal

### Por rol (en el frontend)

```tsx
import { HasRole } from '@/components/access/HasRole'

<HasRole role="cliente_premium">
  <PremiumContent />
</HasRole>
```

### Por permiso (permisos custom que tú defines)

Si necesitas control más granular dentro del portal:

```python
# permissions.py
from quiver.rbac.registry import quiver_permission

quiver_permission("portal.invoices", display_name="Ver facturas en portal", group="Portal")
```

```tsx
import { Can } from '@/components/access/Can'

<Can permission="portal.invoices">
  <InvoiceList />
</Can>
```

---

## Separar completamente el portal del admin

Si quieres que los usuarios del portal no puedan acceder en absoluto al admin, no les asignes ningún permiso de admin. Los roles de portal (`cliente`, `cliente_premium`) no dan acceso al panel de administración.

Para bloquear también la ruta `/auth/login` del admin a los usuarios del portal, puedes personalizar el `RequireAuth` guard según tus necesidades de seguridad.

---

## API del portal

El portal expone un endpoint de información:

```
GET /quiver/v1/portal/
```

```json
{
  "message": "Quiver portal",
  "version": "0.1.0",
  "env": "development"
}
```

Y los endpoints de perfil (requieren autenticación):

```
GET    /quiver/v1/portal/me           — datos del usuario actual
PATCH  /quiver/v1/portal/me           — actualizar nombre/contraseña
```

---

← [Páginas custom](07-paginas-custom.md) | [Frontend →](09-frontend.md)
