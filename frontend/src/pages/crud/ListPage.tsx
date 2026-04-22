import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/components/crud/DataTable'
import { Filters } from '@/components/crud/Filters'
import { BulkActions } from '@/components/crud/BulkActions'
import { Pagination } from '@/components/crud/Pagination'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { crudApi } from '@/api/crud.api'
import { apiClient } from '@/api/client'

export function ListPage() {
  const { resource } = useParams<{ resource: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const qc = useQueryClient()

  const page = Number(searchParams.get('page') ?? '1')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<string | undefined>()
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      if (page !== 1) setSearchParams(prev => { prev.set('page', '1'); return prev })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['crud-config', resource],
    queryFn: () => crudApi.getConfig(resource!),
    staleTime: 1000 * 60 * 5,
    enabled: !!resource,
  })

  const relatedColumns = config?.columns.filter(c => c.col_type === 'related' && c.choices_endpoint) ?? []
  const relatedResults = useQueries({
    queries: relatedColumns.map(col => ({
      queryKey: ['related-choices', col.choices_endpoint],
      queryFn: () => apiClient.get<Array<{ value: unknown; label: string }>>(col.choices_endpoint!).then(r => r.data),
      staleTime: 1000 * 60 * 5,
    })),
  })
  const relatedMap: Record<string, Record<string, string>> = {}
  relatedColumns.forEach((col, i) => {
    const items = relatedResults[i]?.data
    if (items) relatedMap[col.key] = Object.fromEntries(items.map(d => [String(d.value), d.label ?? String(d.value)]))
  })

  const queryParams = {
    page,
    ...(search ? { search } : {}),
    ...filterValues,
    ...(sortBy ? { order_by: `${sortDir === 'desc' ? '-' : ''}${sortBy}` } : {}),
  }

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['crud-list', resource, queryParams],
    queryFn: () => crudApi.list(resource!, queryParams),
    enabled: !!resource,
  })

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => crudApi.bulkRemove(resource!, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crud-list', resource] })
      setSelectedIds([])
      setDeleteModalOpen(false)
      toast('Registros eliminados correctamente')
    },
    onError: () => toast('Error al eliminar los registros', 'error'),
  })

  function handleSort(key: string) {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
  }

  function handlePageChange(p: number) {
    setSearchParams(prev => { prev.set('page', String(p)); return prev })
  }

  if (configLoading) {
    return <div style={{ padding: 24, color: '#6b6b6b' }}>Cargando...</div>
  }

  if (!config) return null

  const canCreate = config.permissions?.create !== false

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', flex: 1 }}>
          {config.title ?? resource}
        </h1>
        <input
          type="search"
          placeholder="Buscar..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{
            padding: '7px 10px', border: '1px solid var(--gray-300)', borderRadius: 4,
            fontSize: 13, width: 200, fontFamily: 'inherit', outline: 'none',
            background: 'white', color: 'var(--gray-900)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--brand-400)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--gray-300)')}
        />
        {canCreate && (
          <Button variant="primary" onClick={() => navigate(`/admin/${resource}/new`)}>
            + Crear
          </Button>
        )}
      </div>

      <Filters
        filters={config.filters}
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      <BulkActions
        selectedCount={selectedIds.length}
        actions={config.bulk_actions ?? []}
        loading={bulkDelete.isPending}
        onAction={action => { if (action === 'delete') setDeleteModalOpen(true) }}
        onClear={() => setSelectedIds([])}
      />

      <DataTable
        columns={config.columns}
        data={listData?.items ?? []}
        isLoading={listLoading}
        sortBy={sortBy}
        sortDir={sortDir}
        selectedIds={selectedIds}
        onSort={handleSort}
        onSelect={setSelectedIds}
        onRowClick={row => navigate(`/admin/${resource}/${row.id}`)}
        relatedMap={relatedMap}
      />

      <Pagination
        page={page}
        pageSize={listData?.page_size ?? config.page_size ?? 25}
        total={listData?.total ?? 0}
        onChange={handlePageChange}
      />

      <Modal
        open={deleteModalOpen}
        title="Eliminar registros"
        confirmLabel="Eliminar"
        loading={bulkDelete.isPending}
        onConfirm={() => bulkDelete.mutate(selectedIds)}
        onCancel={() => setDeleteModalOpen(false)}
      >
        ¿Eliminar {selectedIds.length} registro{selectedIds.length !== 1 ? 's' : ''}? Esta acción no se puede deshacer.
      </Modal>
    </div>
  )
}
