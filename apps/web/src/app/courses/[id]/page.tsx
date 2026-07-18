// FILE: apps/web/src/app/courses/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, auth } from '@/lib/api'
import { Icon } from '@/components/Icon'

const MODALITY_LABELS: Record<string, string> = { online: 'Online', in_person: 'Presencial', hybrid: 'Híbrido' }
const LEVEL_STYLES: Record<string, { bg: string; color: string }> = {
  A1: { bg: 'rgba(45,58,92,0.5)', color: 'rgb(var(--ink2))' },
  A2: { bg: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' },
  B1: { bg: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' },
  B2: { bg: 'rgba(251,146,60,0.15)', color: 'rgb(251,146,60)' },
  C1: { bg: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' },
  C2: { bg: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' },
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [user, setUser] = useState<{ role?: string } | null>(null)

  useEffect(() => {
    if (auth.isLoggedIn()) setUser(auth.getUser())
    api.get<any>(`/courses/${id}`).then(setCourse).catch(() => router.push('/courses')).finally(() => setLoading(false))
  }, [id])

  async function handleEnroll() {
    if (!auth.isLoggedIn()) { router.push('/login'); return }
    setEnrolling(true); setMessage(null)
    try {
      const res = await api.post<any>(`/courses/${id}/enroll`, {})
      setEnrolled(true)
      setMessage({ text: res.message ?? 'Inscripción exitosa', type: 'success' })
    } catch (e: any) {
      setMessage({ text: e?.message ?? 'Error al inscribirse', type: 'error' })
    } finally { setEnrolling(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgb(5,7,14)' }}>
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(79,142,247,0.3)', borderTopColor: 'rgb(var(--blue))' }} />
    </div>
  )
  if (!course) return null

  const activeEnrolled = course._count?.enrollments ?? 0
  const isFull = activeEnrolled >= course.capacity
  const pct = Math.min(100, Math.round((activeEnrolled / course.capacity) * 100))
  const ls = LEVEL_STYLES[course.level] ?? { bg: 'rgba(255,255,255,0.06)', color: 'rgb(var(--ink2))' }
  const dashHref = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

  return (
    <div className="min-h-screen" style={{ background: 'rgb(5,7,14)' }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(9,13,24,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/courses" className="flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>
          <Icon name="arrow-left" size={14} /> Volver al catálogo
        </Link>
        {user ? (
          <Link href={dashHref} className="text-[13px]" style={{ color: 'rgb(var(--blue))' }}>Mi panel</Link>
        ) : (
          <div className="flex gap-2 items-center">
            <Link href="/login" className="btn-ghost text-[12px] px-3 py-1.5">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-[12px] px-3 py-1.5">Registrarse</Link>
          </div>
        )}
      </nav>

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main */}
          <div className="col-span-2 space-y-4">
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full font-bold" style={{ background: ls.bg, color: ls.color }}>{course.level}</span>
                <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(var(--ink2))' }}>
                  {MODALITY_LABELS[course.modality] ?? course.modality}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: 'rgb(var(--ink))' }}>{course.title}</h1>
              {course.description && <p className="text-[14px]" style={{ color: 'rgb(var(--ink2))' }}>{course.description}</p>}
            </div>

            {course.teacher?.user && (
              <div className="bezel animate-fade-up" style={{ animationDelay: '40ms' }}><div className="bezel-inner p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                  {course.teacher.user.fullName?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'rgb(var(--ink3))' }}>Instructor</p>
                  <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{course.teacher.user.fullName}</p>
                  {course.teacher.bio && <p className="text-[11px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>{course.teacher.bio}</p>}
                </div>
              </div></div>
            )}

            {course.sessions?.length > 0 && (
              <div className="bezel animate-fade-up" style={{ animationDelay: '80ms' }}><div className="bezel-inner p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Próximas sesiones</p>
                <div className="space-y-2">
                  {course.sessions.map((s: any, i: number) => (
                    <div key={s.id} className="flex items-center gap-3 py-2" style={{ borderBottom: i < course.sessions.length - 1 ? '1px solid rgba(var(--bd-soft))' : 'none' }}>
                      <div className="text-[11px] font-medium rounded-md px-2 py-1 w-6 text-center flex-shrink-0" style={{ background: 'rgba(79,142,247,0.1)', color: 'rgb(var(--blue))' }}>{i + 1}</div>
                      <div>
                        <p className="text-[13px]" style={{ color: 'rgb(var(--ink))' }}>{s.title ?? `Sesión ${i + 1}`}</p>
                        <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>
                          {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} · {s.durationMin} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div></div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bezel sticky top-24 animate-fade-up" style={{ animationDelay: '60ms' }}><div className="bezel-inner p-5">
              <div className="mb-4">
                <span className="font-mono text-3xl font-medium" style={{ color: 'rgb(var(--ink))' }}>${(course.priceCents / 100).toFixed(0)}</span>
                <span className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}> /hora</span>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { icon: 'calendar' as const, label: 'Inicio', value: course.startsAt ? new Date(course.startsAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                  { icon: 'clock' as const, label: 'Duración', value: `${course.durationWeeks ?? '?'} semanas` },
                  { icon: 'users' as const, label: 'Capacidad', value: `${activeEnrolled}/${course.capacity}` },
                  { icon: 'globe' as const, label: 'Modalidad', value: MODALITY_LABELS[course.modality] ?? course.modality },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-[12px]">
                    <span className="flex items-center gap-1.5" style={{ color: 'rgb(var(--ink2))' }}><Icon name={r.icon} size={12} /> {r.label}</span>
                    <span className="font-medium" style={{ color: 'rgb(var(--ink))' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--s2))' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isFull ? 'rgb(var(--err))' : 'rgb(var(--blue))' }} />
                </div>
                <p className="text-[11px] mt-1" style={{ color: isFull ? 'rgb(var(--err))' : 'rgb(var(--ink2))' }}>
                  {isFull ? 'Lleno · lista de espera' : `${course.capacity - activeEnrolled} plazas disponibles`}
                </p>
              </div>

              {message && (
                <div className="text-[12px] px-3 py-2 rounded-lg mb-3 flex items-center gap-2"
                  style={{ background: message.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', color: message.type === 'success' ? 'rgb(var(--ok))' : 'rgb(var(--err))', border: `1px solid ${message.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)'}` }}>
                  <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={13} /> {message.text}
                </div>
              )}

              {enrolled ? (
                <Link href={dashHref} className="w-full block text-center py-2.5 rounded-lg text-[13px] font-medium" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>
                  Ver mi panel →
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full py-2.5 text-[13px] disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>
                  {enrolling ? 'Procesando...' : isFull ? 'Unirse a lista de espera' : 'Inscribirme ahora'}
                </button>
              )}

              {!user && (
                <p className="text-[11px] text-center mt-2" style={{ color: 'rgb(var(--ink2))' }}>
                  <Link href="/login" style={{ color: 'rgb(var(--blue))' }}>Inicia sesión</Link> para inscribirte
                </p>
              )}
            </div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
