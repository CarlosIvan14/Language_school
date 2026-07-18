// FILE: apps/web/src/app/(student)/student/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  A1: { bg: 'rgba(45,58,92,0.5)', color: 'rgb(var(--ink2))' },
  A2: { bg: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' },
  B1: { bg: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' },
  B2: { bg: 'rgba(251,146,60,0.15)', color: 'rgb(251,146,60)' },
  C1: { bg: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' },
  C2: { bg: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' },
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
    <div className="p-6 max-w-[960px] mx-auto relative z-10">
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Mis cursos</h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>{enrollments.length} inscripciones activas</p>
        </div>
        <Link href="/courses" className="btn-ghost px-4 py-2" style={{ borderRadius: '0.5rem' }}>Ver catálogo</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="bezel"><div className="bezel-inner h-32 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !enrollments.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: 'rgba(79,142,247,0.1)' }}>
            <Icon name="book" size={22} style={{ color: 'rgb(var(--blue))' }} />
          </div>
          <p className="text-[15px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>Sin cursos aún</p>
          <p className="text-[13px] mb-4" style={{ color: 'rgb(var(--ink2))' }}>Explora el catálogo y encuentra tu curso ideal.</p>
          <Link href="/courses" className="btn-primary px-5 py-2.5 inline-flex" style={{ borderRadius: '0.5rem' }}>Ver cursos disponibles</Link>
        </div></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {enrollments.map((e: any, i: number) => {
            const ls = LEVEL_STYLES[e.course?.level] ?? { bg: 'rgba(255,255,255,0.06)', color: 'rgb(var(--ink2))' }
            return (
              <div key={e.id} className="bezel animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="bezel-inner p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{e.course?.title}</h3>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>Prof. {e.course?.teacher?.user?.fullName ?? '—'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0" style={{ background: ls.bg, color: ls.color }}>{e.course?.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] mb-3" style={{ color: 'rgb(var(--ink2))' }}>
                    <span className="flex items-center gap-1"><Icon name="calendar" size={12} /> {e.course?.startsAt ? new Date(e.course.startsAt).toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '—'}</span>
                    <span className="flex items-center gap-1"><Icon name="clock" size={12} /> {e.course?.durationWeeks ?? '?'} sem</span>
                    <span className="flex items-center gap-1" style={{ color: e.status === 'active' ? 'rgb(var(--ok))' : 'rgb(var(--gold))' }}>
                      ● {e.status === 'active' ? 'Activo' : 'Lista de espera'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/courses/${e.courseId}`} className="flex-1 text-center text-[12px] py-1.5 rounded-lg transition-colors"
                      style={{ background: 'rgb(var(--s2))', color: 'rgb(var(--ink))' }}>Ver detalles</Link>
                    <Link href="/student/materials" className="flex-1 text-center text-[12px] py-1.5 rounded-lg transition-colors"
                      style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>Materiales</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
