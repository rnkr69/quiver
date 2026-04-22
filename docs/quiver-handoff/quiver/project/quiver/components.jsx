// Quiver — Shared primitive components
const { useState, useEffect, useRef, useContext, createContext } = React;

// Navigation context
const NavigationContext = createContext({ navigate: () => {}, route: { path: '/auth/login', params: {} } });

// Data context
const DataContext = createContext({});

// ─── Button styles ─────────────────────────────────────────────────
const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', border: 'none', borderRadius: 6, transition: 'background 0.15s, opacity 0.15s', fontSize: 13, lineHeight: 1, whiteSpace: 'nowrap', textDecoration: 'none' };
const Btn = {
  primary:   { ...btnBase, background: 'var(--brand-500)', color: 'white',            padding: '8px 16px', border: '1px solid transparent' },
  secondary: { ...btnBase, background: 'white',            color: 'var(--gray-800)',  padding: '8px 16px', border: '1px solid var(--gray-300)' },
  ghost:     { ...btnBase, background: 'transparent',      color: 'var(--gray-700)',  padding: '6px 10px', border: '1px solid transparent' },
  danger:    { ...btnBase, background: 'white',            color: 'var(--danger-500)',padding: '8px 16px', border: '1px solid var(--danger-500)' },
  link:      { ...btnBase, background: 'transparent',      color: 'var(--brand-500)', padding: 0,          border: 'none', fontWeight: 400, fontSize: 13 },
};

// ─── Icon ──────────────────────────────────────────────────────────
function Icon({ name, size = 18, color, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    const key = name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    const fn = window.lucide[key];
    if (!fn) return;
    ref.current.innerHTML = '';
    const el = window.lucide.createElement(fn);
    el.setAttribute('width', size); el.setAttribute('height', size);
    el.setAttribute('stroke-width', 1.75);
    if (color) el.setAttribute('stroke', color);
    ref.current.appendChild(el);
  }, [name, size, color]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }} />;
}

// ─── Badge ─────────────────────────────────────────────────────────
function Badge({ variant = 'active', children }) {
  const v = {
    active:   { background: 'var(--brand-50)',   color: 'var(--brand-700)',   border: '1px solid var(--brand-100)' },
    inactive: { background: 'var(--gray-100)',   color: 'var(--gray-600)',    border: '1px solid var(--gray-200)' },
    success:  { background: 'var(--success-50)', color: 'var(--success-500)', border: '1px solid #c3e6d7' },
    danger:   { background: 'var(--danger-50)',  color: 'var(--danger-500)',  border: '1px solid #f5c6c6' },
    warning:  { background: 'var(--warning-50)', color: 'var(--warning-500)', border: '1px solid #f0d9a0' },
    admin:    { background: '#1a1a2e',           color: 'white',              border: 'none' },
    client:   { background: 'var(--brand-50)',   color: 'var(--brand-700)',   border: '1px solid var(--brand-100)' },
  };
  return (
    <span style={{ ...(v[variant] || v.active), fontSize: 12, fontWeight: 500, lineHeight: 1.4, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', display: 'inline-block' }}>
      {children}
    </span>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────
function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────
function Spinner({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'all',
          background: t.type === 'success' ? 'var(--success-50)' : t.type === 'error' ? 'var(--danger-50)' : 'var(--warning-50)',
          borderLeft: `3px solid ${t.type === 'success' ? 'var(--success-500)' : t.type === 'error' ? 'var(--danger-500)' : 'var(--warning-500)'}`,
          borderRadius: 6, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
          minWidth: 280, maxWidth: 380, fontSize: 13, color: 'var(--gray-800)',
          animation: 'slideIn 0.2s ease',
        }}>
          <Icon name={t.type === 'success' ? 'check-circle' : t.type === 'error' ? 'x-circle' : 'alert-triangle'} size={16}
            color={t.type === 'success' ? 'var(--success-500)' : t.type === 'error' ? 'var(--danger-500)' : 'var(--warning-500)'} />
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ ...Btn.ghost, padding: 0, color: 'var(--gray-400)' }}>
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, addToast, removeToast };
}

// ─── Delete Modal ──────────────────────────────────────────────────
function DeleteModal({ item, count, onConfirm, onCancel, resource = 'registro' }) {
  const [loading, setLoading] = useState(false);
  const go = async () => { setLoading(true); await new Promise(r => setTimeout(r, 700)); onConfirm(); };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8000 }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: 'white', borderRadius: 8, padding: 28, width: 440, boxShadow: 'var(--shadow-lg)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 12 }}>
          {count ? `Eliminar ${count} registros` : `Eliminar ${resource}`}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6, marginBottom: 24 }}>
          {count
            ? `¿Estás seguro de que quieres eliminar los ${count} registros seleccionados? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar "${item}"? Esta acción no se puede deshacer.`}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={Btn.secondary}>Cancelar</button>
          <button onClick={go} disabled={loading} style={{ ...Btn.danger, opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Spinner /> Eliminando…</> : count ? `Eliminar (${count})` : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton row ──────────────────────────────────────────────────
function SkeletonRow({ cols = 5 }) {
  const p = { animation: 'pulse 1.4s ease-in-out infinite', background: 'var(--gray-100)', borderRadius: 4 };
  return (
    <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
      <td style={{ padding: '12px 16px' }}><div style={{ ...p, width: 15, height: 15, borderRadius: 3 }} /></td>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{ ...p, width: `${40 + (i * 17) % 40}%`, height: 13 }} />
        </td>
      ))}
      <td style={{ padding: '12px 16px' }}><div style={{ ...p, width: 24, height: 24, borderRadius: 4 }} /></td>
    </tr>
  );
}

// ─── Form inputs ───────────────────────────────────────────────────
function Input({ label, required, error, hint, containerStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', lineHeight: 1.4 }}>
        {label}{required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
      </label>}
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          padding: '8px 12px', fontSize: 14, color: 'var(--gray-900)', fontFamily: 'inherit',
          border: error ? '1px solid var(--danger-500)' : focused ? '2px solid var(--brand-500)' : '1px solid var(--gray-300)',
          borderRadius: 4, outline: 'none', background: props.disabled ? 'var(--gray-50)' : 'white',
          boxShadow: focused && !error ? '0 0 0 3px rgba(0,156,166,0.12)' : 'none',
          width: '100%', ...props.style,
        }} />
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  );
}

function PasswordInput({ label, required, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)' }}>
        {label}{required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
      </label>}
      <div style={{ position: 'relative' }}>
        <input {...props} type={show ? 'text' : 'password'}
          style={{ padding: '8px 40px 8px 12px', fontSize: 14, color: 'var(--gray-900)', fontFamily: 'inherit', border: error ? '1px solid var(--danger-500)' : '1px solid var(--gray-300)', borderRadius: 4, outline: 'none', width: '100%', ...props.style }}
          onFocus={e => { e.target.style.border = '2px solid var(--brand-500)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,156,166,0.12)'; }}
          onBlur={e => { e.target.style.border = error ? '1px solid var(--danger-500)' : '1px solid var(--gray-300)'; e.target.style.boxShadow = 'none'; }} />
        <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0, display: 'flex' }}>
          <Icon name={show ? 'eye-off' : 'eye'} size={15} />
        </button>
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  );
}

function QSelect({ label, required, error, options = [], containerStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)' }}>
        {label}{required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
      </label>}
      <select {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ padding: '8px 12px', fontSize: 14, color: 'var(--gray-900)', fontFamily: 'inherit', border: focused ? '2px solid var(--brand-500)' : '1px solid var(--gray-300)', borderRadius: 4, outline: 'none', background: 'white', width: '100%', boxShadow: focused ? '0 0 0 3px rgba(0,156,166,0.12)' : 'none', ...props.style }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  );
}

function Textarea({ label, required, error, containerStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)' }}>
        {label}{required && <span style={{ color: 'var(--danger-500)', marginLeft: 2 }}>*</span>}
      </label>}
      <textarea {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ padding: '8px 12px', fontSize: 14, color: 'var(--gray-900)', fontFamily: 'inherit', border: focused ? '2px solid var(--brand-500)' : '1px solid var(--gray-300)', borderRadius: 4, outline: 'none', resize: 'vertical', minHeight: 90, width: '100%', boxShadow: focused ? '0 0 0 3px rgba(0,156,166,0.12)' : 'none', ...props.style }} />
      {error && <span style={{ fontSize: 12, color: 'var(--danger-500)' }}>{error}</span>}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: checked ? 'var(--brand-500)' : 'var(--gray-300)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      {label && <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{label}</span>}
    </div>
  );
}

// ─── Alert ─────────────────────────────────────────────────────────
function Alert({ type = 'error', children }) {
  const cfg = {
    error:   { bg: 'var(--danger-50)',  border: 'var(--danger-500)',  icon: 'x-circle',       color: 'var(--danger-500)' },
    success: { bg: 'var(--success-50)', border: 'var(--success-500)', icon: 'check-circle',   color: 'var(--success-500)' },
    info:    { bg: 'var(--brand-50)',   border: 'var(--brand-500)',   icon: 'info',            color: 'var(--brand-500)' },
    warning: { bg: 'var(--warning-50)', border: 'var(--warning-500)', icon: 'alert-triangle', color: 'var(--warning-500)' },
  }[type];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--gray-800)' }}>
      <Icon name={cfg.icon} size={16} color={cfg.color} style={{ marginTop: 1, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

// ─── Row action menu ───────────────────────────────────────────────
function RowMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ ...Btn.ghost, padding: '4px 8px', color: open ? 'var(--gray-900)' : 'var(--gray-400)' }}>
        <Icon name="more-horizontal" size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 200, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 6, boxShadow: 'var(--shadow-md)', minWidth: 150, overflow: 'hidden' }}>
          {actions.map((a, i) => a === 'divider'
            ? <div key={i} style={{ height: 1, background: 'var(--gray-100)', margin: '2px 0' }} />
            : (
              <button key={i} onClick={() => { setOpen(false); a.action(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: a.danger ? 'var(--danger-500)' : a.warning ? 'var(--warning-500)' : 'var(--gray-800)', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = a.danger ? 'var(--danger-50)' : 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {a.icon && <Icon name={a.icon} size={14} color={a.danger ? 'var(--danger-500)' : a.warning ? 'var(--warning-500)' : 'var(--gray-500)'} />}
                {a.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Card + QuiverLogo ─────────────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, boxShadow: 'var(--shadow-sm)', ...style }}>{children}</div>;
}

function QuiverLogo({ size = 28 }) {
  const r = Math.round(size * 0.21);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.57} height={size * 0.57} viewBox="0 0 16 16" fill="none">
        <path d="M3 4l5 8 5-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────
function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Icon name={icon} size={40} color="var(--gray-300)" style={{ marginBottom: 12 }} />
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: action ? 20 : 0, maxWidth: 320, lineHeight: 1.5 }}>{description}</div>}
      {action}
    </div>
  );
}

// ─── Page header ───────────────────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>{actions}</div>}
    </div>
  );
}

// ─── Back link ─────────────────────────────────────────────────────
function BackLink({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ ...Btn.link, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon name="arrow-left" size={14} color="var(--brand-500)" />
      {label}
    </button>
  );
}

// ─── Detail field ──────────────────────────────────────────────────
function DetailField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', lineHeight: 1.4 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--gray-900)', lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

Object.assign(window, {
  NavigationContext, DataContext,
  Btn, Icon, Badge, Avatar, Spinner,
  ToastContainer, useToast, DeleteModal, SkeletonRow,
  Input, PasswordInput, QSelect, Textarea, Toggle,
  Alert, RowMenu, Card, QuiverLogo, EmptyState, PageHeader, BackLink, DetailField,
});
