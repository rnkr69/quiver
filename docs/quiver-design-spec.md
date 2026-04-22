# Quiver — Especificación de Diseño UI

> Documento de entrada para Claude Design. Define el sistema de diseño, los layouts y todas las pantallas del MVP. Destino final: aplicaciones empresariales internas. Tono: sobrio, funcional, elegante.

---

## 1. Sistema de diseño

### 1.1 Filosofía visual

Quiver es una herramienta de trabajo para usuarios internos de empresa. El diseño debe priorizar:

- **Claridad sobre creatividad** — el usuario necesita encontrar la información rápido, no admirar el diseño.
- **Densidad cómoda** — más información visible sin sensación de agobio. Espaciado generoso pero no derrochador.
- **Jerarquía visual fuerte** — el usuario sabe en todo momento dónde está y qué puede hacer.
- **Sin decoración gratuita** — sin gradientes complejos, ilustraciones, ni efectos llamativos. La elegancia viene de la proporción y el detalle.

Referentes: Linear, Basecamp, Notion en modo tabla, Railway dashboard.

---

### 1.2 Paleta de colores

#### Colores de marca

| Nombre | Hex | Uso |
|---|---|---|
| `brand-500` | `#009ca6` | Color principal. Botones primarios, links activos, indicadores de progreso, focus rings. |
| `brand-400` | `#00b3be` | Hover de elementos brand. |
| `brand-600` | `#007a83` | Active / pressed de elementos brand. |
| `brand-50` | `#e6f7f8` | Fondo de alertas informativas, filas seleccionadas, badges de estado activo. |
| `brand-100` | `#b3e8ec` | Bordes de elementos brand sobre fondo claro. |
| `brand-700` | `#005e63` | Texto sobre fondos brand claros (brand-50). |

#### Grises (neutros)

| Nombre | Hex | Uso |
|---|---|---|
| `gray-500` | `#adadad` | Color secundario. Iconos inactivos, bordes estándar, texto placeholder. |
| `gray-50` | `#f9f9f9` | Fondo de página, fondo de sidebar. |
| `gray-100` | `#f3f3f3` | Fondo de filas alternas, hover de elementos neutros. |
| `gray-200` | `#e8e8e8` | Bordes de cards, divisores. |
| `gray-300` | `#d4d4d4` | Bordes de inputs, separadores. |
| `gray-400` | `#c0c0c0` | Placeholder text, iconos deshabilitados. |
| `gray-600` | `#8a8a8a` | Texto secundario, etiquetas, metadatos. |
| `gray-700` | `#6b6b6b` | Texto de apoyo, subtítulos. |
| `gray-800` | `#3d3d3d` | Texto principal en fondos blancos. |
| `gray-900` | `#1a1a1a` | Títulos, texto de mayor jerarquía. |

#### Semánticos

| Nombre | Hex | Uso |
|---|---|---|
| `success-500` | `#2d9e6b` | Confirmaciones, estados activos, badges de éxito. |
| `success-50` | `#edf7f2` | Fondo de alertas de éxito. |
| `danger-500` | `#d94040` | Errores, acciones destructivas, validaciones fallidas. |
| `danger-50` | `#fdf0f0` | Fondo de alertas de error. |
| `warning-500` | `#c78b1a` | Advertencias, estados pendientes. |
| `warning-50` | `#fdf6e6` | Fondo de alertas de advertencia. |
| `white` | `#ffffff` | Fondo de cards, modales, formularios. |

---

### 1.3 Tipografía

**Familia:** Inter (sans-serif system font stack como fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).

| Nombre | Tamaño | Peso | Line-height | Uso |
|---|---|---|---|---|
| `display` | 24px | 600 | 1.3 | Títulos de página |
| `heading-lg` | 20px | 600 | 1.3 | Títulos de sección, nombres de módulo |
| `heading-md` | 16px | 600 | 1.4 | Subtítulos de card, cabeceras de tabla |
| `heading-sm` | 14px | 600 | 1.4 | Labels de campo, cabeceras de columna |
| `body-lg` | 15px | 400 | 1.6 | Texto descriptivo, párrafos |
| `body-md` | 14px | 400 | 1.5 | Texto estándar, contenido de tabla |
| `body-sm` | 13px | 400 | 1.5 | Metadatos, timestamps, texto auxiliar |
| `label` | 12px | 500 | 1.4 | Labels de formulario, badges, pills |
| `mono` | 13px | 400 | 1.5 | Código, IDs, slugs |

---

### 1.4 Espaciado

Sistema de 4px base.

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80`

- **Padding interno de componentes:** 8px (sm), 12px (md), 16px (lg)
- **Gap entre componentes relacionados:** 8px–16px
- **Gap entre secciones:** 24px–32px
- **Padding de página:** 24px lateral, 24px superior

---

### 1.5 Bordes y radios

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 4px | Badges, pills, inputs |
| `radius-md` | 6px | Botones, cards pequeñas |
| `radius-lg` | 8px | Cards principales, modales, dropdowns |
| `radius-xl` | 12px | Paneles, drawers |
| `border-default` | `1px solid #e8e8e8` | Bordes de cards y contenedores |
| `border-input` | `1px solid #d4d4d4` | Bordes de inputs en reposo |
| `border-focus` | `2px solid #009ca6` | Bordes de inputs con foco |

---

### 1.6 Sombras

Mínimas. Solo para elementos que flotan sobre el contenido.

| Token | Valor | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards, inputs elevados |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Dropdowns, tooltips |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modales |

---

### 1.7 Componentes base

#### Botones

| Variante | Fondo | Texto | Hover | Uso |
|---|---|---|---|---|
| `primary` | `#009ca6` | `white` | `#007a83` | Acción principal de la pantalla |
| `secondary` | `white` | `#3d3d3d` | `#f3f3f3` | Acciones secundarias, cancelar |
| `danger` | `white` | `#d94040` | `#fdf0f0` | Borrar, desactivar |
| `ghost` | `transparent` | `#6b6b6b` | `#f3f3f3` | Acciones terciarias, iconos |
| `link` | `transparent` | `#009ca6` | underline | Links inline |

Tamaños: `sm` (28px alto, padding 8px·12px), `md` (32px alto, padding 8px·16px), `lg` (38px alto, padding 10px·20px).

#### Inputs

Estado reposo: fondo `white`, borde `gray-300`, radio `4px`.
Estado foco: borde `2px solid brand-500`, sombra `0 0 0 3px rgba(0,156,166,0.12)`.
Estado error: borde `danger-500`, mensaje de error en `danger-500` bajo el input.
Estado deshabilitado: fondo `gray-50`, texto `gray-400`.

#### Badges / Pills

```
Activo     → fondo brand-50  · texto brand-700  · borde brand-100
Inactivo   → fondo gray-100  · texto gray-600   · borde gray-200
Éxito      → fondo success-50 · texto success-500
Error      → fondo danger-50  · texto danger-500
Advertencia → fondo warning-50 · texto warning-500
Admin      → fondo #1a1a2e (oscuro) · texto white
Cliente    → fondo brand-50 · texto brand-700
```

#### Tabla

- Cabecera: fondo `gray-50`, texto `heading-sm`, borde inferior `gray-200`.
- Fila estándar: fondo `white`, borde inferior `gray-100`.
- Fila hover: fondo `gray-50`.
- Fila seleccionada: fondo `brand-50`, borde izquierdo `3px solid brand-500`.
- Texto de celda: `body-md`, `gray-800`.
- Texto de celda secundario (metadatos): `body-sm`, `gray-600`.

---

## 2. Layouts

### 2.1 AuthLayout

Pantalla centrada, sin sidebar. Fondo `gray-50`.

```
┌─────────────────────────────────────┐
│           fondo gray-50             │
│                                     │
│         [logo + nombre app]         │  ← centrado, parte superior
│                                     │
│    ┌───────────────────────────┐    │
│    │   card blanca             │    │  ← ancho máx 400px, shadow-md
│    │   radio-lg, padding 32px  │    │
│    │                           │    │
│    │   [contenido de la pág.]  │    │
│    │                           │    │
│    └───────────────────────────┘    │
│                                     │
│     © 2025 Nombre empresa           │  ← pie, body-sm, gray-500
└─────────────────────────────────────┘
```

### 2.2 AdminLayout

Sidebar fijo izquierda + topbar fija arriba + área de contenido scrollable.

```
┌──────────┬──────────────────────────────────────┐
│          │  TOPBAR (56px alto, bg white,         │
│          │  borde inferior gray-200)             │
│ SIDEBAR  ├──────────────────────────────────────┤
│ (240px   │                                       │
│ bg       │  breadcrumbs (body-sm, gray-600)      │
│ gray-50, │  título de página (display)           │
│ borde    │                                       │
│ derecho  │  ─────────────────────────────────    │
│ gray-200)│                                       │
│          │  CONTENIDO PRINCIPAL                  │
│          │  padding 24px                         │
│          │  max-width 1200px                     │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

**Sidebar — anatomía:**
- Cabecera (64px): logo + nombre de la app. Fondo `white`, borde inferior `gray-200`.
- Navegación: items con icono + label. Item activo: fondo `brand-50`, texto `brand-700`, borde izquierdo `3px solid brand-500`. Item hover: fondo `gray-100`.
- Grupos de navegación: label de grupo en `label`, `gray-500`, mayúsculas, sin icono, no clicable.
- Pie del sidebar: avatar + nombre usuario + botón logout.

**Topbar — anatomía:**
- Izquierda: botón hamburguesa (solo visible ≤1024px) + breadcrumbs.
- Derecha: link "Ver portal" (si aplica) + nombre usuario + avatar initials.

### 2.3 UserLayout

Completamente personalizable por el proyecto. La especificación define solo la estructura mínima de partida:

```
┌─────────────────────────────────────┐
│  NAVBAR (60px, bg white,            │
│  borde inferior gray-200)           │
│  logo izq · nav centro · avatar der │
├─────────────────────────────────────┤
│                                     │
│  CONTENIDO PRINCIPAL                │
│  max-width 1100px, centrado         │
│  padding 32px lateral               │
│                                     │
├─────────────────────────────────────┤
│  FOOTER (bg gray-50,                │
│  borde superior gray-200)           │
└─────────────────────────────────────┘
```

---

## 3. Pantallas

---

### SCREEN-01 — Login

**Ruta:** `/auth/login`
**Layout:** AuthLayout
**Acceso:** público

**Propósito:** Punto de entrada único al sistema. Primera impresión del producto.

**Estructura visual:**

```
[logo Quiver / app]       ← 48px, centrado, margin-bottom 8px
[nombre aplicación]       ← heading-lg, gray-900, centrado

─── card (400px ancho) ───────────────────────────

  Bienvenido                ← heading-md, gray-900
  Accede a tu cuenta        ← body-sm, gray-600, margin-bottom 24px

  Email                     ← label
  [input email            ] ← type=email, placeholder "nombre@empresa.com"

  Contraseña                ← label
  [input password   ] [👁]  ← toggle mostrar/ocultar contraseña

  [  Iniciar sesión       ] ← botón primary, full-width, lg

  ¿Olvidaste tu contraseña? ← link, centrado, body-sm

──────────────────────────────────────────────────
```

**Estados:**

- *Cargando:* el botón muestra spinner + texto "Entrando…" y queda deshabilitado.
- *Error de credenciales:* alerta inline sobre el botón, fondo `danger-50`, borde `danger-500`, icono de error + "Email o contraseña incorrectos."
- *Cuenta inactiva:* misma alerta con "Tu cuenta está desactivada. Contacta con el administrador."
- *Campo vacío al enviar:* borde rojo en el campo + mensaje bajo el input.

**Comportamiento:**
- Enter en cualquier campo envía el formulario.
- Tras login exitoso redirige según el campo `redirect_to` de la respuesta.

---

### SCREEN-02 — Recuperar contraseña

**Ruta:** `/auth/forgot-password`
**Layout:** AuthLayout
**Acceso:** público

**Estructura visual:**

```
← Volver al login         ← link, brand-500, body-sm, arriba izquierda card

Recuperar contraseña      ← heading-md, gray-900
Introduce tu email y te   ← body-sm, gray-600
enviaremos un enlace.

Email                     ← label
[input email            ]

[  Enviar enlace         ] ← botón primary, full-width
```

**Estado tras envío:**

```
✓ Enlace enviado           ← heading-sm, success-500
Si el email existe, recibirás un enlace en breve.
Revisa también tu carpeta de spam.

[  Volver al login       ] ← botón secondary
```

---

### SCREEN-03 — Restablecer contraseña

**Ruta:** `/auth/reset-password?token=...`
**Layout:** AuthLayout
**Acceso:** público

**Estructura visual:**

```
Nueva contraseña          ← heading-md
Elige una contraseña segura para tu cuenta.  ← body-sm, gray-600

Nueva contraseña          ← label
[input password   ] [👁]

Confirmar contraseña      ← label
[input password   ] [👁]

[  Guardar contraseña    ] ← botón primary, full-width
```

**Estados:**
- *Token inválido / expirado:* la card muestra un estado de error con botón "Solicitar nuevo enlace" que lleva a `/auth/forgot-password`.
- *Token ya usado:* mensaje específico + mismo botón.
- *Contraseñas no coinciden:* error inline antes de enviar.
- *Éxito:* mensaje de confirmación + aviso de cierre de sesiones en todos los dispositivos + botón "Ir al login".

---

### SCREEN-04 — Dashboard admin

**Ruta:** `/admin`
**Layout:** AdminLayout
**Acceso:** rol `admin`

**Estructura visual:**

```
Buenos días, [nombre]     ← heading-lg, gray-900
[fecha actual]            ← body-sm, gray-600

── grid de widgets ────────────────────────────────

[ StatCard ]  [ StatCard ]  [ StatCard ]  [ StatCard ]
    4 columnas en escritorio, 2 en tablet, 1 en móvil

[ ChartWidget — ancho completo o 2/3 ]
[ StatCard vertical o widget adicional ]

────────────────────────────────────────────────────
```

**StatCard — anatomía:**

```
┌────────────────────────────────┐
│  [icono 20px, brand-500]       │
│                                │
│  1.432                         │  ← display, gray-900
│  Usuarios registrados          │  ← body-sm, gray-600
│                                │
│  ↑ 12% respecto al mes pasado  │  ← body-sm, success-500 (opcional)
└────────────────────────────────┘
card: bg white · border gray-200 · radius-lg · padding 20px · shadow-sm
```

**ChartWidget — anatomía:**

```
┌────────────────────────────────────────────────┐
│  Título del gráfico          [Mes ▾] [Año ▾]   │  ← controles opcionales
│                                                  │
│  [área del gráfico Recharts — altura 200px]      │
│                                                  │
└────────────────────────────────────────────────┘
```

**Estado vacío** (sin widgets configurados):

```
[icono cuadrícula, 40px, gray-300]
No hay widgets configurados
Añade widgets en la configuración del panel.   ← body-sm, gray-500
```

---

### SCREEN-05 — Listado CRUD (genérico)

**Ruta:** `/admin/{resource}`
**Layout:** AdminLayout
**Acceso:** permiso `{resource}.list`

**Estructura visual:**

```
Productos                 ← display, gray-900       (título del resource)
1.432 registros           ← body-sm, gray-600

┌─ barra de herramientas ──────────────────────────────────────────────┐
│ [🔍 Buscar...        ] [Filtros ▾]  [columnas visibles]  [+ Crear]  │
└──────────────────────────────────────────────────────────────────────┘

┌─ panel de filtros activos (colapsado por defecto) ───────────────────┐
│ Estado: [Activo ×]  Categoría: [Electrónica ×]   [Limpiar todo]     │
└──────────────────────────────────────────────────────────────────────┘

┌─ tabla ──────────────────────────────────────────────────────────────┐
│ □  Nombre ↕     Precio ↕     Estado      Categoría   Creado ↕  ⋯   │  ← cabecera
│────────────────────────────────────────────────────────────────────  │
│ □  Producto A   € 49,99  [Activo  ]  Electrónica  12/03/25   [···]  │
│ □  Producto B   € 12,00  [Inactivo]  Ropa         08/01/25   [···]  │
│ □  Producto C   € 299,00 [Activo  ]  Hogar        01/12/24   [···]  │
└──────────────────────────────────────────────────────────────────────┘

┌─ paginación ────────────────────────────────────────────────────────┐
│ Mostrando 1–25 de 1.432     [←] [1] [2] [3] … [58] [→]   25 ▾    │
└─────────────────────────────────────────────────────────────────────┘
```

**Menú de acciones de fila `[···]`:**
```
┌──────────────┐
│  Ver         │
│  Editar      │
│  ─────────── │
│  Eliminar    │  ← texto danger-500
└──────────────┘
```

**Estado de selección múltiple:**
```
┌─ barra bulk ────────────────────────────────────────────────────────┐
│  12 seleccionados  [Cancelar]              [🗑 Eliminar (12)]       │
│  bg brand-50 · borde superior brand-500                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Estado vacío** (sin registros):
```
[icono caja vacía, 40px, gray-300]
No hay registros todavía
[+ Crear primer Producto]   ← botón primary
```

**Estado vacío con filtros activos:**
```
[icono búsqueda, 40px, gray-300]
No se encontraron resultados
Prueba con otros términos o limpia los filtros.
[Limpiar filtros]   ← botón secondary
```

**Estado cargando:**
- Skeleton de filas: 8 filas con bloques grises animados (pulse).

---

### SCREEN-06 — Crear registro (genérico)

**Ruta:** `/admin/{resource}/new`
**Layout:** AdminLayout
**Acceso:** permiso `{resource}.create`

**Estructura visual:**

```
← Productos               ← link de vuelta al listado, brand-500, body-sm

Nuevo producto            ← display, gray-900

┌─ card formulario ─────────────────────────────────────────────────┐
│                                                                     │
│  Nombre del producto *              ← label + indicador requerido  │
│  [input text                     ]                                  │
│                                                                     │
│  Precio *                                                           │
│  [input number  €              ]                                    │
│                                                                     │
│  Categoría                                                          │
│  [select ▾                       ]                                  │
│                                                                     │
│  Descripción                                                        │
│  [textarea                                                        ] │
│                                                                     │
│  Activo                                                             │
│  [toggle ●──] Producto visible en el sistema                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                    [Cancelar]  [Guardar producto]
                    ← alineado a la derecha, fuera de la card
```

**Comportamiento de validación:** los errores aparecen bajo cada campo en `danger-500`, `body-sm`. No se usa una alerta global de error.

**Estado guardando:** botón "Guardar" con spinner, deshabilitado.

**Éxito:** toast en esquina superior derecha, fondo `success-50`, borde `success-500`: "Producto creado correctamente." Dura 4 segundos.

---

### SCREEN-07 — Editar registro (genérico)

**Ruta:** `/admin/{resource}/{id}/edit`
**Layout:** AdminLayout
**Acceso:** permiso `{resource}.update`

Idéntico a SCREEN-06 con las siguientes diferencias:

- Título: "Editar [nombre del registro]" — usando el campo principal del registro como identificador humano.
- Los campos aparecen pre-rellenados con los valores actuales.
- Existe un tercer botón "Ver" (ghost) a la izquierda de las acciones.
- El campo `password` aparece vacío — solo se actualiza si el usuario escribe algo.

---

### SCREEN-08 — Detalle de registro (genérico)

**Ruta:** `/admin/{resource}/{id}`
**Layout:** AdminLayout
**Acceso:** permiso `{resource}.show`

**Estructura visual:**

```
← Productos

[Nombre del registro]     ← display, gray-900
Creado el 12 mar 2025     ← body-sm, gray-600

                          [Editar]  [Eliminar]   ← solo si tiene permisos

┌─ card de detalle ──────────────────────────────────────────────────┐
│                                                                     │
│  Nombre                    Precio                                   │
│  Auriculares Premium       € 299,00                                 │
│                                                                     │
│  Categoría                 Estado                                   │
│  Electrónica               [Activo  ]                               │
│                                                                     │
│  Descripción                                                        │
│  Texto de la descripción del producto aquí...                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Layout de campos: grid de 2 columnas en escritorio, 1 columna en móvil. Cada campo: label en `label`, `gray-600` arriba; valor en `body-md`, `gray-900` abajo.

---

### SCREEN-09 — Gestión de usuarios admin

**Ruta:** `/admin/users`
**Layout:** AdminLayout
**Acceso:** permiso `users.list`

Basada en SCREEN-05 (Listado CRUD) con columnas específicas:

| Columna | Tipo | Notas |
|---|---|---|
| Avatar + Nombre completo | custom | Initials en círculo brand-50/brand-500 + nombre + email en gris |
| Roles | badges | Un badge por rol |
| Estado | badge | Activo (success) / Inactivo (gray) |
| Último acceso | texto | Fecha formateada o "Nunca" en gris |
| Acciones | acciones | Ver · Editar · Desactivar |

La acción "Desactivar" reemplaza a "Eliminar" para usuarios. Texto `warning-500`.

---

### SCREEN-10 — Crear / Editar usuario

**Ruta:** `/admin/users/new` y `/admin/users/{id}/edit`
**Layout:** AdminLayout
**Acceso:** permisos `users.create` / `users.update`

**Estructura visual:**

```
← Usuarios

Nuevo usuario             ← display

┌─ card ─────────────────────────────────────────────────────────────┐
│                                                                     │
│  Nombre *                   Apellidos *                            │
│  [input               ]     [input               ]                 │
│                                                                     │
│  Email *                                                            │
│  [input email                                    ]                 │
│                                                                     │
│  Contraseña *  (solo en creación / opcional en edición)            │
│  [input password  ] [👁]                                           │
│  Mínimo 8 caracteres   ← body-sm, gray-500                         │
│                                                                     │
│  Roles                                                              │
│  [Admin ×] [Cliente ×]  [+ Añadir rol ▾]   ← tags removibles      │
│                                                                     │
│  Estado                                                             │
│  [toggle] Usuario activo                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                    [Cancelar]  [Guardar]
```

---

### SCREEN-11 — Detalle de usuario

**Ruta:** `/admin/users/{id}`
**Layout:** AdminLayout
**Acceso:** permiso `users.show`

**Estructura visual:**

```
← Usuarios

┌─ header de usuario ───────────────────────────────────────────────┐
│  [Avatar 56px]  María García               [Editar] [Desactivar]  │
│                 maria@empresa.com                                   │
│                 [Admin] [Cliente Premium]  ← badges de roles       │
└─────────────────────────────────────────────────────────────────────┘

┌─ info ─────────────────────────────────────────────────────────────┐
│                                                                     │
│  Nombre              Apellidos                                      │
│  María               García                                         │
│                                                                     │
│  Email               Estado                                         │
│  maria@empresa.com   [Activo  ]                                     │
│                                                                     │
│  Miembro desde       Último acceso                                  │
│  12 mar 2024         Hace 2 horas                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### SCREEN-12 — Gestión de roles

**Ruta:** `/admin/roles`
**Layout:** AdminLayout
**Acceso:** permiso `roles.list`

**Estructura visual:**

```
Roles y permisos          ← display

                                          [+ Nuevo rol]

┌─────────────────┬──────────────────┬──────────┬──────────┬────────┐
│ Nombre          │ Descripción      │ Permisos │ Usuarios │        │
├─────────────────┼──────────────────┼──────────┼──────────┼────────┤
│ Admin           │ Acceso completo  │ 24       │ 3        │ [···]  │
│ Cliente         │ Acceso al portal │ 2        │ 148      │ [···]  │
│ Cliente Premium │ Portal completo  │ 5        │ 34       │ [···]  │
└─────────────────┴──────────────────┴──────────┴──────────┴────────┘
```

No hay paginación (los roles son pocos). La tabla tiene estilo más limpio, sin bulk actions.

---

### SCREEN-13 — Editar rol y permisos

**Ruta:** `/admin/roles/{id}/edit`
**Layout:** AdminLayout
**Acceso:** permiso `roles.update`

**Estructura visual:**

```
← Roles

Editar rol: Cliente Premium    ← display
Slug: cliente_premium          ← mono, gray-500  (no editable)

┌─ info básica ───────────────────────────────────────────────────────┐
│  Nombre visible *                                                    │
│  [input text: "Cliente Premium"          ]                          │
│                                                                      │
│  Descripción                                                         │
│  [textarea: "Acceso completo al portal"  ]                          │
└──────────────────────────────────────────────────────────────────────┘

┌─ permisos ──────────────────────────────────────────────────────────┐
│  Asigna los permisos que tendrá este rol.                            │
│                                                                      │
│  Productos                         [Seleccionar todos]              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ☑ Listar productos      ☑ Ver producto     □ Crear producto  │   │
│  │ □ Editar producto       □ Eliminar producto                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Usuarios                          [Seleccionar todos]              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ □ Listar usuarios       □ Ver usuario      □ Crear usuario   │   │
│  │ □ Editar usuario        □ Desactivar usuario                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Reportes                          [Seleccionar todos]              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ☑ Ver reportes          □ Exportar reportes                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [Desmarcar todos los permisos]               [Guardar cambios]     │
│                              ← nota: los cambios tardan hasta 15 min │
└──────────────────────────────────────────────────────────────────────┘
```

Cada grupo de permisos es una sección con borde `gray-200`, fondo `white`, `radius-md`. Los checkboxes usan el color `brand-500` cuando están marcados.

---

### SCREEN-14 — Portal Welcome (modo development)

**Ruta:** `/portal`
**Layout:** UserLayout
**Acceso:** roles de portal

```
┌─ banner informativo ────────────────────────────────────────────────┐
│  [icono tool]  Estás viendo la página de bienvenida por defecto.    │
│  Edita src/pages/portal/PortalWelcomePage.tsx para personalizarla.  │
│  bg brand-50 · borde brand-100 · body-sm                            │
└──────────────────────────────────────────────────────────────────────┘

                   [logo / icono Quiver, 48px]

    Portal activo                 ← heading-lg, gray-900, centrado
    Esta es la zona de usuario.   ← body-md, gray-600, centrado

┌── info de sesión ──────────────────────────────────────────────────┐
│  Usuario:  maria@empresa.com                                        │
│  Roles:    [Cliente Premium]                                        │
│  Entorno:  development                                              │
│  Versión:  Quiver 0.1.0                                             │
│  bg gray-50 · border gray-200 · radius-lg · mono, body-sm          │
└─────────────────────────────────────────────────────────────────────┘

[ Ver documentación de Quiver ]   ← botón secondary
```

---

### SCREEN-15 — Portal Welcome (modo production)

**Ruta:** `/portal`
**Layout:** UserLayout
**Acceso:** roles de portal

```
   [logo de la aplicación]

   Bienvenido               ← heading-lg, gray-900, centrado
   Esta sección estará disponible próximamente.   ← body-md, gray-600

   [Volver al inicio]       ← botón secondary (si hay página de inicio)
```

Fondo limpio, sin información técnica.

---

### SCREEN-16 — Perfil de usuario (portal)

**Ruta:** `/portal/perfil`
**Layout:** UserLayout
**Acceso:** autenticado

```
Mi perfil                 ← heading-lg

┌─ card ─────────────────────────────────────────────────────────────┐
│                                                                     │
│  [Avatar 64px]   María García              [Editar perfil]         │
│                  maria@empresa.com                                   │
│                  [Cliente Premium]  ← badge de rol                 │
│                                                                     │
│  ─────────────────────────────────────────────────────────────     │
│                                                                     │
│  Nombre              Apellidos                                      │
│  María               García                                         │
│                                                                     │
│  Email                                                              │
│  maria@empresa.com   (no editable)                                  │
│                                                                     │
│  Miembro desde                                                      │
│  12 de marzo de 2024                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### SCREEN-17 — Editar perfil (portal)

**Ruta:** `/portal/perfil/editar`
**Layout:** UserLayout
**Acceso:** autenticado

```
← Mi perfil

Editar perfil             ← heading-lg

┌─ card ─────────────────────────────────────────────────────────────┐
│                                                                     │
│  Nombre *                   Apellidos *                            │
│  [input: María         ]    [input: García         ]               │
│                                                                     │
│  ─── Cambiar contraseña (opcional) ───────────────────────────     │
│                                                                     │
│  Contraseña actual                                                  │
│  [input password  ] [👁]                                           │
│                                                                     │
│  Nueva contraseña                                                   │
│  [input password  ] [👁]                                           │
│                                                                     │
│  Confirmar nueva contraseña                                         │
│  [input password  ] [👁]                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                    [Cancelar]  [Guardar cambios]
```

---

### SCREEN-18 — Página 403 (acceso denegado)

**Ruta:** `/403`
**Layout:** AdminLayout o UserLayout según zona
**Acceso:** cualquier usuario autenticado

```
                                           (centrado verticalmente)

   403                    ← 64px, brand-500, font-weight 700
   Acceso denegado        ← heading-lg, gray-900
   No tienes permiso      ← body-md, gray-600
   para ver esta página.

   [Volver al inicio]     ← botón primary
   (lleva a /admin o /portal según el rol del usuario)
```

Sin información técnica sobre el permiso requerido.

---

### SCREEN-19 — Panel de filtros (componente)

Componente reutilizable que aparece en todos los listados CRUD.

```
Filtros                              [Limpiar todo]  [×]
────────────────────────────────────────────────────────

Estado
[ Todos ▾ ]

Categoría
[ Seleccionar... ▾ ]

Fecha de creación
Desde [──────────] Hasta [──────────]

Texto
[buscar por nombre...           ]

                            [Aplicar filtros]
```

Se presenta como un panel lateral derecho (drawer) en móvil, o como un panel expandible bajo la barra de herramientas en escritorio.

---

### SCREEN-20 — Modal de confirmación de borrado

Componente reutilizable para todas las acciones destructivas.

```
(overlay semitransparente bg rgba(0,0,0,0.4))

┌─ modal 440px ────────────────────────────────────┐
│                                                   │
│  Eliminar producto                ← heading-md   │
│                                                   │
│  ¿Estás seguro de que quieres    ← body-md        │
│  eliminar "Auriculares Premium"?                  │
│  Esta acción no se puede deshacer.                │
│                                                   │
│                  [Cancelar]  [Eliminar]           │
│                              ← botón danger       │
└───────────────────────────────────────────────────┘
```

Para bulk delete: "¿Eliminar los 12 registros seleccionados? Esta acción no se puede deshacer."

---

## 4. Estados globales del sistema

### Toast / Notificaciones

Aparecen en la esquina superior derecha. Se apilan si hay varias. Desaparecen tras 4 segundos o al hacer clic en ×.

```
┌─ toast éxito ──────────────────────────────┐
│  ✓  Cambios guardados correctamente    [×] │
│  bg success-50 · borde izq 3px success-500 │
└────────────────────────────────────────────┘

┌─ toast error ──────────────────────────────┐
│  ✕  Error al guardar. Inténtalo de nuevo [×]│
│  bg danger-50 · borde izq 3px danger-500   │
└────────────────────────────────────────────┘
```

### Estados de carga

- **Pantalla completa (hidratación inicial):** spinner centrado + "Cargando..." en `brand-500`.
- **Tabla cargando:** skeleton de 8 filas con animación pulse en `gray-100`.
- **Botón enviando:** spinner inline izquierda + texto cambiado ("Guardando...", "Eliminando...").
- **Card cargando:** skeleton del contenido de la card.

### Responsive

| Breakpoint | Comportamiento |
|---|---|
| < 640px (móvil) | Sidebar oculto por defecto. Topbar con botón hamburguesa. Grid de 1 columna. |
| 640–1024px (tablet) | Sidebar colapsado (solo iconos, 56px). Grid de 2 columnas. |
| > 1024px (escritorio) | Sidebar expandido (240px). Grid completo. |

---

## 5. Notas para Claude Design

- **Fuente:** Inter. Si no disponible, system sans-serif.
- **Color principal de interacción:** `#009ca6`. Todo lo que sea clicable, activo o en foco usa este color.
- **Color neutro de apoyo:** `#adadad`. Texto secundario, iconos inactivos, bordes.
- **Fondo de página:** `#f9f9f9` (casi blanco). Cards sobre fondo blanco `#ffffff`.
- **Sin gradientes decorativos.** El único gradiente permitido sería para gráficos de datos.
- **Iconos:** Lucide Icons. Tamaño estándar 18px en línea, 20px en botones, 24px en elementos destacados.
- **Destino:** aplicaciones empresariales internas. Usuarios de escritorio principalmente. Densidad de información media-alta.
- **Tono visual:** profesional, limpio, sin infantilizar. Similar a las herramientas que los equipos usan a diario (Jira, Linear, Notion).

---

*Documento generado a partir de `quiver-mvp-definition.md` y `quiver-epics-user-stories.md`. Versión 1.0.*
