'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth, api } from '@/lib/api'

interface DashboardData {
  enrollments: any[]
  upcomingSessions: any[]
  pendingHomework: any[]
  totalPoints: number
  attendancePercent: number
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const user = auth.getUser()

  useEffect(() => {
    api.get<DashboardData>('/students/me/dashboard')
      .then(setData)
      .catch(() => setData({
        enrollments: [],
        upcomingSessions: [],
        pendingHomework: [],
        totalPoints: 0,
        attendancePercent: 0,
      }))
  }, [])

  const firstName = user?.fullName?.split(' ')[0] ?? 'Estudiante'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Bienvenido, {firstName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Tu panel de aprendizaje</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Cursos activos', value: data?.enrollments?.length ?? '—', sub: 'cursos inscritos' },
          { label: 'Asistencia', value: data ? `${data.attendancePercent}%` : '—', sub: 'este mes' },
          { label: 'Tareas pendientes', value: data?.pendingHomework?.length ?? '—', sub: 'por entregar' },
          { label: 'Puntos', value: data?.totalPoints?.toLocaleString() ?? '—', sub: 'acumulados' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-secondary rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-medium font-heading text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Cursos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium text-foreground">Mis cursos</h2>
            <Link href="/courses" className="text-xs text-primary hover:underline">Ver catálogo →</Link>
          </div>
          {data?.enrollments?.length === 0 || !data ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">Aún no estás inscrito en ningún curso.</p>
              <Link href="/courses"
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs hover:opacity-90 transition-opacity">
                Ver cursos disponibles
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.enrollments.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-medium font-heading flex-shrink-0">
                    {e.course?.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.course?.title}</p>
                    <p className="text-xs text-muted-foreground">{e.course?.teacher?.user?.fullName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximas clases */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium text-foreground">Próximas clases</h2>
            <Link href="/student/calendar" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          {!data?.upcomingSessions?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin clases próximas.</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingSessions.slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="text-xs font-medium text-primary bg-primary/10 rounded-md px-2 py-1 whitespace-nowrap flex-shrink-0">
                    {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{s.title ?? s.course?.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {s.zoomLink && (
                    <a href={s.zoomLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:opacity-90 flex-shrink-0">
                      Entrar
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tareas pendientes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-sm font-medium text-foreground">Tareas pendientes</h2>
          <Link href="/student/homework" className="text-xs text-primary hover:underline">Ver todas →</Link>
        </div>
        {!data?.pendingHomework?.length ? (
          <p className="text-sm text-muted-foreground">¡Al día con todas las tareas! 🎉</p>
        ) : (
          <div className="divide-y divide-border">
            {data.pendingHomework.map((hw: any) => {
              const due = new Date(hw.dueAt)
              const isUrgent = due.getTime() - Date.now() < 24 * 60 * 60 * 1000
              return (
                <div key={hw.id} className="flex items-center gap-3 py-3">
                  <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{hw.title}</p>
                    <p className={`text-xs mt-0.5 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                      Vence {due.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                      {isUrgent && ' — ¡Urgente!'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
