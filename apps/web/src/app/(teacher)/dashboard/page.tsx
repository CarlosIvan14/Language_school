'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, auth } from '@/lib/api'

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null)
  const user = auth.getUser()

  useEffect(() => {
    api.get('/teachers/me/dashboard').then(setData).catch(() => setData({}))
  }, [])

  const firstName = user?.fullName?.split(' ')[0] ?? 'Profesor'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Hola, {firstName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Panel del profesor</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Cursos activos', value: data?.totalCourses ?? '—' },
          { label: 'Estudiantes', value: data?.totalStudents ?? '—' },
          { label: 'Clases esta semana', value: data?.sessionsThisWeek ?? '—' },
          { label: 'Tareas por calificar', value: data?.pendingGrading ?? '—' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-secondary rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-medium font-heading text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium">Mis cursos</h2>
            <Link href="/teacher/courses" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          {!data?.courses?.length ? (
            <p className="text-sm text-muted-foreground">Sin cursos asignados aún.</p>
          ) : (
            <div className="space-y-3">
              {data.courses.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-medium font-heading flex-shrink-0">{c.level}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c._count?.enrollments ?? 0} estudiantes</p>
                  </div>
                  <Link href={`/teacher/courses/${c.id}`} className="text-xs text-primary hover:underline flex-shrink-0">Ver</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium">Próximas sesiones</h2>
            <Link href="/teacher/sessions" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          {!data?.upcomingSessions?.length ? (
            <p className="text-sm text-muted-foreground">Sin sesiones próximas.</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingSessions.slice(0, 4).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="text-xs font-medium text-primary bg-primary/10 rounded-md px-2 py-1 flex-shrink-0">
                    {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{s.course?.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
