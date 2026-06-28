'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, auth } from '@/lib/api'

function Dot({ color }: { color: string }) {
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-dot" style={{ background: color }} />
}

function BentoStat({
  label, value, sub, accent, delay = 0,
}: { label: string; value: string | number; sub?: string; accent?: string; delay?: number }) {
  return (
    <div className="bezel animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="bezel-inner p-4 h-full">
        <p className="text-2xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>
          {label}
        </p>
        <p className="font-mono text-2xl font-medium leading-none mb-1"
          style={{ color: accent ?? 'rgb(var(--ink))' }}>
          {value ?? '—'}
        </p>
        {sub && <p className="text-[11px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const user = auth.getUser()

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).catch(() => setData({}))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="p-6 max-w-[1140px] mx-auto relative z-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--ink2))' }}>
            {greeting}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
            {user?.fullName ?? 'Administrador'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/courses/new" className="btn-primary">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo curso
          </Link>
          <Link href="/admin/crm" className="btn-ghost">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            CRM
          </Link>
        </div>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-6 gap-3 mb-3">
        {/* Large stat — col-span-2 */}
        <div className="col-span-2 bezel animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="bezel-inner p-5">
            <p className="text-2xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgb(var(--ink2))' }}>
              Ingresos del mes
            </p>
            <p className="font-mono text-4xl font-medium mb-1" style={{ color: 'rgb(var(--ok))' }}>
              {data?.monthlyRevenueCents != null
                ? `$${(data.monthlyRevenueCents / 100).toLocaleString('en-US')}`
                : '—'}
            </p>
            <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>USD este mes</p>
            <div className="mt-4 h-px" style={{ background: 'rgba(var(--bd))' }} />
            <div className="mt-4 flex gap-4">
              <div>
                <p className="font-mono text-lg font-medium" style={{ color: 'rgb(var(--ink))' }}>
                  {data?.totalStudents ?? '—'}
                </p>
                <p className="text-2xs" style={{ color: 'rgb(var(--ink2))' }}>estudiantes</p>
              </div>
              <div>
                <p className="font-mono text-lg font-medium" style={{ color: 'rgb(var(--ink))' }}>
                  {data?.activeCourses ?? '—'}
                </p>
                <p className="text-2xs" style={{ color: 'rgb(var(--ink2))' }}>cursos activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Small stats — col-span-1 each */}
        <BentoStat label="Asistencia" value={data?.attendanceRate != null ? `${data.attendanceRate}%` : '—'} sub="promedio" delay={80} />
        <BentoStat label="Prospectos" value={data?.activeProspects ?? '—'} sub="en pipeline" accent="rgb(var(--gold))" delay={100} />
        <BentoStat label="Certificados" value={data?.totalCertificates ?? '—'} sub="emitidos" delay={120} />
        <BentoStat label="Tareas pend." value={data?.pendingGrading ?? '—'} sub="sin calificar" accent="rgb(var(--err))" delay={140} />
      </div>

      {/* Bottom row — two panels */}
      <div className="grid grid-cols-2 gap-3">

        {/* Inscripciones recientes */}
        <div className="bezel animate-fade-up" style={{ animationDelay: '160ms' }}>
          <div className="bezel-inner">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Inscripciones recientes</p>
              <Link href="/admin/students" className="text-2xs transition-opacity hover:opacity-70"
                style={{ color: 'rgb(var(--blue))' }}>Ver todas →</Link>
            </div>

            {!data ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                    <div className="flex-1 h-3 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                  </div>
                ))}
              </div>
            ) : !data.recentEnrollments?.length ? (
              <p className="px-4 py-8 text-[12px] text-center" style={{ color: 'rgb(var(--ink2))' }}>
                Sin inscripciones recientes
              </p>
            ) : (
              <div>
                {data.recentEnrollments.slice(0, 5).map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}
                    onMouseEnter={el => (el.currentTarget.style.background = 'rgb(var(--s2))')}
                    onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: 'rgba(var(--blue-dim))', color: 'rgb(var(--blue))' }}>
                      {e.student?.user?.fullName?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] truncate" style={{ color: 'rgb(var(--ink))' }}>{e.student?.user?.fullName}</p>
                      <p className="text-2xs truncate" style={{ color: 'rgb(var(--ink2))' }}>{e.course?.title}</p>
                    </div>
                    <Dot color={e.status === 'active' ? 'rgb(var(--ok))' : 'rgb(var(--gold))'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagos recientes */}
        <div className="bezel animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="bezel-inner">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Pagos recientes</p>
              <Link href="/admin/payments" className="text-2xs transition-opacity hover:opacity-70"
                style={{ color: 'rgb(var(--blue))' }}>Ver todos →</Link>
            </div>

            {!data ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-3 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                ))}
              </div>
            ) : !data.recentPayments?.length ? (
              <p className="px-4 py-8 text-[12px] text-center" style={{ color: 'rgb(var(--ink2))' }}>
                Sin pagos registrados
              </p>
            ) : (
              <div>
                {data.recentPayments.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}
                    onMouseEnter={el => (el.currentTarget.style.background = 'rgb(var(--s2))')}
                    onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] truncate" style={{ color: 'rgb(var(--ink))' }}>{p.student?.user?.fullName}</p>
                      <p className="text-2xs" style={{ color: 'rgb(var(--ink2))' }}>
                        {new Date(p.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dot color={p.status === 'paid' ? 'rgb(var(--ok))' : p.status === 'failed' ? 'rgb(var(--err))' : 'rgb(var(--gold))'} />
                      <span className="font-mono text-[12px] font-medium" style={{ color: 'rgb(var(--ink))' }}>
                        ${(p.amountCents / 100).toFixed(0)}
                      </span>
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
