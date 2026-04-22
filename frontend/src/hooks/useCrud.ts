import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crudApi } from '@/api/crud.api'

export function useCrud(resource: string) {
  const qc = useQueryClient()

  const config = useQuery({
    queryKey: ['crud-config', resource],
    queryFn: () => crudApi.getConfig(resource),
    staleTime: 1000 * 60 * 5,
  })

  function list(params?: Record<string, unknown>) {
    return useQuery({
      queryKey: ['crud-list', resource, params],
      queryFn: () => crudApi.list(resource, params),
    })
  }

  function get(id: string) {
    return useQuery({
      queryKey: ['crud-item', resource, id],
      queryFn: () => crudApi.get(resource, id),
      enabled: !!id,
    })
  }

  const create = useMutation({
    mutationFn: (data: unknown) => crudApi.create(resource, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crud-list', resource] }),
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => crudApi.update(resource, id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['crud-list', resource] })
      qc.invalidateQueries({ queryKey: ['crud-item', resource, id] })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => crudApi.remove(resource, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crud-list', resource] }),
  })

  const bulkRemove = useMutation({
    mutationFn: (ids: string[]) => crudApi.bulkRemove(resource, ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crud-list', resource] }),
  })

  return { config, list, get, create, update, remove, bulkRemove }
}
