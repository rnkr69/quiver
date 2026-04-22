// Quiver — App root: router + data store + tweaks
const { useState, useEffect, useMemo } = React;
const { NavigationContext, DataContext } = window;

// ─── Initial data ──────────────────────────────────────────────────
const INIT_PRODUCTS = [
  { id: 1,  name: 'Auriculares Premium BT-900',  price: 299.00, status: 'active',   category: 'Electrónica', created: '12/03/25', description: 'Auriculares inalámbricos con cancelación activa de ruido y 40h de batería.' },
  { id: 2,  name: 'Mesa de trabajo Scandinavian', price: 549.00, status: 'active',   category: 'Hogar',       created: '08/02/25', description: 'Mesa de escritorio minimalista en madera de pino nórdico.' },
  { id: 3,  name: 'Zapatillas Trail Runner X',    price: 129.00, status: 'inactive', category: 'Deportes',    created: '21/01/25', description: '' },
  { id: 4,  name: 'Cámara Mirrorless Alpha VII',  price: 1249.00,status: 'active',   category: 'Electrónica', created: '15/01/25', description: 'Cámara sin espejo 24MP con vídeo 4K y estabilización óptica.' },
  { id: 5,  name: 'Mochila Urban Pro 30L',        price: 89.00,  status: 'active',   category: 'Accesorios',  created: '03/01/25', description: '' },
  { id: 6,  name: 'Monitor 4K UltraWide 34"',     price: 679.00, status: 'inactive', category: 'Electrónica', created: '28/12/24', description: 'Panel IPS 144Hz, cobertura sRGB 99%.' },
  { id: 7,  name: 'Silla ergonómica Lumbar+',     price: 449.00, status: 'active',   category: 'Hogar',       created: '12/12/24', description: 'Soporte lumbar ajustable, reposabrazos 4D.' },
  { id: 8,  name: 'Botella termo Acero 750ml',    price: 34.00,  status: 'active',   category: 'Accesorios',  created: '01/12/24', description: '' },
  { id: 9,  name: 'Teclado mecánico TKL',         price: 149.00, status: 'inactive', category: 'Electrónica', created: '18/11/24', description: 'Switches Cherry MX Red, retroiluminación RGB.' },
  { id: 10, name: 'Chaqueta softshell Outdoor',   price: 199.00, status: 'active',   category: 'Deportes',    created: '05/11/24', description: '' },
  { id: 11, name: 'Lámpara escritorio LED',        price: 59.00,  status: 'active',   category: 'Hogar',       created: '22/10/24', description: '' },
  { id: 12, name: 'Auriculares gaming RGB',        price: 79.00,  status: 'active',   category: 'Electrónica', created: '10/10/24', description: '' },
];

const INIT_USERS = [
  { id: 101, name: 'María García',    email: 'maria@empresa.com',   roles: ['Admin', 'Cliente Premium'], status: 'active',   lastAccess: 'Hace 2 horas',   since: '12 de marzo de 2024' },
  { id: 102, name: 'Carlos Ruiz',     email: 'carlos@empresa.com',  roles: ['Cliente'],                  status: 'active',   lastAccess: 'Hace 1 día',     since: '5 de enero de 2025' },
  { id: 103, name: 'Laura Sánchez',   email: 'laura@empresa.com',   roles: ['Cliente Premium'],          status: 'active',   lastAccess: 'Hace 3 días',    since: '20 de junio de 2024' },
  { id: 104, name: 'Pedro López',     email: 'pedro@empresa.com',   roles: ['Cliente'],                  status: 'inactive', lastAccess: 'Hace 2 semanas', since: '8 de agosto de 2024' },
  { id: 105, name: 'Ana Fernández',   email: 'anaf@empresa.com',    roles: ['Admin'],                    status: 'active',   lastAccess: 'Ahora mismo',    since: '1 de noviembre de 2023' },
  { id: 106, name: 'Javier Moreno',   email: 'javier@empresa.com',  roles: ['Cliente'],                  status: 'active',   lastAccess: 'Nunca',          since: '15 de abril de 2025' },
  { id: 107, name: 'Elena Torres',    email: 'elena@empresa.com',   roles: ['Cliente Premium'],          status: 'inactive', lastAccess: 'Hace 1 mes',     since: '3 de febrero de 2024' },
];

const INIT_ROLES = [
  { id: 201, name: 'Admin',           slug: 'admin',            description: 'Acceso completo al sistema.',       permissions: ['Listar productos','Ver producto','Crear producto','Editar producto','Eliminar producto','Listar usuarios','Ver usuario','Crear usuario','Editar usuario','Desactivar usuario','Listar roles','Ver rol','Crear rol','Editar rol','Ver reportes','Exportar reportes','Ver configuración','Editar configuración'] },
  { id: 202, name: 'Cliente',         slug: 'cliente',          description: 'Acceso básico al portal de usuario.',permissions: ['Ver producto'] },
  { id: 203, name: 'Cliente Premium', slug: 'cliente_premium',  description: 'Acceso completo al portal.',         permissions: ['Ver producto','Ver reportes','Listar productos'] },
];

// ─── Simple router ─────────────────────────────────────────────────
function matchRoute(pattern, path) {
  const pp = pattern.split('/'), rp = path.split('/');
  if (pp.length !== rp.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = rp[i];
    else if (pp[i] !== rp[i]) return null;
  }
  return params;
}

const ROUTES = [
  { pattern: '/auth/login' },
  { pattern: '/auth/forgot-password' },
  { pattern: '/auth/reset-password' },
  { pattern: '/admin' },
  { pattern: '/admin/productos' },
  { pattern: '/admin/productos/new' },
  { pattern: '/admin/productos/:id' },
  { pattern: '/admin/productos/:id/edit' },
  { pattern: '/admin/users' },
  { pattern: '/admin/users/new' },
  { pattern: '/admin/users/:id' },
  { pattern: '/admin/users/:id/edit' },
  { pattern: '/admin/roles' },
  { pattern: '/admin/roles/:id/edit' },
  { pattern: '/portal' },
  { pattern: '/portal/dev' },
  { pattern: '/portal/perfil' },
  { pattern: '/portal/perfil/editar' },
  { pattern: '/403' },
];

// ─── App ───────────────────────────────────────────────────────────
function App() {
  const saved = localStorage.getItem('quiver_route') || '/auth/login';
  const [path, setPath] = useState(saved);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [users, setUsers] = useState(INIT_USERS);
  const [roles, setRoles] = useState(INIT_ROLES);

  const navigate = p => { setPath(p); localStorage.setItem('quiver_route', p); window.scrollTo(0, 0); };

  // Find matching route + params
  let matchedParams = {};
  const matched = ROUTES.find(r => { const p2 = matchRoute(r.pattern, path); if (p2 !== null) { matchedParams = p2; return true; } return false; });
  const routePattern = matched?.pattern || '/auth/login';

  // Tweaks panel
  useEffect(() => {
    const panel = document.getElementById('tweaks-panel');
    if (!panel) return;
    const listener = e => {
      if (e.data?.type === '__activate_edit_mode')   panel.style.display = 'block';
      if (e.data?.type === '__deactivate_edit_mode') panel.style.display = 'none';
    };
    window.addEventListener('message', listener);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', listener);
  }, []);

  const nav = useMemo(() => ({ navigate, route: { path, params: matchedParams } }), [path]);
  const data = useMemo(() => ({ products, setProducts, users, setUsers, roles, setRoles }), [products, users, roles]);
  const layout = { sidebarCollapsed, onToggleSidebar: () => setSidebarCollapsed(c => !c) };

  const renderScreen = () => {
    const { id } = matchedParams;
    switch (routePattern) {
      case '/auth/login':              return <window.LoginScreen />;
      case '/auth/forgot-password':    return <window.ForgotPasswordScreen />;
      case '/auth/reset-password':     return <window.ResetPasswordScreen />;
      case '/admin':                   return <window.DashboardScreen {...layout} />;
      case '/admin/productos':         return <window.ProductListScreen {...layout} />;
      case '/admin/productos/new':     return <window.ProductCreateScreen {...layout} />;
      case '/admin/productos/:id':     return <window.ProductDetailScreen productId={Number(id)} {...layout} />;
      case '/admin/productos/:id/edit':return <window.ProductEditScreen productId={Number(id)} {...layout} />;
      case '/admin/users':             return <window.UserListScreen {...layout} />;
      case '/admin/users/new':         return <window.UserCreateScreen {...layout} />;
      case '/admin/users/:id':         return <window.UserDetailScreen userId={Number(id)} {...layout} />;
      case '/admin/users/:id/edit':    return <window.UserEditScreen userId={Number(id)} {...layout} />;
      case '/admin/roles':             return <window.RoleListScreen {...layout} />;
      case '/admin/roles/:id/edit':    return <window.RoleEditScreen roleId={id === 'new' ? 'new' : Number(id)} {...layout} />;
      case '/portal':                  return <window.PortalWelcomeDevScreen />;
      case '/portal/dev':              return <window.PortalWelcomeProdScreen />;
      case '/portal/perfil':           return <window.PortalProfileScreen />;
      case '/portal/perfil/editar':    return <window.PortalEditProfileScreen />;
      case '/403':                     return <window.Error403Screen inAdmin={false} />;
      default:                         return <window.LoginScreen />;
    }
  };

  return (
    <NavigationContext.Provider value={nav}>
      <DataContext.Provider value={data}>
        {renderScreen()}
      </DataContext.Provider>
    </NavigationContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
