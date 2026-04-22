import { useEffect, useState } from 'react'
import { useRoutes } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { ListPage } from '@/pages/crud/ListPage'
import { CreatePage } from '@/pages/crud/CreatePage'
import { EditPage } from '@/pages/crud/EditPage'
import { ShowPage } from '@/pages/crud/ShowPage'
import { PageRegistry, FallbackPage } from './PageRegistry'

interface PageDef {
  route: string
  component: string
  title: string
}

interface DynamicRoutesProps {
  zone: 'admin' | 'portal'
}

export function DynamicRoutes({ zone }: DynamicRoutesProps) {
  const [pages, setPages] = useState<PageDef[] | null>(null)

  useEffect(() => {
    const endpoint = zone === 'admin' ? '/admin/pages' : '/portal/pages'
    apiClient
      .get<PageDef[]>(endpoint)
      .then((res) => setPages(res.data))
      .catch(() => setPages([]))
  }, [zone])

  const routePrefix = zone === 'admin' ? '/admin' : '/portal'

  if (pages === null) return null

  const dynamicRoutes = pages.map((page) => {
    const relativePath = page.route.startsWith(routePrefix)
      ? page.route.slice(routePrefix.length).replace(/^\//, '')
      : page.route.replace(/^\//, '')

    const Component = PageRegistry.get(page.component)
    const element = Component ? (
      <Component />
    ) : (
      <FallbackPage name={page.component} />
    )

    return { path: relativePath, element }
  })

  // CRUD fallback routes — static dynamic-page paths above always win over these params
  const crudRoutes = zone === 'admin' ? [
    { path: ':resource', element: <ListPage /> },
    { path: ':resource/new', element: <CreatePage /> },
    { path: ':resource/:id/edit', element: <EditPage /> },
    { path: ':resource/:id', element: <ShowPage /> },
  ] : []

  return useRoutes([...dynamicRoutes, ...crudRoutes])
}
