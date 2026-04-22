// Quiver — User screens (List, Create, Detail) + SCREEN-09,10,11
const { useState, useContext } = React;
const { NavigationContext, DataContext, Btn, Icon, Badge, Avatar, Card, AdminLayout,
        SkeletonRow, RowMenu, DeleteModal, ToastContainer, useToast,
        Input, PasswordInput, QSelect, Toggle, EmptyState, PageHeader, BackLink, DetailField } = window;

// ─── SCREEN-09: User list ──────────────────────────────────────────
function UserListScreen({ sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { users, setUsers } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = users.filter(u =>
    !search || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === rows.length ? [] : rows.map(r => r.id));

  const confirmDelete = () => {
    if (deleteTarget?.bulk) {
      setUsers(u => u.filter(r => !selected.includes(r.id)));
      addToast(`${selected.length} usuarios eliminados.`);
      setSelected([]);
    } else if (deleteTarget?.id) {
      setUsers(u => u.filter(r => r.id !== deleteTarget.id));
      addToast(`Usuario "${deleteTarget.name}" eliminado.`);
    }
    setDeleteTarget(null);
  };

  const deactivate = user => {
    setUsers(u => u.map(r => r.id === user.id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r));
    addToast(`${user.name} ${user.status === 'active' ? 'desactivado' : 'activado'}.`, user.status === 'active' ? 'warning' : 'success');
  };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Usuarios' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/users">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {deleteTarget && <DeleteModal item={deleteTarget.name} count={deleteTarget.bulk ? selected.length : null} resource="usuario" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      <PageHeader title="Usuarios" subtitle={`${rows.length} usuario${rows.length !== 1 ? 's' : ''}`}
        actions={<button onClick={() => navigate('/admin/users/new')} style={Btn.primary}><Icon name="plus" size={15} />Nuevo usuario</button>} />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
        <Icon name="search" size={15} color="var(--gray-400)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuarios…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: 'var(--gray-800)', background: 'transparent', maxWidth: 300 }} />
        {search && <button onClick={() => setSearch('')} style={{ ...Btn.ghost, padding: 2 }}><Icon name="x" size={13} /></button>}
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--brand-50)', borderTop: '2px solid var(--brand-500)', padding: '9px 16px', borderRadius: '6px 6px 0 0' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--brand-700)', flex: 1 }}>{selected.length} seleccionado{selected.length !== 1 ? 's' : ''}</span>
          <button onClick={() => setSelected([])} style={{ ...Btn.secondary, padding: '5px 12px', fontSize: 12 }}>Cancelar</button>
          <button onClick={() => setDeleteTarget({ bulk: true })} style={{ ...Btn.ghost, padding: '5px 12px', fontSize: 12, color: 'var(--danger-500)', border: '1px solid var(--danger-500)' }}>
            <Icon name="trash-2" size={14} color="var(--danger-500)" />Eliminar ({selected.length})
          </button>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: selected.length > 0 ? '0 0 8px 8px' : 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 8 }}>
        {rows.length === 0 ? (
          <EmptyState icon="users" title="No se encontraron usuarios" description="Prueba con otro término de búsqueda."
            action={<button onClick={() => setSearch('')} style={Btn.secondary}>Limpiar búsqueda</button>} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ padding: '10px 16px', width: 40 }}>
                  <input type="checkbox" checked={selected.length === rows.length && rows.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--brand-500)', cursor: 'pointer' }} />
                </th>
                {['Usuario', 'Roles', 'Estado', 'Último acceso'].map(col => (
                  <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{col}</th>
                ))}
                <th style={{ padding: '10px 16px', width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((user, i) => {
                const sel = selected.includes(user.id);
                return (
                  <tr key={user.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--gray-100)' : 'none', background: sel ? 'var(--brand-50)' : 'white', borderLeft: sel ? '3px solid var(--brand-500)' : '3px solid transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--gray-50)'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'white'; }}>
                    <td style={{ padding: '11px 16px' }}><input type="checkbox" checked={sel} onChange={() => toggleSelect(user.id)} style={{ accentColor: 'var(--brand-500)', cursor: 'pointer' }} /></td>
                    <td style={{ padding: '11px 16px', cursor: 'pointer' }} onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={user.name} size={32} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-900)' }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {user.roles.map(r => <Badge key={r} variant={r === 'Admin' ? 'admin' : 'client'}>{r}</Badge>)}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px' }}><Badge variant={user.status === 'active' ? 'success' : 'inactive'}>{user.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--gray-500)' }}>{user.lastAccess}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                      <RowMenu actions={[
                        { label: 'Ver', icon: 'eye', action: () => navigate(`/admin/users/${user.id}`) },
                        { label: 'Editar', icon: 'pencil', action: () => navigate(`/admin/users/${user.id}/edit`) },
                        'divider',
                        { label: user.status === 'active' ? 'Desactivar' : 'Activar', icon: user.status === 'active' ? 'user-x' : 'user-check', warning: true, action: () => deactivate(user) },
                      ]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

// ─── Shared: User form ─────────────────────────────────────────────
function UserForm({ initial, isEdit, onSave, onCancel, saving }) {
  const ROLES = ['Admin', 'Cliente', 'Cliente Premium'];
  const [form, setForm] = useState(initial || { firstName: '', lastName: '', email: '', password: '', roles: [], active: true });
  const [errors, setErrors] = useState({});
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const toggleRole = r => setForm(f => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r] }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'El nombre es obligatorio.';
    if (!form.lastName.trim()) e.lastName = 'El apellido es obligatorio.';
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido.';
    if (!isEdit && !form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password && form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    return e;
  };

  const submit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <form onSubmit={submit}>
      <Card style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Nombre" required placeholder="María" value={form.firstName} onChange={e => set('firstName')(e.target.value)} error={errors.firstName} />
            <Input label="Apellidos" required placeholder="García" value={form.lastName} onChange={e => set('lastName')(e.target.value)} error={errors.lastName} />
          </div>
          <Input label="Email" required type="email" placeholder="nombre@empresa.com" value={form.email} onChange={e => set('email')(e.target.value)} error={errors.email} />
          <PasswordInput label={isEdit ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'} required={!isEdit}
            placeholder={isEdit ? 'Nueva contraseña (opcional)' : 'Mínimo 8 caracteres'}
            value={form.password} onChange={e => set('password')(e.target.value)} error={errors.password} />

          {/* Roles */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 8 }}>Roles</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {form.roles.map(r => (
                <div key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: r === 'Admin' ? '#1a1a2e' : 'var(--brand-50)', color: r === 'Admin' ? 'white' : 'var(--brand-700)', border: r === 'Admin' ? 'none' : '1px solid var(--brand-100)', borderRadius: 4, padding: '3px 8px', fontSize: 12, fontWeight: 500 }}>
                  {r}
                  <button type="button" onClick={() => toggleRole(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: r === 'Admin' ? 'rgba(255,255,255,0.7)' : 'var(--brand-400)', padding: 0, display: 'flex', lineHeight: 1 }}>
                    <Icon name="x" size={11} />
                  </button>
                </div>
              ))}
              <div style={{ position: 'relative' }}>
                <select onChange={e => { if (e.target.value) toggleRole(e.target.value); e.target.value = ''; }}
                  style={{ padding: '4px 28px 4px 10px', border: '1px dashed var(--gray-300)', borderRadius: 4, fontSize: 12, color: 'var(--gray-600)', background: 'white', cursor: 'pointer', appearance: 'none' }}>
                  <option value="">+ Añadir rol</option>
                  {ROLES.filter(r => !form.roles.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 8 }}>Estado</div>
            <Toggle checked={form.active} onChange={v => set('active')(v)} label="Usuario activo" />
          </div>
        </div>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={onCancel} style={Btn.secondary}>Cancelar</button>
        <button type="submit" disabled={saving} style={{ ...Btn.primary, opacity: saving ? 0.8 : 1 }}>
          {saving ? <><window.Spinner size={14} color="rgba(255,255,255,0.8)" /> Guardando…</> : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

// ─── SCREEN-10a: Create user ───────────────────────────────────────
function UserCreateScreen({ sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { setUsers } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const save = async form => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const nu = { id: Date.now(), name: `${form.firstName} ${form.lastName}`, email: form.email, roles: form.roles.length ? form.roles : ['Cliente'], status: form.active ? 'active' : 'inactive', lastAccess: 'Nunca', since: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) };
    setUsers(u => [nu, ...u]);
    setSaving(false);
    addToast('Usuario creado correctamente.');
    setTimeout(() => navigate('/admin/users'), 1000);
  };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Usuarios', path: '/admin/users' }, { label: 'Nuevo usuario' }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/users">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Usuarios" onClick={() => navigate('/admin/users')} />
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 20 }}>Nuevo usuario</h1>
      <UserForm isEdit={false} onSave={save} onCancel={() => navigate('/admin/users')} saving={saving} />
    </AdminLayout>
  );
}

// ─── SCREEN-10b: Edit user ─────────────────────────────────────────
function UserEditScreen({ userId, sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { users, setUsers } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const [firstName, ...rest] = user.name.split(' ');
  const initial = { firstName, lastName: rest.join(' '), email: user.email, password: '', roles: [...user.roles], active: user.status === 'active' };

  const save = async form => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: `${form.firstName} ${form.lastName}`, email: form.email, roles: form.roles, status: form.active ? 'active' : 'inactive' } : u));
    setSaving(false);
    addToast('Usuario actualizado correctamente.');
    setTimeout(() => navigate(`/admin/users/${userId}`), 1000);
  };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Usuarios', path: '/admin/users' }, { label: user.name }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/users">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Usuarios" onClick={() => navigate('/admin/users')} />
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 20 }}>Editar: {user.name}</h1>
      <UserForm isEdit initial={initial} onSave={save} onCancel={() => navigate(`/admin/users/${userId}`)} saving={saving} />
    </AdminLayout>
  );
}

// ─── SCREEN-11: User detail ────────────────────────────────────────
function UserDetailScreen({ userId, sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { users, setUsers } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const deactivate = () => {
    setUsers(u => u.map(r => r.id === userId ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r));
    addToast(`${user.name} ${user.status === 'active' ? 'desactivado' : 'activado'}.`, 'warning');
  };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Usuarios', path: '/admin/users' }, { label: user.name }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/users">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Usuarios" onClick={() => navigate('/admin/users')} />

      {/* Header */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={user.name} size={56} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--gray-900)' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{user.email}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {user.roles.map(r => <Badge key={r} variant={r === 'Admin' ? 'admin' : 'client'}>{r}</Badge>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(`/admin/users/${userId}/edit`)} style={Btn.secondary}><Icon name="pencil" size={15} />Editar</button>
            <button onClick={deactivate} style={{ ...Btn.ghost, color: 'var(--warning-500)', border: '1px solid var(--warning-500)' }}>
              <Icon name={user.status === 'active' ? 'user-x' : 'user-check'} size={15} color="var(--warning-500)" />
              {user.status === 'active' ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      </Card>

      {/* Info grid */}
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {(() => { const [fn, ...ln] = user.name.split(' '); return <>
            <DetailField label="Nombre">{fn}</DetailField>
            <DetailField label="Apellidos">{ln.join(' ')}</DetailField>
          </>; })()}
          <DetailField label="Email">{user.email}</DetailField>
          <DetailField label="Estado"><Badge variant={user.status === 'active' ? 'success' : 'inactive'}>{user.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></DetailField>
          <DetailField label="Miembro desde">{user.since}</DetailField>
          <DetailField label="Último acceso">{user.lastAccess}</DetailField>
        </div>
      </Card>
    </AdminLayout>
  );
}

Object.assign(window, { UserListScreen, UserCreateScreen, UserEditScreen, UserDetailScreen });
