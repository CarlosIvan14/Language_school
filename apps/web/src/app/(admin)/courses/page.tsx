'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-blue-100 text-blue-700', A2: 'bg-blue-200 text-blue-800',
  B1: 'bg-green-100 text-green-700', B2: 'bg-amber-100 text-amber-700',
  C1: 'bg-orange-100 text-orange-700', C2: 'bg-red-100 text-red-700',
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    api.get<any[]>('/courses').then(c => { setCourses(c); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function cancelCourse(id: string) {
    if (!confirm('¿Cancelar este curso?')) return
    await api.delete(`/courses/${id}`).catch(() => {})
    load()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">Cursos</h1>
          <p className="text-sm text-muted-foreground">{courses.length} cursos registrados</p>
        </div>
        <Link href="/admin/courses/new" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">+ Nuevo curso</Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {['Curso', 'Nivel', 'Profesor', 'Inscritos', 'Precio', 'Estado', ''].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="p-4"><div className="h-4 bg-secondary rounded animate-pulse" /></td></tr>
              ))
            ) : courses.map(c => (
              <tr key={c.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[c.level] ?? 'bg-secondary text-muted-foreground'}`}>{c.level}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.teacher?.user?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-center">{c._count?.enrollments ?? 0}/{c.capacity}</td>
                <td className="px-4 py-3 text-muted-foreground">${(c.priceCents / 100).toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : c.status === 'full' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/courses/${c.id}`} className="text-xs text-primary hover:underline">Ver</Link>
                    <button onClick={() => cancelCourse(c.id)} className="text-xs text-destructive hover:underline">Cancelar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
