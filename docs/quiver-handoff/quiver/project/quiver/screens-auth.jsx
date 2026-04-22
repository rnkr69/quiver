// Quiver — Auth screens (Login, ForgotPassword, ResetPassword)
const { useState, useContext } = React;
const { NavigationContext, Btn, Icon, Alert, Input, PasswordInput, Spinner, AuthLayout } = window;

// ─── SCREEN-01 Login ───────────────────────────────────────────────
function LoginScreen() {
  const { navigate } = useContext(NavigationContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Introduce un email válido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setApiError(null); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    if (form.email === 'error@test.com') {
      setApiError('cuenta_inactiva');
    } else if (form.password !== '123456' && form.email !== 'demo@quiver.com') {
      setApiError('credenciales');
    } else {
      navigate('/admin');
    }
  };

  const handleKey = e => { if (e.key === 'Enter') submit(e); };

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>Bienvenido</h2>
      <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24 }}>Accede a tu cuenta</p>

      {apiError === 'credenciales' && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">Email o contraseña incorrectos.</Alert>
        </div>
      )}
      {apiError === 'cuenta_inactiva' && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">Tu cuenta está desactivada. Contacta con el administrador.</Alert>
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Email" type="email" placeholder="nombre@empresa.com"
          value={form.email} onChange={set('email')} onKeyDown={handleKey}
          error={errors.email} required />
        <PasswordInput label="Contraseña" placeholder="••••••••"
          value={form.password} onChange={set('password')}
          error={errors.password} required />

        <button type="submit" disabled={loading}
          style={{ ...Btn.primary, width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 14, marginTop: 4, opacity: loading ? 0.8 : 1 }}>
          {loading ? <><Spinner size={14} color="rgba(255,255,255,0.8)" /> Entrando…</> : 'Iniciar sesión'}
        </button>
      </form>

      <button onClick={() => navigate('/auth/forgot-password')}
        style={{ ...Btn.link, display: 'block', textAlign: 'center', width: '100%', marginTop: 16, fontSize: 13 }}>
        ¿Olvidaste tu contraseña?
      </button>

      <div style={{ marginTop: 20, padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
        <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Demo rápido:</p>
        <p style={{ fontSize: 12, color: 'var(--gray-600)', fontFamily: 'monospace' }}>demo@quiver.com / cualquier contraseña</p>
      </div>
    </AuthLayout>
  );
}

// ─── SCREEN-02 Forgot password ─────────────────────────────────────
function ForgotPasswordScreen() {
  const { navigate } = useContext(NavigationContext);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!email) { setError('Introduce tu email.'); return; }
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false); setSent(true);
  };

  return (
    <AuthLayout>
      <button onClick={() => navigate('/auth/login')}
        style={{ ...Btn.link, marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon name="arrow-left" size={14} color="var(--brand-500)" />
        Volver al login
      </button>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="check" size={24} color="var(--success-500)" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--success-500)', marginBottom: 10 }}>Enlace enviado</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 24 }}>
            Si el email existe en el sistema, recibirás un enlace en breve. Revisa también tu carpeta de spam.
          </p>
          <button onClick={() => navigate('/auth/login')} style={{ ...Btn.secondary, width: '100%', justifyContent: 'center' }}>
            Volver al login
          </button>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>Recuperar contraseña</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24, lineHeight: 1.5 }}>
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Email" type="email" placeholder="nombre@empresa.com"
              value={email} onChange={e => setEmail(e.target.value)} error={error} />
            <button type="submit" disabled={loading}
              style={{ ...Btn.primary, width: '100%', justifyContent: 'center', padding: '10px 16px', opacity: loading ? 0.8 : 1 }}>
              {loading ? <><Spinner size={14} color="rgba(255,255,255,0.8)" /> Enviando…</> : 'Enviar enlace'}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

// ─── SCREEN-03 Reset password ──────────────────────────────────────
function ResetPasswordScreen({ tokenValid = true }) {
  const { navigate } = useContext(NavigationContext);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.password) errs.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres.';
    if (form.password !== form.confirm) errs.confirm = 'Las contraseñas no coinciden.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false); setDone(true);
  };

  if (!tokenValid) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="link-2-off" size={22} color="var(--danger-500)" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 10 }}>Enlace inválido o expirado</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 24 }}>Este enlace de recuperación ya no es válido. Solicita uno nuevo.</p>
          <button onClick={() => navigate('/auth/forgot-password')} style={{ ...Btn.primary, width: '100%', justifyContent: 'center' }}>
            Solicitar nuevo enlace
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="check" size={24} color="var(--success-500)" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 10 }}>Contraseña actualizada</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 24 }}>
            Tu contraseña se ha cambiado correctamente. Por seguridad, se han cerrado todas las sesiones activas.
          </p>
          <button onClick={() => navigate('/auth/login')} style={{ ...Btn.primary, width: '100%', justifyContent: 'center' }}>
            Ir al login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>Nueva contraseña</h2>
      <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24 }}>Elige una contraseña segura para tu cuenta.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PasswordInput label="Nueva contraseña" placeholder="Mínimo 8 caracteres"
          value={form.password} onChange={set('password')} error={errors.password} required />
        <PasswordInput label="Confirmar contraseña" placeholder="Repite la contraseña"
          value={form.confirm} onChange={set('confirm')} error={errors.confirm} required />
        <button type="submit" disabled={loading}
          style={{ ...Btn.primary, width: '100%', justifyContent: 'center', padding: '10px 16px', opacity: loading ? 0.8 : 1 }}>
          {loading ? <><Spinner size={14} color="rgba(255,255,255,0.8)" /> Guardando…</> : 'Guardar contraseña'}
        </button>
      </form>
    </AuthLayout>
  );
}

Object.assign(window, { LoginScreen, ForgotPasswordScreen, ResetPasswordScreen });
