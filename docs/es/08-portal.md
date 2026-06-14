> 🇬🇧 [English version](../08-portal.md)

# Portal de usuario

El portal es una sección separada del admin, pensada para los clientes o usuarios finales de tu aplicación. Tiene su propio layout, su propia autenticación y acceso controlado por roles.

---

## Cómo funciona

- El portal usa los mismos usuarios y autenticación que el admin
- El acceso se controla por roles: el frontend decide qué roles pueden entrar al portal con `VITE_PORTAL_ROLES`; el backend lee la misma lista de `QUIVER_PORTAL_ROLES`
- Los usuarios del portal **no tienen acceso al admin** a menos que sean superuser o tengan permisos de admin
- En desarrollo, el portal muestra un banner informativo con el estado de configuración

---

## Configuración

El control de acceso por rol a la zona `/portal/*` vive en el frontend. Define los roles permitidos en el `.env` del frontend:

```env
VITE_PORTAL_ROLES=cliente,cliente_premium
```

En el backend, define los mismos roles en tu `.env`:

```env
QUIVER_PORTAL_ROLES=cliente,cliente_premium
```

Un usuario con el rol `cliente` o `cliente_premium` podrá acceder al portal en `/portal`. Un usuario sin esos roles será redirigido. Si `VITE_PORTAL_ROLES` se deja vacío, cualquier usuario autenticado puede entrar al portal.

Si el superuser intenta acceder al portal, también puede entrar (sin importar los roles).

---

## Mensaje de bienvenida en producción

En `QUIVER_ENV=production`, el portal muestra la pantalla de bienvenida configurada. Puedes personalizar el mensaje:

```env
QUIVER_PORTAL_WELCOME_MESSAGE=Bienvenido al área de clientes. Tu acceso estará disponible próximamente.
```

O personaliza directamente la página `PortalWelcomePage.tsx` en el frontend. (El frontend decide qué pantalla mostrar usando su propia variable `VITE_QUIVER_ENV`.)

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

La navbar del portal está en `frontend/src/layout/UserLayout.tsx`. Es el fichero principal que vas a modificar para adaptar el portal a tu marca:

```tsx
// frontend/src/layout/UserLayout.tsx
export function UserLayout() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-[60px] ...">
        {/* Cambia el logo y el título aquí */}
        <QuiverLogo size={26} />
        <span>Mi Empresa</span>

        {/* Añade tus propios enlaces de navegación */}
        <Link to="/portal/mis-pedidos">Mis pedidos</Link>
        <Link to="/portal/facturas">Facturas</Link>
      </header>

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

<Can do="portal.invoices">
  <InvoiceList />
</Can>
```

---

## Separar completamente el portal del admin

Si quieres que los usuarios del portal no puedan acceder en absoluto al admin, no les asignes ningún permiso de admin. Los roles de portal (`cliente`, `cliente_premium`) no dan acceso al panel de administración.

Para bloquear también la ruta `/auth/login` del admin a los usuarios del portal, puedes personalizar el `RequireAuth` guard según tus necesidades de seguridad.

---

## API del portal

El portal expone un endpoint de bienvenida (requiere autenticación):

```
GET /quiver/v1/portal/
```

En `QUIVER_ENV=production` devuelve solo el mensaje de bienvenida configurado:

```json
{
  "message": "Bienvenido. Esta sección estará disponible próximamente."
}
```

En desarrollo devuelve información adicional sobre el usuario actual:

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

Y los endpoints de perfil (requieren autenticación):

```
GET    /quiver/v1/portal/me           — datos del usuario actual
PUT    /quiver/v1/portal/me           — actualizar nombre/contraseña
```

Para cambiar la contraseña vía `PUT /me`, envía `current_password` y `new_password`; `first_name` y `last_name` son opcionales.

---

← [Páginas custom](07-paginas-custom.md) | [Frontend →](09-frontend.md)
