// FILE: apps/web/src/app/(student)/student/homework/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

export default function HomeworkPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [textContent, setTextContent] = useState('')

  useEffect(() => {
    api.get<any[]>('/students/me/homework').then(setSubmissions).catch(() => setSubmissions([])).finally(() => setLoading(false))
  }, [])

  async function handleSubmit(homeworkId: string) {
    if (!textContent.trim()) return
    setSubmitting(homeworkId)
    try {
      await api.post(`/homework/${homeworkId}/submit`, { textContent })
      setSubmissions(await api.get<any[]>('/students/me/homework'))
      setTextContent('')
    } catch {} finally { setSubmitting(null) }
  }

  function badge(s: any, isSubmitted: boolean, isPastDue: boolean) {
    if (s.score != null) return { label: `${s.score}/100`, bg: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' }
    if (isSubmitted) return { label: 'Entregado', bg: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }
    if (isPastDue) return { label: 'Vencido', bg: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' }
    return { label: 'Pendiente', bg: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' }
  }

  if (loading) return (
    <div className="p-6 space-y-3 max-w-[720px] mx-auto">{[1,2,3].map(i => <div key={i} className="bezel"><div className="bezel-inner h-24 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
  )

  return (
    <div className="p-6 max-w-[720px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Tareas</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Entregas y calificaciones</p>
      </div>

      {!submissions.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-14 text-center text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Sin tareas registradas</div></div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s: any) => {
            const isSubmitted = !!s.submittedAt
            const isPastDue = new Date(s.homework.dueAt) < new Date() && !isSubmitted
            const b = badge(s, isSubmitted, isPastDue)
            return (
              <div key={s.id} className="bezel animate-fade-up"><div className="bezel-inner p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{s.homework.title}</p>
                    <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{s.homework.course?.title}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full flex-shrink-0 font-medium" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                </div>

                <p className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: isPastDue ? 'rgb(var(--err))' : 'rgb(var(--ink2))' }}>
                  <Icon name="clock" size={12} /> Vence: {new Date(s.homework.dueAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>

                {s.feedback && (
                  <div className="rounded-lg p-3 mb-3" style={{ background: 'rgb(var(--s2))' }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'rgb(var(--ink2))' }}>Retroalimentación</p>
                    <p className="text-[13px]" style={{ color: 'rgb(var(--ink))' }}>{s.feedback}</p>
                  </div>
                )}

                {!isSubmitted && !isPastDue && (
                  <div className="mt-3">
                    <textarea value={textContent} onChange={e => setTextContent(e.target.value)} rows={3} placeholder="Escribe tu respuesta aquí..."
                      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none mb-2"
                      style={{ background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }} />
                    <button onClick={() => handleSubmit(s.homework.id)} disabled={submitting === s.homework.id || !textContent.trim()}
                      className="btn-primary text-[12px] px-4 py-2 disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>
                      {submitting === s.homework.id ? 'Enviando...' : 'Entregar tarea'}
                    </button>
                  </div>
                )}
              </div></div>
            )
          })}
        </div>
      )}
    </div>
  )
}
