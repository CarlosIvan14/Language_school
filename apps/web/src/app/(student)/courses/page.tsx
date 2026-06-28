'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-blue-100 text-blue-700', A2: 'bg-blue-200 text-blue-800',
  B1: 'bg-green-100 text-green-700', B2: 'bg-amber-100 text-amber-700',
  C1: 'bg-orange-100 text-orange-700', C2: 'bg-red-100 text-red-700',
}

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any>('/students/me/dashboard')
      .then(d => setEnrollments(d.enrollments ?? []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">Mis cursos</h1>
          <p className="text-sm text-muted-foreground mt-1">{enrollments.length} inscripciones activas</p>
        </div>
        <Link href="/courses" className="text-sm border border-border text-foreground px-4 py-2 rounded-md hover:bg-secondary transition-colors">
          Ver catálogo
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary rounded-xl animate-pulse" />)}</div>
      ) : !enrollments.length ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-heading text-lg text-foreground mb-1">Sin cursos aún</p>
          <p className="text-sm text-muted-foreground mb-4">Explora el catálogo y encuentra el curso perfecto para ti.</p>
          <Link href="/courses" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Ver cursos disponibles
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {enrollments.map((e: any) => (
            <div key={e.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-foreground">{e.course?.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Prof. {e.course?.teacher?.user?.fullName ?? '—'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${LEVEL_COLORS[e.course?.level] ?? 'bg-secondary text-muted-foreground'}`}>
                  {e.course?.level}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                <span>🗓 {e.course?.startsAt ? new Date(e.course.startsAt).toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '—'}</span>
                <span>⏱ {e.course?.durationWeeks ?? '?'} semanas</span>
                <span className={`${e.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>● {e.status === 'active' ? 'Activo' : 'Lista de espera'}</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/courses/${e.courseId}`}
                  className="flex-1 text-center text-xs border border-border text-foreground py-1.5 rounded-md hover:bg-secondary transition-colors">
                  Ver detalles
                </Link>
                <Link href="/student/materials"
                  className="flex-1 text-center text-xs bg-primary/10 text-primary py-1.5 rounded-md hover:bg-primary/20 transition-colors">
                  Materiales
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
