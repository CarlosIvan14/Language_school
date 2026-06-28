// FILE: apps/web/src/app/(admin)/admin/students/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

interface Student {
  id: string
  user: {
    fullName: string
    email: string
    avatarUrl?: string
    createdAt: string
  }
  enrollments: { id: string; status: string }[]
}

interface StudentsResponse {
  items: Student[]
  total: number
  page: number
  pages: number
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function levelBadge(count: number) {
  if (count === 0) return { label: 'Sin cursos', color: 'rgb(var(--ink3))' }
  if (count === 1) return { label: 'Básico', color: 'rgb(var(--ok))' }
  if (count <= 3) return { label: 'Intermedio', color: 'rgb(var(--gold))' }
  return { label: 'Avanzado', color: 'rgb(var(--blue))' }
}

export default function StudentsPage() {
  const [data, setData] = useState<StudentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20', search: q })
      const res = await api.get<StudentsResponse>(`/admin/students?${params}`)
      setData(res)
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search) }, [load, page, search])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--ink))' }}>Estudiantes</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
            {data ? `${data.total} estudiantes registrados` : 'Cargando...'}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}>
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-[13px] rounded-lg outline-none w-64"
              style={{
                background: 'rgb(var(--s1))',
                border: '1px solid rgb(var(--bd))',
                color: 'rgb(var(--ink))',
              }}
            />
          </div>
          <button type="submit" className="btn-primary text-[12px] px-3 py-2">
            Buscar
          </button>
          {search && (
            <button type="button" className="btn-ghost text-[12px] px-3 py-2"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}>
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bezel mb-4">
          <div className="bezel-inner p-4 flex items-center gap-2" style={{ color: 'rgb(var(--err))' }}>
            <Icon name="alert-circle" size={14} />
            <span className="text-[13px]">{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bezel animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="bezel-inner overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
                {['Estudiante', 'Email', 'Cursos activos', 'Nivel', 'Registro'].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'rgb(var(--ink3))' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
                    {[140, 180, 60, 80, 100].map((w, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'rgb(var(--s2))', width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>
                    No se encontraron estudiantes
                  </td>
                </tr>
              ) : data?.items.map(student => {
                const activeEnrollments = student.enrollments.filter(e => e.status === 'active').length
                const badge = levelBadge(activeEnrollments)
                return (
                  <tr key={student.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgb(var(--bd))', cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                          style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                          {getInitials(student.user.fullName)}
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>
                          {student.user.fullName}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                      {student.user.email}
                    </td>
                    {/* Enrollments */}
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-mono font-medium" style={{ color: 'rgb(var(--ink))' }}>
                        {activeEnrollments}
                      </span>
                    </td>
                    {/* Level badge */}
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `color-mix(in srgb, ${badge.color} 15%, transparent)`, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    {/* Join date */}
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                      {formatDate(student.user.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
            Página {data.page} de {data.pages} &bull; {data.total} estudiantes
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-ghost text-[12px] px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <Icon name="arrow-left" size={13} />
              Anterior
            </button>
            {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => {
              const pg = i + 1
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className="w-8 h-8 rounded-lg text-[12px] font-medium transition-colors"
                  style={{
                    background: page === pg ? 'rgba(79,142,247,0.15)' : 'transparent',
                    color: page === pg ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                    border: page === pg ? '1px solid rgba(79,142,247,0.3)' : '1px solid transparent',
                  }}>
                  {pg}
                </button>
              )
            })}
            <button
              disabled={page >= data.pages}
              onClick={() => setPage(p => p + 1)}
              className="btn-ghost text-[12px] px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              Siguiente
              <Icon name="arrow-right" size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
