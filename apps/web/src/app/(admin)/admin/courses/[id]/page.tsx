// FILE: apps/web/src/app/(admin)/admin/courses/[id]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'
import { ZoomLogo } from '@/components/ZoomLogo'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
function fmtMin(m: number) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<any>(null)
  const [availability, setAvailability] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', scheduledAt: '', durationMin: 60 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadSessions = useCallback(() => { api.get<any[]>(`/courses/${id}/sessions`).then(setSessions).catch(() => setSessions([])) }, [id])

  useEffect(() => {
    api.get<any>(`/courses/${id}`).then(c => {
      setCourse(c)
      if (c.teacher?.id) api.get<any[]>(`/teachers/${c.teacher.id}/availability`).then(setAvailability).catch(() => {})
    }).catch(() => {})
    loadSessions()
  }, [id, loadSessions])

  async function addSession(e: React.FormEvent) {
    e.preventDefault()
    if (!form.scheduledAt) { setError('Elige fecha y hora'); return }
    setSaving(true); setError('')
    try {
      await api.post(`/courses/${id}/sessions`, {
        title: form.title || undefined,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMin: Number(form.durationMin),
      })
      setForm({ title: '', scheduledAt: '', durationMin: 60 })
      loadSessions()
    } catch (e: any) {
      setError(e.message ?? 'Error al agendar la sesión')
    } finally { setSaving(false) }
  }

  async function removeSession(sid: string) {
    await api.delete(`/courses/sessions/${sid}`).catch(() => {})
    setSessions(prev => prev.filter(s => s.id !== sid))
  }

  // Group availability by weekday for a readable reference
  const byDay: Record<number, any[]> = {}
  availability.forEach(a => { (byDay[a.weekday] ??= []).push(a) })

  const inputStyle: React.CSSProperties = { background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }

  return (
    <div className="p-6 max-w-[900px] mx-auto relative z-10">
      <div className="flex items-center gap-2 mb-4 animate-fade-up">
        <Link href="/admin/courses" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>
          <Icon name="arrow-left" size={14} /> Cursos
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-5 animate-fade-up" style={{ animationDelay: '30ms' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{course?.level ?? '—'}</div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>{course?.title ?? 'Cargando...'}</h1>
          <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Prof. {course?.teacher?.user?.fullName ?? '—'} · {course?._count?.enrollments ?? 0} estudiantes</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Teacher free hours reference */}
        <div className="bezel animate-fade-up" style={{ animationDelay: '60ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: 'rgb(var(--ink2))' }}>
            <Icon name="calendar" size={12} /> Horario libre del profesor
          </p>
          {!availability.length ? (
            <p className="text-[12px]" style={{ color: 'rgb(var(--ink3))' }}>El profesor aún no marcó su disponibilidad.</p>
          ) : (
            <div className="space-y-1.5">
              {[1,2,3,4,5,6,0].filter(d => byDay[d]?.length).map(d => (
                <div key={d} className="flex items-start gap-2 text-[12px]">
                  <span className="w-8 font-semibold" style={{ color: 'rgb(var(--ink))' }}>{DAYS[d]}</span>
                  <span style={{ color: 'rgb(var(--ok))' }}>{byDay[d].map(s => `${fmtMin(s.startMin)}–${fmtMin(s.endMin)}`).join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div></div>

        {/* Add session */}
        <div className="bezel animate-fade-up" style={{ animationDelay: '90ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Agendar sesión</p>
          <form onSubmit={addSession} className="space-y-2.5">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título (opcional)" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} required className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
            <select value={form.durationMin} onChange={e => setForm(f => ({ ...f, durationMin: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle}>
              {[30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
            {error && <p className="text-[12px] flex items-center gap-1.5" style={{ color: 'rgb(var(--err))' }}><Icon name="alert-circle" size={13} /> {error}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full py-2 text-[13px] disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>{saving ? 'Agendando...' : 'Agendar'}</button>
          </form>
          {!course?.teacher?.zoomLink && (
            <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: 'rgb(var(--gold))' }}>
              <Icon name="alert-circle" size={12} /> Este profesor no tiene link de Zoom configurado.
            </p>
          )}
        </div></div>
      </div>

      {/* Scheduled sessions */}
      <div className="bezel mt-3 animate-fade-up" style={{ animationDelay: '120ms' }}><div className="bezel-inner">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
          <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Sesiones programadas ({sessions.length})</p>
        </div>
        {!sessions.length ? (
          <p className="text-[13px] p-6 text-center" style={{ color: 'rgb(var(--ink2))' }}>Sin sesiones agendadas</p>
        ) : sessions.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}>
            <div className="text-center w-16 flex-shrink-0">
              <p className="font-mono text-[13px] font-medium" style={{ color: 'rgb(var(--blue))' }}>{new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>{new Date(s.scheduledAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{s.title}</p>
              <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{s.durationMin} min</p>
            </div>
            {s.zoomLink && <ZoomLogo size={18} />}
            <button onClick={() => removeSession(s.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgb(var(--ink3))' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgb(var(--err))')} onMouseLeave={e => (e.currentTarget.style.color = 'rgb(var(--ink3))')}>
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
      </div></div>
    </div>
  )
}
