'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const MODALITIES = ['online', 'in_person', 'hybrid'] as const
const MODALITY_LABELS = { online: 'Online', in_person: 'Presencial', hybrid: 'Híbrido' }

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-blue-500', A2: 'bg-blue-600',
  B1: 'bg-brand-500', B2: 'bg-amber-500',
  C1: 'bg-orange-500', C2: 'bg-red-500',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [modalityFilter, setModalityFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (levelFilter) params.set('level', levelFilter)
    if (modalityFilter) params.set('modality', modalityFilter)
    api.get<any[]>(`/courses?${params}`)
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [levelFilter, modalityFilter])

  const filtered = courses.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">E</div>
          <span className="font-heading font-medium text-sm text-foreground">EspañolPro</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Iniciar sesión</Link>
          <Link href="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">Registrarse</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-heading text-3xl font-medium text-foreground mb-2">Catálogo de cursos</h1>
        <p className="text-muted-foreground mb-8">Encuentra el curso de español perfecto para tu nivel y horario.</p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setLevelFilter('')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!levelFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-border/80'}`}>
              Todos
            </button>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevelFilter(levelFilter === l ? '' : l)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${levelFilter === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-border/80'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)}
              className="text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground">
              <option value="">Modalidad</option>
              {MODALITIES.map(m => <option key={m} value={m}>{MODALITY_LABELS[m]}</option>)}
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="text-xs border border-input rounded-md px-3 py-1.5 bg-background text-foreground w-36 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-56 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No se encontraron cursos con esos filtros.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map(course => {
              const enrolled = course._count?.enrollments ?? 0
              const isFull = enrolled >= course.capacity
              const pct = Math.round((enrolled / course.capacity) * 100)

              return (
                <div key={course.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  <div className={`${LEVEL_COLORS[course.level] ?? 'bg-primary'} h-16 flex items-center justify-between px-4`}>
                    <span className="text-white text-xl font-heading font-medium opacity-90">{course.level}</span>
                    <span className="text-xs text-white/80 bg-white/20 rounded-full px-2 py-0.5">
                      {MODALITY_LABELS[course.modality as keyof typeof MODALITY_LABELS]}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-foreground mb-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Prof. {course.teacher?.user?.fullName ?? 'Por confirmar'}
                    </p>

                    <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                      <span>📅 {new Date(course.startsAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
                      <span>⏱ {course.durationWeeks} semanas</span>
                    </div>

                    <div className="mb-1">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isFull ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <p className={`text-[10px] mb-3 ${isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {isFull ? 'Curso lleno' : `${enrolled}/${course.capacity} inscritos`}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-medium font-heading text-foreground">
                          ${(course.priceCents / 100).toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground"> /mes</span>
                      </div>
                      <Link href={`/courses/${course.id}`}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                          isFull
                            ? 'border border-border text-muted-foreground hover:bg-secondary'
                            : 'bg-primary text-primary-foreground hover:opacity-90'
                        }`}>
                        {isFull ? 'Lista de espera' : 'Ver curso'}
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
