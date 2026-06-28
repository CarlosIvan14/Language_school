'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, auth } from '@/lib/api'

const MODALITY_LABELS: Record<string, string> = {
  online: 'Online', in_person: 'Presencial', hybrid: 'Híbrido',
}
const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-blue-500', A2: 'bg-blue-600', B1: 'bg-green-600',
  B2: 'bg-amber-500', C1: 'bg-orange-500', C2: 'bg-red-500',
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const user = auth.getUser()

  useEffect(() => {
    api.get<any>(`/courses/${id}`)
      .then(setCourse)
      .catch(() => router.push('/courses'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleEnroll() {
    if (!user) { router.push('/login'); return }
    setEnrolling(true)
    setMessage(null)
    try {
      const res = await api.post<any>(`/courses/${id}/enroll`, {})
      setEnrolled(true)
      setMessage({ text: res.message ?? 'Inscripción exitosa', type: 'success' })
    } catch (e: any) {
      setMessage({ text: e?.message ?? 'Error al inscribirse', type: 'error' })
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!course) return null

  const activeEnrolled = course._count?.enrollments ?? 0
  const isFull = activeEnrolled >= course.capacity
  const pct = Math.min(100, Math.round((activeEnrolled / course.capacity) * 100))

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Volver al catálogo
        </Link>
        {user ? (
          <Link href={`/${user.role}/dashboard`} className="text-sm text-primary hover:underline">Mi dashboard</Link>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Iniciar sesión</Link>
            <Link href="/register" className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90">Registrarse</Link>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${LEVEL_COLORS[course.level] ?? 'bg-primary'} text-white text-xs px-2.5 py-1 rounded-full font-medium`}>
                  {course.level}
                </span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {MODALITY_LABELS[course.modality] ?? course.modality}
                </span>
              </div>
              <h1 className="font-heading text-2xl font-medium text-foreground mb-1">{course.title}</h1>
              {course.description && (
                <p className="text-muted-foreground text-sm">{course.description}</p>
              )}
            </div>

            {/* Teacher */}
            {course.teacher?.user && (
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
                  {course.teacher.user.fullName?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Instructor</p>
                  <p className="font-medium text-sm text-foreground">{course.teacher.user.fullName}</p>
                  {course.teacher.bio && <p className="text-xs text-muted-foreground mt-1">{course.teacher.bio}</p>}
                </div>
              </div>
            )}

            {/* Sessions */}
            {course.sessions?.length > 0 && (
              <div>
                <h2 className="font-heading text-sm font-medium text-foreground mb-3">Próximas sesiones</h2>
                <div className="space-y-2">
                  {course.sessions.map((s: any, i: number) => (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="text-xs font-medium text-primary bg-primary/10 rounded-md px-2 py-1 w-6 text-center flex-shrink-0">{i + 1}</div>
                      <div>
                        <p className="text-sm text-foreground">{s.title ?? `Sesión ${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{s.durationMin} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar enrollment card */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
              <div className="mb-4">
                <span className="text-3xl font-heading font-medium text-foreground">
                  ${(course.priceCents / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground text-sm"> /mes</span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {[
                  { icon: '📅', label: 'Inicio', value: course.startsAt ? new Date(course.startsAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                  { icon: '⏱', label: 'Duración', value: `${course.durationWeeks ?? '?'} semanas` },
                  { icon: '👥', label: 'Capacidad', value: `${activeEnrolled}/${course.capacity} estudiantes` },
                  { icon: '🌐', label: 'Modalidad', value: MODALITY_LABELS[course.modality] ?? course.modality },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-muted-foreground">{r.icon} {r.label}</span>
                    <span className="text-foreground font-medium">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isFull ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mt-1 ${isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {isFull ? `Lleno · ${activeEnrolled - course.capacity} en lista de espera` : `${course.capacity - activeEnrolled} plazas disponibles`}
                </p>
              </div>

              {message && (
                <div className={`text-xs px-3 py-2 rounded-md mb-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive'}`}>
                  {message.text}
                </div>
              )}

              {enrolled ? (
                <Link href={user ? `/${user.role}/dashboard` : '/login'}
                  className="w-full block text-center bg-primary/10 text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary/20 transition-colors">
                  Ver mi dashboard →
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                  {enrolling ? 'Procesando...' : isFull ? 'Unirse a lista de espera' : 'Inscribirme ahora'}
                </button>
              )}

              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link> para inscribirte
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
