// FILE: apps/web/src/app/courses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Globe, User, GraduationCap, Building2, ArrowRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  level: string
  modality: string
  capacity: number
  priceCents: number
  status: string
  teacher?: { user?: { fullName: string } }
  _count?: { enrollments: number }
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const MODALITIES = [
  { value: 'online', label: 'Online' },
  { value: 'in_person', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
]

const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  A1: { bg: 'rgba(45,58,92,0.5)', color: 'rgb(var(--ink2))' },
  A2: { bg: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' },
  B1: { bg: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' },
  B2: { bg: 'rgba(251,146,60,0.15)', color: 'rgb(251,146,60)' },
  C1: { bg: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' },
  C2: { bg: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' },
}

function LevelBadge({ level }: { level: string }) {
  const s = LEVEL_STYLES[level] ?? { bg: 'rgba(255,255,255,0.06)', color: 'rgb(var(--ink2))' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {level}
    </span>
  )
}

function ModalityBadge({ modality }: { modality: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode }> = {
    online: { label: 'Online', icon: <Globe size={11} /> },
    in_person: { label: 'Presencial', icon: <Building2 size={11} /> },
    hybrid: { label: 'Híbrido', icon: <Globe size={11} /> },
  }
  const m = map[modality] ?? { label: modality, icon: null }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(var(--ink2))' }}>
      {m.icon}{m.label}
    </span>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState('')
  const [modalityFilter, setModalityFilter] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (levelFilter) params.set('level', levelFilter)
    if (modalityFilter) params.set('modality', modalityFilter)
    setLoading(true)
    api.get<Course[]>(`/courses?${params}`)
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [levelFilter, modalityFilter])

  const filtered = courses

  return (
    <div className="min-h-screen" style={{ background: 'rgb(5,7,14)' }}>
      {/* Ambient orb */}
      <div className="fixed pointer-events-none" style={{ top: 0, left: '30%', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(79,142,247,0.06) 0%, transparent 65%)', transform: 'translateX(-50%)' }} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex justify-center px-4 pt-5 pb-3">
        <div
          className="flex items-center gap-6 px-5 py-2.5 rounded-2xl"
          style={{
            background: 'rgba(9,13,24,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold text-white" style={{ background: 'rgb(var(--blue))' }}>E</div>
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>EspañolPro</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/courses" className="text-[13px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--blue))' }}>Cursos</Link>
            <Link href="/#features" className="text-[13px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>Características</Link>
            <Link href="/#pricing" className="text-[13px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>Precios</Link>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Link href="/login" className="btn-ghost text-[12px] px-3 py-1.5">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-[12px] px-3 py-1.5">Registrarse</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center px-4 pt-14 pb-10 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ background: 'rgba(79,142,247,0.1)', color: 'rgb(var(--blue))' }}>
          <GraduationCap size={12} />
          Catálogo completo
        </div>
        <h1 className="text-[34px] font-semibold tracking-tight mb-3" style={{ color: 'rgb(var(--ink))' }}>
          Cursos disponibles
        </h1>
        <p className="text-[15px] max-w-xl mx-auto" style={{ color: 'rgb(var(--ink2))' }}>
          Encuentra el nivel perfecto y empieza a aprender español con profesores certificados.
        </p>
      </div>

      {/* Filter bar */}
      <div className="max-w-6xl mx-auto px-6 mb-8 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Level pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setLevelFilter('')}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={{
                background: !levelFilter ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                color: !levelFilter ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                border: !levelFilter ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Todos
            </button>
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(levelFilter === l ? '' : l)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                style={{
                  background: levelFilter === l ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                  color: levelFilter === l ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                  border: levelFilter === l ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="h-4 w-px mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Modality pills */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setModalityFilter('')}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={{
                background: !modalityFilter ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                color: !modalityFilter ? 'rgb(var(--ink))' : 'rgb(var(--ink2))',
                border: !modalityFilter ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Todos
            </button>
            {MODALITIES.map(m => (
              <button
                key={m.value}
                onClick={() => setModalityFilter(modalityFilter === m.value ? '' : m.value)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                style={{
                  background: modalityFilter === m.value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  color: modalityFilter === m.value ? 'rgb(var(--ink))' : 'rgb(var(--ink2))',
                  border: modalityFilter === m.value ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="ml-auto text-[12px]" style={{ color: 'rgb(var(--ink3))' }}>
            {!loading && `${filtered.length} curso${filtered.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16 relative z-10">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bezel">
                <div className="bezel-inner p-5 space-y-3">
                  <div className="h-5 w-16 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                  <div className="h-5 w-full rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                  <div className="h-3 w-3/4 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                  <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                  <div className="h-8 w-full rounded-lg animate-pulse mt-4" style={{ background: 'rgb(var(--s2))' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bezel max-w-md mx-auto">
            <div className="bezel-inner p-12 text-center">
              <GraduationCap size={32} className="mx-auto mb-3" style={{ color: 'rgb(var(--ink3))' }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>Sin cursos disponibles</p>
              <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Prueba con otros filtros o vuelve más tarde.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map((course, idx) => {
              const enrolled = course._count?.enrollments ?? 0
              const isFull = enrolled >= course.capacity
              return (
                <div
                  key={course.id}
                  className="bezel animate-fade-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="bezel-inner p-5 flex flex-col gap-3 h-full">
                    {/* Top row: level + modality */}
                    <div className="flex items-center justify-between">
                      <LevelBadge level={course.level} />
                      <ModalityBadge modality={course.modality} />
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-[15px] font-semibold leading-snug mb-1" style={{ color: 'rgb(var(--ink))' }}>
                        {course.title}
                      </h3>
                      {course.description && (
                        <p
                          className="text-[12px] leading-relaxed"
                          style={{
                            color: 'rgb(var(--ink2))',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-1.5">
                      <User size={12} style={{ color: 'rgb(var(--ink3))' }} />
                      <span className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                        {course.teacher?.user?.fullName ?? 'Por confirmar'}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span style={{ color: 'rgb(var(--ink3))' }}>Cupo</span>
                        <span style={{ color: isFull ? 'rgb(var(--err))' : 'rgb(var(--ink2))' }}>
                          {isFull ? 'Lleno' : `${enrolled}/${course.capacity}`}
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (enrolled / course.capacity) * 100)}%`,
                            background: isFull ? 'rgb(var(--err))' : 'rgb(var(--blue))',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1" />

                    {/* Price + CTA */}
                    <div
                      className="flex items-center justify-between pt-3 mt-1"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div>
                        <span className="font-mono text-[17px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>
                          ${(course.priceCents / 100).toFixed(2)}
                        </span>
                        <span className="text-[11px] ml-1" style={{ color: 'rgb(var(--ink3))' }}>MXN/mes</span>
                      </div>
                      <Link
                        href="/register"
                        className="btn-primary text-[12px] px-3 py-1.5 flex items-center gap-1.5"
                      >
                        Inscribirse <ArrowRight size={12} />
                      </Link>
                    </div>
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
