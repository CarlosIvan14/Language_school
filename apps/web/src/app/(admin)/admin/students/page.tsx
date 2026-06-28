'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminStudentsPage() {
  const [data, setData] = useState<any>({ items: [], total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) q.set('search', search)
    api.get<any>(`/admin/students?${q}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">Estudiantes</h1>
          <p className="text-sm text-muted-foreground">{data.total} registrados</p>
        </div>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre..."
          className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground w-56 focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {['Nombre', 'Email', 'Cursos activos', 'Registro', ''].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-4"><div className="h-4 bg-secondary rounded animate-pulse" /></td></tr>
              ))
            ) : data.items.map((s: any) => (
              <tr key={s.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                      {s.user?.fullName?.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{s.user?.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.user?.email}</td>
                <td className="px-4 py-3 text-muted-foreground text-center">{s.enrollments?.length ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.user?.createdAt).toLocaleDateString('es')}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-primary hover:underline cursor-pointer">Ver perfil</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="text-xs border border-border px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-secondary">Anterior</button>
          <span className="text-xs text-muted-foreground">{page} / {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
            className="text-xs border border-border px-3 py-1.5 rounded-md disabled:opacity-50 hover:bg-secondary">Siguiente</button>
        </div>
      )}
    </div>
  )
}
