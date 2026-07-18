// FILE: apps/web/src/app/(teacher)/teacher/courses/page.tsx
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

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[] | null>(null)

  useEffect(() => {
    api.get<any>('/teachers/me/dashboard').then(d => setCourses(d.courses ?? [])).catch(() => setCourses([]))
  }, [])

  return (
    <div className="p-6 max-w-[1000px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Mis cursos</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Gestiona estudiantes, sesiones, tareas y más dentro de cada curso</p>
      </div>

      {!courses ? (
        <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="bezel"><div className="bezel-inner h-28 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !courses.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: 'rgba(79,142,247,0.1)' }}>
            <Icon name="book" size={22} style={{ color: 'rgb(var(--blue))' }} />
          </div>
          <p className="text-[15px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>Sin cursos asignados</p>
          <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>El administrador te asignará cursos pronto.</p>
        </div></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {courses.map((c: any, i: number) => {
            const ls = LEVEL_STYLES[c.level] ?? { bg: 'rgba(255,255,255,0.06)', color: 'rgb(var(--ink2))' }
            return (
              <Link key={c.id} href={`/teacher/courses/${c.id}`} className="bezel group animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="bezel-inner p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[12px] font-bold" style={{ background: ls.bg, color: ls.color }}>{c.level}</div>
                    <Icon name="arrow-right" size={15} style={{ color: 'rgb(var(--ink3))' }} />
                  </div>
                  <p className="text-[14px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>{c.title}</p>
                  <p className="text-[12px] flex items-center gap-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                    <Icon name="users" size={12} /> {c._count?.enrollments ?? 0} estudiantes
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
