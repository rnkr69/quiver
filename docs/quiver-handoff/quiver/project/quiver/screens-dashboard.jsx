// Quiver — Dashboard (SCREEN-04)
const { useState, useContext, useEffect, useRef } = React;
const { NavigationContext, Btn, Icon, Card, AdminLayout } = window;

// ─── Mini SVG area chart ───────────────────────────────────────────
function AreaChart({ data, color = 'var(--brand-500)', height = 180 }) {
  const W = 700, H = height, pad = { top: 16, right: 16, bottom: 32, left: 44 };
  const vals = data.map(d => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const x = i => pad.left + (i / (vals.length - 1)) * (W - pad.left - pad.right);
  const y = v => pad.top + (1 - (v - min) / range) * (H - pad.top - pad.bottom);

  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `M ${x(0)},${y(vals[0])} ` + vals.map((v, i) => `L ${x(i)},${y(v)}`).join(' ') + ` L ${x(vals.length-1)},${H - pad.bottom} L ${x(0)},${H - pad.bottom} Z`;
  const line = `M ${x(0)},${y(vals[0])} ` + vals.map((v, i) => `L ${x(i)},${y(v)}`).join(' ');

  const yTicks = 4;
  const gradId = `ag_${Math.random().toString(36).slice(2)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Y grid lines */}
      {Array.from({ length: yTicks }).map((_, i) => {
        const v = min + (range * i / (yTicks - 1));
        const yy = y(v);
        return (
          <g key={i}>
            <line x1={pad.left} y1={yy} x2={W - pad.right} y2={yy} stroke="var(--gray-100)" strokeWidth="1" />
            <text x={pad.left - 6} y={yy + 4} textAnchor="end" fontSize="11" fill="var(--gray-400)">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      {/* Area + line */}
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {vals.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill={color} stroke="white" strokeWidth="2" />)}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--gray-500)">{d.label}</text>
      ))}
    </svg>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon, value, label, trend, trendDir = 'up', onClick }) {
  return (
    <Card style={{ padding: 20, cursor: onClick ? 'pointer' : 'default' }} >
      <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color="var(--brand-500)" />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{value}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{label}</div>
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: trendDir === 'up' ? 'var(--success-500)' : 'var(--danger-500)' }}>
            <Icon name={trendDir === 'up' ? 'trending-up' : 'trending-down'} size={14} color={trendDir === 'up' ? 'var(--success-500)' : 'var(--danger-500)'} />
            {trend}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Chart Widget ──────────────────────────────────────────────────
function ChartWidget({ title, data, color }) {
  const [period, setPeriod] = useState('6m');
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Últimos {period === '6m' ? '6 meses' : '12 meses'}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['6m', '12m'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ ...Btn.ghost, padding: '4px 10px', fontSize: 12, background: period === p ? 'var(--brand-50)' : 'transparent', color: period === p ? 'var(--brand-700)' : 'var(--gray-600)', borderRadius: 4 }}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <AreaChart data={period === '6m' ? data.slice(-6) : data} color={color} />
    </Card>
  );
}

// ─── Activity feed ──────────────────────────────────────────────────
function ActivityFeed({ items }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 16 }}>Actividad reciente</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, borderBottom: i < items.length - 1 ? '1px solid var(--gray-100)' : 'none', paddingTop: i > 0 ? 14 : 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={item.icon} size={15} color={item.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--gray-800)', lineHeight: 1.4 }}>{item.text}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── SCREEN-04 Dashboard ───────────────────────────────────────────
function DashboardScreen({ sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);

  const chartData = [
    { label: 'Jul', value: 380 }, { label: 'Ago', value: 412 },
    { label: 'Sep', value: 390 }, { label: 'Oct', value: 451 },
    { label: 'Nov', value: 499 }, { label: 'Dic', value: 521 },
    { label: 'Ene', value: 480 }, { label: 'Feb', value: 543 },
    { label: 'Mar', value: 612 }, { label: 'Abr', value: 589 },
    { label: 'May', value: 671 }, { label: 'Jun', value: 724 },
  ];

  const revenueData = [
    { label: 'Jul', value: 28400 }, { label: 'Ago', value: 31200 },
    { label: 'Sep', value: 29800 }, { label: 'Oct', value: 35100 },
    { label: 'Nov', value: 41200 }, { label: 'Dic', value: 52800 },
    { label: 'Ene', value: 38900 }, { label: 'Feb', value: 44300 },
    { label: 'Mar', value: 47600 }, { label: 'Abr', value: 43200 },
    { label: 'May', value: 51800 }, { label: 'Jun', value: 58400 },
  ];

  const activity = [
    { icon: 'user-plus', color: 'var(--brand-500)', text: 'Nuevo usuario registrado: carlos@empresa.com', time: 'Hace 12 min' },
    { icon: 'package', color: 'var(--success-500)', text: 'Producto "Monitor 4K UltraWide" actualizado', time: 'Hace 34 min' },
    { icon: 'shield', color: 'var(--warning-500)', text: 'Rol "Cliente Premium" modificado — 3 permisos añadidos', time: 'Hace 1 hora' },
    { icon: 'user-x', color: 'var(--danger-500)', text: 'Usuario juan@empresa.com desactivado', time: 'Hace 2 horas' },
    { icon: 'tag', color: 'var(--brand-500)', text: 'Nueva categoría "Accesorios Tech" creada', time: 'Hace 3 horas' },
  ];

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 14 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1.3 }}>{greeting}, Ana</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 3, textTransform: 'capitalize' }}>{today}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard icon="users" value="1.432" label="Usuarios registrados" trend="↑ 12% vs mes anterior" trendDir="up" onClick={() => navigate('/admin/users')} />
        <StatCard icon="package" value="284" label="Productos activos" trend="↑ 3% vs mes anterior" trendDir="up" onClick={() => navigate('/admin/productos')} />
        <StatCard icon="shield" value="3" label="Roles configurados" onClick={() => navigate('/admin/roles')} />
        <StatCard icon="activity" value="724" label="Accesos este mes" trend="↑ 8% vs mes anterior" trendDir="up" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <ChartWidget title="Accesos al sistema" data={chartData} color="var(--brand-500)" />
        <ChartWidget title="Ingresos (€)" data={revenueData} color="var(--success-500)" />
      </div>

      {/* Activity */}
      <ActivityFeed items={activity} />
    </AdminLayout>
  );
}

Object.assign(window, { DashboardScreen });
