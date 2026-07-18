// FILE: apps/web/src/app/(student)/student/courses/[id]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Icon, type IconName } from '@/components/Icon'
import { ZoomLogo } from '@/components/ZoomLogo'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '')
function fileHref(sp?: string) { return !sp ? '#' : sp.startsWith('http') ? sp : `${API_ORIGIN}${sp}` }

type Tab = 'materials' | 'homework' | 'sessions'
const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'materials', label: 'Materiales', icon: 'folder' },
  { key: 'homework', label: 'Tareas', icon: 'clipboard' },
  { key: 'sessions', label: 'Sesiones', icon: 'calendar' },
]

export default function StudentCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('materials')
  const [materials, setMaterials] = useState<any[] | null>(null)
  const [homework, setHomework] = useState<any[] | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [text, setText] = useState('')

  useEffect(() => { api.get(`/courses/${id}`).then(setCourse).catch(() => {}) }, [id])

  const loadMaterials = useCallback(() => { if (materials === null) api.get<any[]>(`/courses/${id}/materials`).then(setMaterials).catch(() => setMaterials([])) }, [id, materials])
  const loadHomework = useCallback(() => {
    if (homework === null) api.get<any[]>('/students/me/homework').then(all => setHomework(all.filter((s: any) => s.homework?.course?.id === id || s.homework?.courseId === id))).catch(() => setHomework([]))
  }, [id, homework])

  useEffect(() => { if (tab === 'materials') loadMaterials(); if (tab === 'homework') loadHomework() }, [tab, loadMaterials, loadHomework])

  async function submitHw(hwId: string) {
    if (!text.trim()) return
    setSubmitting(hwId)
    try {
      await api.post(`/homework/${hwId}/submit`, { textContent: text })
      setHomework(null); setText(''); setTab('homework'); loadHomework()
    } catch {} finally { setSubmitting(null) }
  }

  const sessions = course?.sessions ?? []

  return (
    <div className="p-6 max-w-[880px] mx-auto relative z-10">
      <div className="flex items-center gap-2 mb-4 animate-fade-up">
        <Link href="/student/courses" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>
          <Icon name="arrow-left" size={14} /> Mis cursos
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-5 animate-fade-up" style={{ animationDelay: '30ms' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{course?.level ?? '—'}</div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>{course?.title ?? 'Cargando...'}</h1>
          <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Prof. {course?.teacher?.user?.fullName ?? '—'}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {TABS.map(t => {
          const on = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all"
              style={{ background: on ? 'rgba(79,142,247,0.12)' : 'transparent', color: on ? 'rgb(var(--blue))' : 'rgb(var(--ink2))', border: on ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent' }}>
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '90ms' }}>
        {tab === 'materials' && (
          materials === null ? <Loading /> : !materials.length ? <Empty icon="folder" text="Sin materiales disponibles" /> : (
            <div className="grid grid-cols-2 gap-3">
              {materials.map((m: any) => (
                <a key={m.id} href={fileHref(m.storagePath)} target="_blank" rel="noreferrer" className="bezel"><div className="bezel-inner p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}><Icon name="file-text" size={18} /></div>
                  <div className="flex-1 min-w-0"><p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{m.title}</p><p className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>{String(m.type).toUpperCase()}</p></div>
                </div></a>
              ))}
            </div>
          )
        )}

        {tab === 'homework' && (
          homework === null ? <Loading /> : !homework.length ? <Empty icon="clipboard" text="Sin tareas en este curso" /> : (
            <div className="space-y-3">
              {homework.map((s: any) => {
                const isSubmitted = !!s.submittedAt
                const isPast = new Date(s.homework.dueAt) < new Date() && !isSubmitted
                return (
                  <div key={s.id} className="bezel"><div className="bezel-inner p-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{s.homework.title}</p>
                      <span className="text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0" style={badge(s, isSubmitted, isPast)}>{label(s, isSubmitted, isPast)}</span>
                    </div>
                    <p className="text-[11px] mb-2" style={{ color: isPast ? 'rgb(var(--err))' : 'rgb(var(--ink2))' }}>Vence: {new Date(s.homework.dueAt).toLocaleDateString('es', { day: 'numeric', month: 'long' })}</p>
                    {s.feedback && <div className="rounded-lg p-2.5 mb-2" style={{ background: 'rgb(var(--s2))' }}><p className="text-[12px]" style={{ color: 'rgb(var(--ink))' }}>{s.feedback}</p></div>}
                    {!isSubmitted && !isPast && (
                      <div>
                        <textarea value={text} onChange={e => setText(e.target.value)} rows={2} placeholder="Tu respuesta..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none mb-2" style={{ background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }} />
                        <button onClick={() => submitHw(s.homework.id)} disabled={submitting === s.homework.id || !text.trim()} className="btn-primary text-[12px] px-4 py-1.5 disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>{submitting === s.homework.id ? 'Enviando...' : 'Entregar'}</button>
                      </div>
                    )}
                  </div></div>
                )
              })}
            </div>
          )
        )}

        {tab === 'sessions' && (
          !sessions.length ? <Empty icon="calendar" text="Sin sesiones programadas" /> : (
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <div key={s.id} className="bezel"><div className="bezel-inner p-4 flex items-center gap-3">
                  <div className="text-center w-14 flex-shrink-0"><p className="font-mono text-[13px] font-medium" style={{ color: 'rgb(var(--blue))' }}>{new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>{new Date(s.scheduledAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</p></div>
                  <p className="text-[13px] flex-1" style={{ color: 'rgb(var(--ink))' }}>{s.title ?? 'Sesión'}</p>
                  {s.zoomLink && (
                    <span className="flex items-center gap-1.5">
                      <ZoomLogo size={18} />
                      <a href={s.zoomLink} target="_blank" rel="noreferrer" className="btn-primary text-[12px] px-3 py-1.5" style={{ borderRadius: '0.5rem' }}>Unirse</a>
                    </span>
                  )}
                </div></div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function badge(s: any, sub: boolean, past: boolean): React.CSSProperties {
  if (s.score != null) return { background: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' }
  if (sub) return { background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }
  if (past) return { background: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' }
  return { background: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' }
}
function label(s: any, sub: boolean, past: boolean) { return s.score != null ? `${s.score}/100` : sub ? 'Entregado' : past ? 'Vencido' : 'Pendiente' }

function Empty({ icon, text }: { icon: IconName; text: string }) {
  return <div className="bezel"><div className="bezel-inner py-12 text-center">
    <div className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-3" style={{ background: 'rgba(79,142,247,0.1)' }}><Icon name={icon} size={20} style={{ color: 'rgb(var(--blue))' }} /></div>
    <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>{text}</p>
  </div></div>
}
function Loading() { return <div className="bezel"><div className="bezel-inner h-40 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div> }
