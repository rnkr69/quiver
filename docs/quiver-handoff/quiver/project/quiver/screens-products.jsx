// Quiver — Product screens (List, Create, Edit, Detail)
const { useState, useContext, useEffect } = React;
const { NavigationContext, DataContext, Btn, Icon, Badge, Card, AdminLayout,
        SkeletonRow, RowMenu, DeleteModal, ToastContainer, useToast,
        Input, QSelect, Textarea, Toggle, EmptyState, PageHeader, BackLink, DetailField } = window;

// ─── Shared: Filter panel ──────────────────────────────────────────
function FilterPanel({ onClose, filters, setFilters }) {
  const [local, setLocal] = useState(filters);
  const set = k => v => setLocal(f => ({ ...f, [k]: v }));
  return (
    <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 16, marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>Filtros</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setLocal({})} style={{ ...Btn.ghost, fontSize: 12, padding: '3px 8px', color: 'var(--gray-600)' }}>Limpiar todo</button>
          <button onClick={onClose} style={{ ...Btn.ghost, padding: '3px 6px' }}><Icon name="x" size={14} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 5 }}>Estado</label>
          <select value={local.estado || 'Todos'} onChange={e => set('estado')(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gray-300)', borderRadius: 4, fontSize: 13, color: 'var(--gray-800)', background: 'white' }}>
            {['Todos', 'Activo', 'Inactivo'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 5 }}>Categoría</label>
          <select value={local.categoria || 'Todas'} onChange={e => set('categoria')(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gray-300)', borderRadius: 4, fontSize: 13, color: 'var(--gray-800)', background: 'white' }}>
            {['Todas', 'Electrónica', 'Hogar', 'Deportes', 'Accesorios', 'Ropa'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 5 }}>Precio máximo</label>
          <input type="number" placeholder="Sin límite" value={local.precio || ''} onChange={e => set('precio')(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gray-300)', borderRadius: 4, fontSize: 13, color: 'var(--gray-800)' }} />
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => { setFilters(local); onClose(); }} style={Btn.primary}>Aplicar filtros</button>
      </div>
    </div>
  );
}

// ─── SCREEN-05: Product list ───────────────────────────────────────
function ProductListScreen({ sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { products, setProducts } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Filter + search
  let rows = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.estado && filters.estado !== 'Todos') {
      const want = filters.estado === 'Activo' ? 'active' : 'inactive';
      if (p.status !== want) return false;
    }
    if (filters.categoria && filters.categoria !== 'Todas' && p.category !== filters.categoria) return false;
    if (filters.precio && p.price > Number(filters.precio)) return false;
    return true;
  });

  // Sort
  if (sortCol) {
    rows = [...rows].sort((a, b) => {
      const va = a[{ Nombre: 'name', Precio: 'price', Creado: 'created' }[sortCol] || sortCol];
      const vb = b[{ Nombre: 'name', Precio: 'price', Creado: 'created' }[sortCol] || sortCol];
      return (va > vb ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
    });
  }

  const pageRows = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(rows.length / PER_PAGE);
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'Todos' && v !== 'Todas');

  const handleSort = col => { setSortCol(c => c === col ? col : col); setSortDir(d => sortCol === col ? (d === 'asc' ? 'desc' : 'asc') : 'asc'); };
  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === pageRows.length ? [] : pageRows.map(r => r.id));

  const confirmDelete = () => {
    if (deleteTarget?.bulk) {
      setProducts(p => p.filter(r => !selected.includes(r.id)));
      addToast(`${selected.length} productos eliminados.`);
      setSelected([]);
    } else if (deleteTarget?.id) {
      setProducts(p => p.filter(r => r.id !== deleteTarget.id));
      addToast(`"${deleteTarget.name}" eliminado correctamente.`);
    }
    setDeleteTarget(null);
  };

  const COLS = ['Nombre', 'Precio', 'Estado', 'Categoría', 'Creado'];

  return (
    <AdminLayout breadcrumbs={[{ label: 'Catálogo', path: '/admin/productos' }, { label: 'Productos' }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/productos">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {deleteTarget && <DeleteModal item={deleteTarget.name} count={deleteTarget.bulk ? selected.length : null} resource="producto" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      <PageHeader title="Productos" subtitle={`${rows.length} registro${rows.length !== 1 ? 's' : ''}`}
        actions={<button onClick={() => navigate('/admin/productos/new')} style={Btn.primary}><Icon name="plus" size={15} />Crear producto</button>} />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
        <Icon name="search" size={15} color="var(--gray-400)" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar productos…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: 'var(--gray-800)', background: 'transparent', maxWidth: 300 }} />
        {search && <button onClick={() => setSearch('')} style={{ ...Btn.ghost, padding: 2 }}><Icon name="x" size={13} /></button>}
        <div style={{ width: 1, height: 22, background: 'var(--gray-200)' }} />
        <button onClick={() => setShowFilters(v => !v)} style={{ ...Btn.ghost, color: showFilters || hasActiveFilters ? 'var(--brand-600)' : 'var(--gray-700)', background: showFilters || hasActiveFilters ? 'var(--brand-50)' : 'transparent' }}>
          <Icon name="sliders-horizontal" size={15} />Filtros
          {hasActiveFilters && <span style={{ background: 'var(--brand-500)', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{Object.values(filters).filter(v => v && v !== 'Todos' && v !== 'Todas').length}</span>}
        </button>
        <button style={Btn.ghost}><Icon name="columns-3" size={15} />Columnas</button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(filters).filter(([, v]) => v && v !== 'Todos' && v !== 'Todas').map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--brand-700)' }}>
              {k}: {v}
              <button onClick={() => setFilters(f => { const n = { ...f }; delete n[k]; return n; })} style={{ ...Btn.ghost, padding: 0, color: 'var(--brand-400)' }}><Icon name="x" size={11} /></button>
            </div>
          ))}
          <button onClick={() => setFilters({})} style={{ ...Btn.ghost, fontSize: 12, padding: '2px 6px', color: 'var(--gray-500)' }}>Limpiar todo</button>
        </div>
      )}

      {showFilters && <FilterPanel onClose={() => setShowFilters(false)} filters={filters} setFilters={f => { setFilters(f); setPage(1); }} />}

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

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: selected.length > 0 ? '0 0 8px 8px' : 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 8 }}>
        {rows.length === 0 ? (
          <EmptyState icon={hasActiveFilters || search ? 'search' : 'package'}
            title={hasActiveFilters || search ? 'No se encontraron resultados' : 'No hay productos todavía'}
            description={hasActiveFilters || search ? 'Prueba con otros términos o limpia los filtros.' : 'Crea el primer producto para empezar.'}
            action={hasActiveFilters || search
              ? <button onClick={() => { setFilters({}); setSearch(''); }} style={Btn.secondary}>Limpiar filtros</button>
              : <button onClick={() => navigate('/admin/productos/new')} style={Btn.primary}><Icon name="plus" size={15} />Crear primer producto</button>} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ padding: '10px 16px', width: 40 }}>
                  <input type="checkbox" checked={selected.length === pageRows.length && pageRows.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--brand-500)', cursor: 'pointer' }} />
                </th>
                {COLS.map(col => (
                  <th key={col} onClick={() => handleSort(col)} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col}
                      <Icon name={sortCol === col ? (sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'} size={12} color={sortCol === col ? 'var(--brand-500)' : 'var(--gray-400)'} />
                    </span>
                  </th>
                ))}
                <th style={{ padding: '10px 16px', width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p, i) => {
                const sel = selected.includes(p.id);
                return (
                  <tr key={p.id} style={{ borderBottom: i < pageRows.length - 1 ? '1px solid var(--gray-100)' : 'none', background: sel ? 'var(--brand-50)' : 'white', borderLeft: sel ? '3px solid var(--brand-500)' : '3px solid transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--gray-50)'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'white'; }}>
                    <td style={{ padding: '11px 16px' }}><input type="checkbox" checked={sel} onChange={() => toggleSelect(p.id)} style={{ accentColor: 'var(--brand-500)', cursor: 'pointer' }} /></td>
                    <td style={{ padding: '11px 16px', cursor: 'pointer' }} onClick={() => navigate(`/admin/productos/${p.id}`)}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-900)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1, fontFamily: 'monospace' }}>ID-{String(p.id).padStart(4, '0')}</div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 14, color: 'var(--gray-800)', fontVariantNumeric: 'tabular-nums' }}>€ {p.price.toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '11px 16px' }}><Badge variant={p.status === 'active' ? 'success' : 'inactive'}>{p.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--gray-700)' }}>{p.category}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--gray-500)' }}>{p.created}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                      <RowMenu actions={[
                        { label: 'Ver', icon: 'eye', action: () => navigate(`/admin/productos/${p.id}`) },
                        { label: 'Editar', icon: 'pencil', action: () => navigate(`/admin/productos/${p.id}/edit`) },
                        'divider',
                        { label: 'Eliminar', icon: 'trash-2', danger: true, action: () => setDeleteTarget({ id: p.id, name: p.name }) },
                      ]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {rows.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px', fontSize: 13, color: 'var(--gray-600)' }}>
          <span>Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, rows.length)} de {rows.length}</span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...Btn.ghost, padding: '5px 8px', opacity: page === 1 ? 0.4 : 1 }}><Icon name="chevron-left" size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ ...Btn.ghost, padding: '5px 10px', minWidth: 32, background: p === page ? 'var(--brand-50)' : 'transparent', color: p === page ? 'var(--brand-700)' : 'var(--gray-700)', fontWeight: p === page ? 500 : 400 }}>{p}</button>
            ))}
            {totalPages > 5 && <span style={{ color: 'var(--gray-400)', padding: '0 4px' }}>…</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...Btn.ghost, padding: '5px 8px', opacity: page === totalPages ? 0.4 : 1 }}><Icon name="chevron-right" size={14} /></button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── Shared: Product form ──────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || { name: '', price: '', category: '', description: '', active: true });
  const [errors, setErrors] = useState({});
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Introduce un precio válido.';
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
          <Input label="Nombre del producto" required placeholder="Ej. Auriculares Premium BT-900"
            value={form.name} onChange={e => set('name')(e.target.value)} error={errors.name} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Precio" required placeholder="0.00" type="number" step="0.01"
              value={form.price} onChange={e => set('price')(e.target.value)} error={errors.price} />
            <QSelect label="Categoría" value={form.category} onChange={e => set('category')(e.target.value)}
              options={[{ value: '', label: 'Sin categoría' }, 'Electrónica', 'Hogar', 'Deportes', 'Accesorios', 'Ropa']} />
          </div>
          <Textarea label="Descripción" placeholder="Describe el producto…" rows={4}
            value={form.description} onChange={e => set('description')(e.target.value)} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 8 }}>Estado</div>
            <Toggle checked={form.active} onChange={v => set('active')(v)} label="Producto visible en el sistema" />
          </div>
        </div>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={onCancel} style={Btn.secondary}>Cancelar</button>
        <button type="submit" disabled={saving} style={{ ...Btn.primary, opacity: saving ? 0.8 : 1 }}>
          {saving ? <><window.Spinner size={14} color="rgba(255,255,255,0.8)" /> Guardando…</> : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}

// ─── SCREEN-06: Create product ─────────────────────────────────────
function ProductCreateScreen({ sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { setProducts } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);

  const save = async form => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const newProd = { id: Date.now(), name: form.name, price: Number(form.price), category: form.category || 'Sin categoría', status: form.active ? 'active' : 'inactive', description: form.description, created: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) };
    setProducts(p => [newProd, ...p]);
    setSaving(false);
    addToast('Producto creado correctamente.');
    setTimeout(() => navigate('/admin/productos'), 1200);
  };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Productos', path: '/admin/productos' }, { label: 'Nuevo producto' }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/productos">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Productos" onClick={() => navigate('/admin/productos')} />
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 20 }}>Nuevo producto</h1>
      <ProductForm onSave={save} onCancel={() => navigate('/admin/productos')} saving={saving} />
    </AdminLayout>
  );
}

// ─── SCREEN-07: Edit product ───────────────────────────────────────
function ProductEditScreen({ productId, sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { products, setProducts } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const product = products.find(p => p.id === productId);

  if (!product) return <AdminLayout breadcrumbs={[{ label: 'Productos', path: '/admin/productos' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/productos"><p style={{ color: 'var(--gray-500)' }}>Producto no encontrado.</p></AdminLayout>;

  const save = async form => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, name: form.name, price: Number(form.price), category: form.category, status: form.active ? 'active' : 'inactive', description: form.description } : p));
    setSaving(false);
    addToast('Producto actualizado correctamente.');
    setTimeout(() => navigate(`/admin/productos/${productId}`), 1200);
  };

  const initial = { name: product.name, price: product.price, category: product.category, description: product.description || '', active: product.status === 'active' };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Productos', path: '/admin/productos' }, { label: product.name }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/productos">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <BackLink label="Productos" onClick={() => navigate('/admin/productos')} />
      <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 20 }}>Editar: {product.name}</h1>
      <ProductForm initial={initial} onSave={save} onCancel={() => navigate(`/admin/productos/${productId}`)} saving={saving} />
    </AdminLayout>
  );
}

// ─── SCREEN-08: Product detail ─────────────────────────────────────
function ProductDetailScreen({ productId, sidebarCollapsed, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  const { products, setProducts } = useContext(DataContext);
  const { toasts, addToast, removeToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const product = products.find(p => p.id === productId);

  if (!product) return <AdminLayout breadcrumbs={[{ label: 'Productos', path: '/admin/productos' }]} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/productos"><p style={{ color: 'var(--gray-500)' }}>Producto no encontrado.</p></AdminLayout>;

  const confirmDelete = () => {
    setProducts(p => p.filter(r => r.id !== productId));
    navigate('/admin/productos');
  };

  return (
    <AdminLayout breadcrumbs={[{ label: 'Productos', path: '/admin/productos' }, { label: product.name }]}
      sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} currentPath="/admin/productos">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {deleteTarget && <DeleteModal item={deleteTarget.name} resource="producto" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      <BackLink label="Productos" onClick={() => navigate('/admin/productos')} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)' }}>{product.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 3 }}>Creado el {product.created}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate(`/admin/productos/${productId}/edit`)} style={Btn.secondary}><Icon name="pencil" size={15} />Editar</button>
          <button onClick={() => setDeleteTarget(product)} style={Btn.danger}><Icon name="trash-2" size={15} />Eliminar</button>
        </div>
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <DetailField label="Nombre">{product.name}</DetailField>
          <DetailField label="Precio">€ {product.price.toFixed(2).replace('.', ',')}</DetailField>
          <DetailField label="Categoría">{product.category}</DetailField>
          <DetailField label="Estado"><Badge variant={product.status === 'active' ? 'success' : 'inactive'}>{product.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></DetailField>
          {product.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <DetailField label="Descripción">{product.description || <span style={{ color: 'var(--gray-400)' }}>Sin descripción</span>}</DetailField>
            </div>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}

Object.assign(window, { ProductListScreen, ProductCreateScreen, ProductEditScreen, ProductDetailScreen });
