// FILE: apps/web/src/app/(admin)/admin/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Plus, Edit, Trash2, GraduationCap, Globe, Building2 } from 'lucide-react'

interface Course {
  id: string
  title: string
  level: string
  modality: string
  capacity: number
  priceCents: number
  status: string
  teacher?: { user?: { fullName: string } }
  _count?: { enrollments: number }
}

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  A1: { bg: 'rgba(45,58,92,0.5)', color: 'rgb(var(--ink2))' },
  A2: { bg: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' },
  B1: { bg: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' },
  B2: { bg: 'rgba(251,146,60,0.15)', color: 'rgb(251,146,60)' },
  C1: { bg: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' },
  C2: { bg: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' },
}

const MODALITY_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  online: { label: 'Online', bg: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))', icon: <Globe size={11} /> },
  in_person: { label: 'Presencial', bg: 'rgba(52,211,153,0.12)', color: 'rgb(var(--ok))', icon: <Building2 size={11} /> },
  hybrid: { label: 'Híbrido', bg: 'rgba(245,166,35,0.12)', color: 'rgb(var(--gold))', icon: <Globe size={11} /> },
}

function LevelBadge({ level }: { level: string }) {
  const s = LEVEL_STYLES[level] ?? { bg: 'rgba(255,255,255,0.06)', color: 'rgb(var(--ink2))' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
      {level}
    </span>
  )
}

function ModalityBadge({ modality }: { modality: string }) {
  const m = MODALITY_CONFIG[modality] ?? { label: modality, bg: 'rgba(255,255,255,0.06)', color: 'rgb(var(--ink2))', icon: null }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: m.bg, color: m.color }}>
      {m.icon}{m.label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Activo', color: 'rgb(var(--ok))', bg: 'rgba(52,211,153,0.1)' },
    full: { label: 'Lleno', color: 'rgb(var(--gold))', bg: 'rgba(245,166,35,0.1)' },
    cancelled: { label: 'Cancelado', color: 'rgb(var(--err))', bg: 'rgba(248,113,113,0.1)' },
    draft: { label: 'Borrador', color: 'rgb(var(--ink2))', bg: 'rgba(255,255,255,0.06)' },
  }
  const s = map[status] ?? { label: status, color: 'rgb(var(--ink2))', bg: 'rgba(255,255,255,0.06)' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api.get<Course[]>('/courses')
      .then(c => setCourses(c))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function deleteCourse(id: string) {
    if (!confirm('¿Cancelar este curso? Esta acción no se puede deshacer.')) return
    await api.delete(`/courses/${id}`).catch(() => {})
    load()
  }

  const COLS = ['Curso', 'Nivel', 'Modalidad', 'Capacidad', 'Precio', 'Estado', '']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--ink))' }}>Cursos</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
            {loading ? 'Cargando...' : `${courses.length} cursos registrados`}
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary flex items-center gap-1.5">
          <Plus size={14} />
          Nuevo curso
        </Link>
      </div>

      {/* Table */}
      <div className="bezel animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="bezel-inner overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {COLS.map(col => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'rgb(var(--ink3))' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[200, 50, 80, 60, 70, 60, 60].map((w, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'rgb(var(--s2))', width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <GraduationCap size={32} style={{ color: 'rgb(var(--ink3))' }} />
                      <p className="text-[14px] font-medium" style={{ color: 'rgb(var(--ink))' }}>Sin cursos registrados</p>
                      <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Crea el primer curso con el botón de arriba.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map(course => {
                  const enrolled = course._count?.enrollments ?? 0
                  return (
                    <tr
                      key={course.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Title + level */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                            style={{ background: LEVEL_STYLES[course.level]?.bg ?? 'rgba(255,255,255,0.06)', color: LEVEL_STYLES[course.level]?.color ?? 'rgb(var(--ink2))' }}
                          >
                            {course.level}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{course.title}</p>
                            <p className="text-[11px]" style={{ color: 'rgb(var(--ink3))' }}>
                              {course.teacher?.user?.fullName ?? 'Sin profesor'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <LevelBadge level={course.level} />
                      </td>
                      <td className="px-4 py-3">
                        <ModalityBadge modality={course.modality} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[13px]" style={{ color: 'rgb(var(--ink))' }}>
                          {enrolled}
                          <span style={{ color: 'rgb(var(--ink3))' }}>/{course.capacity}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[13px]" style={{ color: 'rgb(var(--ink))' }}>
                          ${(course.priceCents / 100).toFixed(0)}
                          <span className="text-[11px] ml-0.5" style={{ color: 'rgb(var(--ink3))' }}>MXN</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="p-1.5 rounded-lg transition-all hover:opacity-70"
                            style={{ color: 'rgb(var(--blue))' }}
                          >
                            <Edit size={13} />
                          </Link>
                          <button
                            onClick={() => deleteCourse(course.id)}
                            className="p-1.5 rounded-lg transition-all hover:opacity-70"
                            style={{ color: 'rgb(var(--err))' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
