// Quiver — Portal + Profile screens + 403 — SCREEN-14,15,16,17,18
const { useState, useContext } = React;
const { NavigationContext, Btn, Icon, Badge, Avatar, Card, QuiverLogo, UserLayout,
        ToastContainer, useToast, Input, PasswordInput, Toggle, BackLink, DetailField } = window;

// ─── SCREEN-14: Portal welcome (dev mode) ─────────────────────────
function PortalWelcomeDevScreen() {
  const { navigate } = useContext(NavigationContext);
  return (
    <UserLayout currentPath="/portal">
      {/* Dev banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 6, padding: '10px 14px', marginBottom: 32, fontSize: 13, color: 'var(--brand-700)' }}>
        <Icon name="wrench" size={16} color="var(--brand-500)" style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <strong>Modo desarrollo:</strong> Estás viendo la página de bienvenida por defecto.
          Edita <code style={{ fontFamily: 'monospace', background: 'var(--brand-100)', padding: '1px 5px', borderRadius: 3 }}>src/pages/portal/PortalWelcomePage.tsx</code> para personalizarla.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 0 40px' }}>
        <QuiverLogo size={52} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', marginTop: 20, marginBottom: 8 }}>Portal activo</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 32, lineHeight: 1.6 }}>Esta es la zona de usuario. Personaliza este contenido según las necesidades de tu proyecto.</p>

        <Card style={{ padding: 20, width: '100%', maxWidth: 420, textAlign: 'left', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Usuario', 'maria@empresa.com'],
              ['Roles', null],
              ['Entorno', 'development'],
              ['Versión', 'Quiver 0.1.0'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: 'var(--gray-500)', fontFamily: 'monospace' }}>{k}</span>
                {k === 'Roles'
                  ? <Badge variant="client">Cliente Premium</Badge>
                  : <span style={{ color: 'var(--gray-800)', fontFamily: 'monospace' }}>{v}</span>}
              </div>
            ))}
          </div>
        </Card>

        <button style={Btn.secondary}><Icon name="book-open" size={15} />Ver documentación de Quiver</button>
      </div>
    </UserLayout>
  );
}

// ─── SCREEN-15: Portal welcome (production mode) ───────────────────
function PortalWelcomeProdScreen() {
  const { navigate } = useContext(NavigationContext);
  return (
    <UserLayout currentPath="/portal">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 0' }}>
        <QuiverLogo size={52} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', marginTop: 24, marginBottom: 10 }}>Bienvenido</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>Esta sección estará disponible próximamente.</p>
        <button onClick={() => navigate('/portal')} style={Btn.secondary}>Volver al inicio</button>
      </div>
    </UserLayout>
  );
}

// ─── SCREEN-16: Portal profile ─────────────────────────────────────
function PortalProfileScreen() {
  const { navigate } = useContext(NavigationContext);
  const user = { name: 'María García', email: 'maria@empresa.com', role: 'Cliente Premium', since: '12 de marzo de 2024' };
  const [fn, ...ln] = user.name.split(' ');

  return (
    <UserLayout currentPath="/portal/perfil">
      <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 20 }}>Mi perfil</h1>

      <Card style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={user.name} size={64} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--gray-900)' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{user.email}</div>
              <div style={{ marginTop: 8 }}><Badge variant="client">{user.role}</Badge></div>
            </div>
          </div>
          <button onClick={() => navigate('/portal/perfil/editar')} style={Btn.secondary}><Icon name="pencil" size={15} />Editar perfil</button>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <DetailField label="Nombre">{fn}</DetailField>
          <DetailField label="Apellidos">{ln.join(' ')}</DetailField>
          <DetailField label="Email">
            <span style={{ color: 'var(--gray-600)' }}>{user.email}</span>
            <span style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 6 }}>(no editable)</span>
          </DetailField>
          <DetailField label="Miembro desde">{user.since}</DetailField>
        </div>
      </Card>
    </UserLayout>
  );
}

// ─── SCREEN-17: Edit profile ───────────────────────────────────────
function PortalEditProfileScreen() {
  const { navigate } = useContext(NavigationContext);
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState({ firstName: 'María', lastName: 'García', currentPw: '', newPw: '', confirmPw: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'El nombre es obligatorio.';
    if (!form.lastName.trim()) errs.lastName = 'Los apellidos son obligatorios.';
    if (form.newPw && !form.currentPw) errs.currentPw = 'Introduce tu contraseña actual.';
    if (form.newPw && form.newPw.length < 8) errs.newPw = 'Mínimo 8 caracteres.';
    if (form.newPw && form.newPw !== form.confirmPw) errs.confirmPw = 'Las contraseñas no coinciden.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    addToast('Perfil actualizado correctamente.');
    setTimeout(() => navigate('/portal/perfil'), 1200);
  };

  return (
    <UserLayout currentPath="/portal/perfil/editar">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Mi perfil" onClick={() => navigate('/portal/perfil')} />
      <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 20 }}>Editar perfil</h1>

      <form onSubmit={submit}>
        <Card style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Nombre" required value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
              <Input label="Apellidos" required value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
            </div>

            <div style={{ paddingTop: 8, borderTop: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 14 }}>Cambiar contraseña <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(opcional)</span></div>
              <div style={{ display: 'grid', gap: 14 }}>
                <PasswordInput label="Contraseña actual" value={form.currentPw} onChange={set('currentPw')} error={errors.currentPw} placeholder="Tu contraseña actual" />
                <PasswordInput label="Nueva contraseña" value={form.newPw} onChange={set('newPw')} error={errors.newPw} placeholder="Mínimo 8 caracteres" />
                <PasswordInput label="Confirmar nueva contraseña" value={form.confirmPw} onChange={set('confirmPw')} error={errors.confirmPw} placeholder="Repite la nueva contraseña" />
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={() => navigate('/portal/perfil')} style={Btn.secondary}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ ...Btn.primary, opacity: saving ? 0.8 : 1 }}>
            {saving ? <><window.Spinner size={14} color="rgba(255,255,255,0.8)" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </UserLayout>
  );
}

// ─── SCREEN-18: 403 ───────────────────────────────────────────────
function Error403Screen({ inAdmin = true, sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { AdminLayout } = window;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--brand-500)', lineHeight: 1, marginBottom: 12 }}>403</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 8 }}>Acceso denegado</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 28, lineHeight: 1.6 }}>No tienes permiso<br/>para ver esta página.</p>
      <button onClick={() => navigate(inAdmin ? '/admin' : '/portal')} style={Btn.primary}>
        <Icon name="arrow-left" size={15} />Volver al inicio
      </button>
    </div>
  );

  if (inAdmin) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Acceso denegado' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="">
        {content}
      </AdminLayout>
    );
  }
  return <UserLayout currentPath="/403">{content}</UserLayout>;
}

Object.assign(window, { PortalWelcomeDevScreen, PortalWelcomeProdScreen, PortalProfileScreen, PortalEditProfileScreen, Error403Screen });
