'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, auth } from '@/lib/api'

function Dot({ color }: { color: string }) {
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-dot" style={{ background: color }} />
}

function KpiCard({ label, value, sub, accent, delay = 0 }: {
  label: string; value: string | number; sub?: string; accent?: string; delay?: number
}) {
  return (
    <div className="bezel animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="bezel-inner p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] mb-3"
          style={{ color: 'rgb(var(--ink2))' }}>{label}</p>
        <p className="font-mono text-2xl font-medium leading-none"
          style={{ color: accent ?? 'rgb(var(--ink))' }}>{value ?? '—'}</p>
        {sub && <p className="text-[11px] mt-1.5" style={{ color: 'rgb(var(--ink2))' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null)
  const user = auth.getUser()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    api.get('/students/dashboard').then(setData).catch(() => setData({}))
  }, [])

  return (
    <div className="p-6 max-w-[1100px] mx-auto relative z-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'rgb(var(--ink2))' }}>{greeting}</p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
            {user?.fullName ?? 'Estudiante'}
          </h1>
        </div>
        <Link href="/student/courses" className="btn-primary">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Explorar cursos
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <KpiCard label="Cursos activos"    value={data?.activeCourses ?? '—'}  sub="inscripciones" delay={40} />
        <KpiCard label="Asistencia"        value={data?.attendanceRate != null ? `${data.attendanceRate}%` : '—'} sub="este mes" delay={60} accent="rgb(var(--ok))" />
        <KpiCard label="Tareas pendientes" value={data?.pendingHomework ?? '—'} sub="por entregar"  delay={80} accent={data?.pendingHomework > 0 ? 'rgb(var(--gold))' : undefined} />
        <KpiCard label="Puntos"            value={data?.points ?? '—'}          sub="gamificación"  delay={100} accent="rgb(var(--blue))" />
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-5 gap-3 mb-3">

        {/* Mis cursos */}
        <div className="col-span-3 bezel animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="bezel-inner">
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Mis cursos</p>
              <Link href="/student/courses" className="text-[10px] transition-opacity hover:opacity-70"
                style={{ color: 'rgb(var(--blue))' }}>Ver todos →</Link>
            </div>

            {!data ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                ))}
              </div>
            ) : !data.enrollments?.length ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[13px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>Sin cursos aún</p>
                <p className="text-[12px] mb-4" style={{ color: 'rgb(var(--ink2))' }}>Inscríbete para comenzar</p>
                <Link href="/student/courses" className="btn-primary text-[11px]">Explorar cursos</Link>
              </div>
            ) : (
              <div>
                {data.enrollments.slice(0, 4).map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={el => (el.currentTarget.style.background = 'rgb(var(--s2))')}
                    onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>
                      {e.course?.level ?? 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>
                        {e.course?.title}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: 'rgb(var(--ink2))' }}>
                        {e.course?.teacher?.user?.fullName ?? 'Profesor'} · {e.course?.modality}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dot color={e.status === 'active' ? 'rgb(var(--ok))' : 'rgb(var(--ink3))'} />
                      <span className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>
                        {e.status === 'active' ? 'Activo' : e.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Próximas clases */}
        <div className="col-span-2 bezel animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="bezel-inner">
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Próximas clases</p>
              <Link href="/student/calendar" className="text-[10px] transition-opacity hover:opacity-70"
                style={{ color: 'rgb(var(--blue))' }}>Calendario →</Link>
            </div>

            {!data ? (
              <div className="p-4 space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                ))}
              </div>
            ) : !data.upcomingSessions?.length ? (
              <p className="px-4 py-8 text-[12px] text-center" style={{ color: 'rgb(var(--ink2))' }}>
                No hay clases próximas
              </p>
            ) : (
              <div className="p-2 space-y-1">
                {data.upcomingSessions.slice(0, 5).map((s: any) => {
                  const dt = new Date(s.scheduledAt)
                  return (
                    <div key={s.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s2))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div className="flex-shrink-0 text-center w-8">
                        <p className="font-mono text-[16px] font-medium leading-none" style={{ color: 'rgb(var(--blue))' }}>
                          {dt.getDate()}
                        </p>
                        <p className="text-[8px] uppercase" style={{ color: 'rgb(var(--ink2))' }}>
                          {dt.toLocaleDateString('es-MX', { month: 'short' })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>
                          {s.course?.title}
                        </p>
                        <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>
                          {dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {s.zoomLink && (
                        <a href={s.zoomLink} target="_blank" rel="noopener noreferrer"
                          className="text-[9px] px-2 py-1 rounded-full"
                          style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>
                          Zoom
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tareas pendientes */}
      <div className="bezel animate-fade-up" style={{ animationDelay: '180ms' }}>
        <div className="bezel-inner">
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Tareas pendientes</p>
            <Link href="/student/homework" className="text-[10px] transition-opacity hover:opacity-70"
              style={{ color: 'rgb(var(--blue))' }}>Ver todas →</Link>
          </div>

          {!data ? (
            <div className="p-4 flex gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex-1 h-16 rounded-lg animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
              ))}
            </div>
          ) : !data.pendingHomeworkList?.length ? (
            <p className="px-4 py-6 text-[12px] text-center" style={{ color: 'rgb(var(--ink2))' }}>
              Sin tareas pendientes — ¡al día!
            </p>
          ) : (
            <div className="p-3 grid grid-cols-3 gap-2">
              {data.pendingHomeworkList.slice(0, 6).map((hw: any) => {
                const due = new Date(hw.dueAt)
                const urgent = due.getTime() - Date.now() < 48 * 3600 * 1000
                return (
                  <div key={hw.id} className="p-3 rounded-lg"
                    style={{
                      background: urgent ? 'rgba(248,113,113,0.06)' : 'rgb(var(--s2))',
                      border: `1px solid ${urgent ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.04)'}`,
                    }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Dot color={urgent ? 'rgb(var(--err))' : 'rgb(var(--gold))'} />
                      <span className="text-[9px] font-semibold uppercase tracking-widest"
                        style={{ color: urgent ? 'rgb(var(--err))' : 'rgb(var(--gold))' }}>
                        {urgent ? 'Urgente' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium mb-1 leading-tight" style={{ color: 'rgb(var(--ink))' }}>
                      {hw.title}
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>
                      Entrega: {due.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
