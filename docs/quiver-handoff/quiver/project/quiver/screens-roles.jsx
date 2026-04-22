// Quiver — Role screens (List, Edit with permissions) — SCREEN-12, 13
const { useState, useContext } = React;
const { NavigationContext, DataContext, Btn, Icon, Badge, Card, AdminLayout,
        ToastContainer, useToast, Input, Textarea, BackLink, PageHeader, RowMenu } = window;

const ALL_PERMISSIONS = {
  'Productos':  ['Listar productos', 'Ver producto', 'Crear producto', 'Editar producto', 'Eliminar producto'],
  'Usuarios':   ['Listar usuarios', 'Ver usuario', 'Crear usuario', 'Editar usuario', 'Desactivar usuario'],
  'Roles':      ['Listar roles', 'Ver rol', 'Crear rol', 'Editar rol'],
  'Reportes':   ['Ver reportes', 'Exportar reportes'],
  'Configuración': ['Ver configuración', 'Editar configuración'],
};

// ─── SCREEN-12: Role list ──────────────────────────────────────────
function RoleListScreen({ sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { roles, users } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();

  const userCountByRole = role => users.filter(u => u.roles.includes(role.name)).length;

  return (
    <AdminLayout breadcrumbs={[{ label: 'Roles y permisos' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/roles">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <PageHeader title="Roles y permisos"
        actions={<button onClick={() => navigate('/admin/roles/new')} style={Btn.primary}><Icon name="plus" size={15} />Nuevo rol</button>} />

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
              {['Nombre', 'Descripción', 'Permisos', 'Usuarios', ''].map(col => (
                <th key={col} style={{ padding: '10px 16px', textAlign: col === 'Permisos' || col === 'Usuarios' ? 'center' : 'left', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role, i) => (
              <tr key={role.id} style={{ borderBottom: i < roles.length - 1 ? '1px solid var(--gray-100)' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--gray-900)' }}>{role.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace', marginTop: 2 }}>{role.slug}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray-600)', maxWidth: 240 }}>{role.description}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{role.permissions.length}</span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{userCountByRole(role)}</span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <RowMenu actions={[
                    { label: 'Editar', icon: 'pencil', action: () => navigate(`/admin/roles/${role.id}/edit`) },
                    'divider',
                    { label: 'Eliminar', icon: 'trash-2', danger: true, action: () => addToast(`"${role.name}" no se puede eliminar en demo.`, 'warning') },
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}

// ─── Permission group ──────────────────────────────────────────────
function PermissionGroup({ group, perms, selected, onChange }) {
  const all = perms.every(p => selected.includes(p));
  const some = perms.some(p => selected.includes(p));

  const selectAll = () => {
    if (all) onChange(selected.filter(p => !perms.includes(p)));
    else onChange([...new Set([...selected, ...perms])]);
  };
  const toggle = perm => {
    onChange(selected.includes(perm) ? selected.filter(p => p !== perm) : [...selected, perm]);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{group}</span>
        <button onClick={selectAll} style={{ ...Btn.link, fontSize: 12, color: all ? 'var(--danger-500)' : 'var(--brand-500)' }}>
          {all ? 'Desmarcar todos' : 'Seleccionar todos'}
        </button>
      </div>
      <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 6, padding: '12px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 16px' }}>
        {perms.map(perm => (
          <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--gray-700)' }}>
            <input type="checkbox" checked={selected.includes(perm)} onChange={() => toggle(perm)}
              style={{ accentColor: 'var(--brand-500)', width: 15, height: 15, cursor: 'pointer' }} />
            {perm}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN-13: Edit role ──────────────────────────────────────────
function RoleEditScreen({ roleId, sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { roles, setRoles } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const isNew = roleId === 'new';
  const role = isNew ? null : roles.find(r => r.id === roleId);

  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPerms, setSelectedPerms] = useState(role?.permissions || []);

  const allPerms = Object.values(ALL_PERMISSIONS).flat();
  const allSelected = allPerms.every(p => selectedPerms.includes(p));

  const save = async () => {
    if (!name.trim()) { addToast('El nombre del rol es obligatorio.', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    if (isNew) {
      const newRole = { id: Date.now(), name, description, slug: name.toLowerCase().replace(/\s+/g, '_'), permissions: selectedPerms };
      setRoles(prev => [...prev, newRole]);
      addToast('Rol creado correctamente.');
    } else {
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name, description, permissions: selectedPerms } : r));
      addToast('Rol actualizado correctamente.');
    }
    setSaving(false);
    setTimeout(() => navigate('/admin/roles'), 1000);
  };

  if (!isNew && !role) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Roles', path: '/admin/roles' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/roles">
        <p style={{ color: 'var(--gray-500)' }}>Rol no encontrado.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: 'Roles', path: '/admin/roles' }, { label: isNew ? 'Nuevo rol' : `Editar: ${role.name}` }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/roles">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Roles" onClick={() => navigate('/admin/roles')} />

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)' }}>{isNew ? 'Nuevo rol' : `Editar rol: ${role.name}`}</h1>
        {!isNew && <div style={{ fontSize: 13, color: 'var(--gray-400)', fontFamily: 'monospace', marginTop: 4 }}>{role.slug}</div>}
      </div>

      {/* Basic info */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Input label="Nombre visible" required placeholder="Ej. Cliente Premium" value={name} onChange={e => setName(e.target.value)} />
          <Textarea label="Descripción" placeholder="Descripción del rol y sus responsabilidades…" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </Card>

      {/* Permissions */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>Permisos</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              {selectedPerms.length} de {allPerms.length} permisos activos
            </div>
          </div>
          <button onClick={() => setSelectedPerms(allSelected ? [] : [...allPerms])} style={{ ...Btn.ghost, fontSize: 12, color: allSelected ? 'var(--danger-500)' : 'var(--brand-600)' }}>
            {allSelected ? 'Desmarcar todos los permisos' : 'Seleccionar todos los permisos'}
          </button>
        </div>
        {Object.entries(ALL_PERMISSIONS).map(([group, perms]) => (
          <PermissionGroup key={group} group={group} perms={perms} selected={selectedPerms} onChange={setSelectedPerms} />
        ))}
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--warning-50)', border: '1px solid var(--warning-500)', borderRadius: 6, fontSize: 12, color: 'var(--warning-500)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="clock" size={14} color="var(--warning-500)" />
          Los cambios de permisos pueden tardar hasta 15 minutos en propagarse.
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={() => navigate('/admin/roles')} style={Btn.secondary}>Cancelar</button>
        <button onClick={save} disabled={saving} style={{ ...Btn.primary, opacity: saving ? 0.8 : 1 }}>
          {saving ? <><window.Spinner size={14} color="rgba(255,255,255,0.8)" /> Guardando…</> : 'Guardar cambios'}
        </button>
      </div>
    </AdminLayout>
  );
}

Object.assign(window, { RoleListScreen, RoleEditScreen });
