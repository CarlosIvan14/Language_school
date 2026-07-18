// FILE: apps/web/src/app/(teacher)/teacher/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, auth } from '@/lib/api'
import { Icon } from '@/components/Icon'

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [firstName, setFirstName] = useState('Profesor')

  useEffect(() => {
    setFirstName(auth.getUser()?.fullName?.split(' ')[0] ?? 'Profesor')
    api.get('/teachers/me/dashboard').then(setData).catch(() => setData({}))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  const kpis = [
    { label: 'Cursos activos', value: data?.totalCourses, icon: 'book' as const, accent: 'rgb(var(--blue))' },
    { label: 'Estudiantes', value: data?.totalStudents, icon: 'users' as const, accent: 'rgb(var(--ok))' },
    { label: 'Clases esta semana', value: data?.sessionsThisWeek, icon: 'calendar' as const, accent: 'rgb(var(--gold))' },
    { label: 'Tareas por calificar', value: data?.pendingGrading, icon: 'clipboard' as const, accent: 'rgb(var(--err))' },
  ]

  return (
    <div className="p-6 max-w-[1140px] mx-auto relative z-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--ink2))' }}>{greeting}</p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>{firstName}</h1>
        </div>
        <Link href="/teacher/availability" className="btn-ghost px-4 py-2" style={{ borderRadius: '0.5rem' }}>
          <Icon name="calendar" size={14} /> Mi horario
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {kpis.map((k, i) => (
          <div key={k.label} className="bezel animate-fade-up" style={{ animationDelay: `${60 + i * 20}ms` }}>
            <div className="bezel-inner p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--ink2))' }}>{k.label}</p>
                <Icon name={k.icon} size={15} style={{ color: k.accent }} />
              </div>
              <p className="font-mono text-2xl font-medium" style={{ color: k.accent }}>{k.value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-2 gap-3">
        {/* Courses */}
        <div className="bezel animate-fade-up" style={{ animationDelay: '160ms' }}>
          <div className="bezel-inner">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Mis cursos</p>
              <Link href="/teacher/courses" className="text-2xs" style={{ color: 'rgb(var(--blue))' }}>Ver todos →</Link>
            </div>
            {!data ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-9 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />)}</div>
            ) : !data.courses?.length ? (
              <p className="px-4 py-8 text-[12px] text-center" style={{ color: 'rgb(var(--ink2))' }}>Sin cursos asignados aún</p>
            ) : (
              <div className="p-2">
                {data.courses.map((c: any) => (
                  <Link key={c.id} href={`/teacher/courses/${c.id}`} className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s2))')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{c.level}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{c.title}</p>
                      <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{c._count?.enrollments ?? 0} estudiantes</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="bezel animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="bezel-inner">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Próximas sesiones</p>
              <Link href="/teacher/sessions" className="text-2xs" style={{ color: 'rgb(var(--blue))' }}>Ver todas →</Link>
            </div>
            {!data ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-9 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />)}</div>
            ) : !data.upcomingSessions?.length ? (
              <p className="px-4 py-8 text-[12px] text-center" style={{ color: 'rgb(var(--ink2))' }}>Sin sesiones próximas</p>
            ) : (
              <div className="p-2">
                {data.upcomingSessions.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 px-2 py-2">
                    <div className="text-[11px] font-medium rounded-md px-2 py-1 flex-shrink-0 text-center"
                      style={{ background: 'rgba(245,166,35,0.12)', color: 'rgb(var(--gold))' }}>
                      {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] truncate" style={{ color: 'rgb(var(--ink))' }}>{s.course?.title}</p>
                      <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>
                        {new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
