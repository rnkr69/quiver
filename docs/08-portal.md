> 🇪🇸 [Versión en español](es/08-portal.md)

# User portal

The portal is a section separate from the admin, intended for your application's clients or end users. It has its own layout, its own authentication, and access controlled by roles.

---

## How it works

- The portal uses the same users and authentication as the admin
- Access is controlled by roles: the frontend decides which roles may enter the portal via `VITE_PORTAL_ROLES`; the backend reads the same list from `QUIVER_PORTAL_ROLES`
- Portal users **do not have access to the admin** unless they are superusers or hold admin permissions
- In development, the portal shows an informational banner with the current configuration state

---

## Configuration

The role gate for the `/portal/*` zone lives in the frontend. Define the allowed roles in the frontend's `.env`:

```env
VITE_PORTAL_ROLES=cliente,cliente_premium
```

On the backend, define the same roles in your `.env`:

```env
QUIVER_PORTAL_ROLES=cliente,cliente_premium
```

A user with the `cliente` or `cliente_premium` role will be able to access the portal at `/portal`. A user without those roles is redirected. If `VITE_PORTAL_ROLES` is left empty, any authenticated user can enter the portal.

A superuser can always access the portal too (regardless of roles).

---

## Welcome message in production

When `QUIVER_ENV=production`, the portal shows the configured welcome screen. You can customize the message:

```env
QUIVER_PORTAL_WELCOME_MESSAGE=Welcome to the client area. Your access will be available soon.
```

Or customize the `PortalWelcomePage.tsx` page directly in the frontend. (The frontend decides which screen to show using its own `VITE_QUIVER_ENV` variable.)

---

## Bundled portal pages

The portal ships with these pages out of the box:

| Route | Description |
|---|---|
| `/portal` | Welcome screen |
| `/portal/perfil` | View the user's profile |
| `/portal/perfil/editar` | Edit name and password |

---

## Customizing the portal

### Portal navbar (`UserLayout.tsx`)

The portal navbar lives in `frontend/src/layout/UserLayout.tsx`. This is the main file you'll modify to adapt the portal to your brand:

```tsx
// frontend/src/layout/UserLayout.tsx
export function UserLayout() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-[60px] ...">
        {/* Change the logo and the title here */}
        <QuiverLogo size={26} />
        <span>My Company</span>

        {/* Add your own navigation links */}
        <Link to="/portal/mis-pedidos">My orders</Link>
        <Link to="/portal/facturas">Invoices</Link>
      </header>

      <main>{/* page content */}</main>

      <footer>© 2025 My Company Ltd.</footer>
    </div>
  )
}
```

### Adding your own pages to the portal

See the [custom pages](07-custom-pages.md) guide to add your own screens to the portal with `@quiver_page(layout="portal", ...)`.

---

## Controlling access inside the portal

### By role (frontend)

```tsx
import { HasRole } from '@/components/access/HasRole'

<HasRole role="cliente_premium">
  <PremiumContent />
</HasRole>
```

### By permission (custom permissions you define)

If you need finer-grained control inside the portal:

```python
# permissions.py
from quiver.rbac.registry import quiver_permission

quiver_permission("portal.invoices", display_name="View invoices in portal", group="Portal")
```

```tsx
import { Can } from '@/components/access/Can'

<Can do="portal.invoices">
  <InvoiceList />
</Can>
```

---

## Fully separating the portal from the admin

If you want portal users to have no access to the admin at all, don't assign them any admin permissions. The portal roles (`cliente`, `cliente_premium`) do not grant access to the administration panel.

To also block the admin's `/auth/login` route for portal users, you can customize the `RequireAuth` guard to fit your security needs.

---

## Portal API

The portal exposes a welcome endpoint (requires authentication):

```
GET /quiver/v1/portal/
```

In `QUIVER_ENV=production` it returns only the configured welcome message:

```json
{
  "message": "Welcome. This section will be available soon."
}
```

In development it returns additional info about the current user:

```json
{
  "message": "Bienvenido al portal — modo development",
  "env": "development",
  "version": "1.0.0",
  "user": {
    "name": "Jane Doe",
    "roles": ["cliente"]
  }
}
```

And the profile endpoints (require authentication):

```
GET    /quiver/v1/portal/me           — current user's data
PUT    /quiver/v1/portal/me           — update name/password
```

To change the password via `PUT /me`, send `current_password` and `new_password`; `first_name` and `last_name` are optional.

---

← [Custom pages](07-custom-pages.md) | [Frontend →](09-frontend.md)
