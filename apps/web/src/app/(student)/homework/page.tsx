'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function HomeworkPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [textContent, setTextContent] = useState('')

  useEffect(() => {
    api.get<any[]>('/students/me/homework')
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(homeworkId: string) {
    if (!textContent.trim()) return
    setSubmitting(homeworkId)
    try {
      await api.post(`/homework/${homeworkId}/submit`, { textContent })
      const fresh = await api.get<any[]>('/students/me/homework')
      setSubmissions(fresh)
      setTextContent('')
    } catch {}
    finally { setSubmitting(null) }
  }

  if (loading) return (
    <div className="p-6 space-y-3 max-w-3xl mx-auto">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Tareas</h1>
        <p className="text-sm text-muted-foreground mt-1">Entregas y calificaciones</p>
      </div>

      {!submissions.length ? (
        <p className="text-muted-foreground text-sm text-center py-16">Sin tareas registradas.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s: any) => {
            const isSubmitted = !!s.submittedAt
            const isPastDue = new Date(s.homework.dueAt) < new Date() && !isSubmitted
            return (
              <div key={s.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">{s.homework.title}</p>
                    <p className="text-xs text-muted-foreground">{s.homework.course?.title}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full flex-shrink-0 ${
                    s.score != null ? 'bg-green-100 text-green-700' :
                    isSubmitted ? 'bg-blue-100 text-blue-700' :
                    isPastDue ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {s.score != null ? `${s.score}/100` : isSubmitted ? 'Entregado' : isPastDue ? 'Vencido' : 'Pendiente'}
                  </span>
                </div>

                <p className={`text-xs ${isPastDue ? 'text-destructive' : 'text-muted-foreground'} mb-3`}>
                  Vence: {new Date(s.homework.dueAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>

                {s.feedback && (
                  <div className="bg-secondary rounded-md p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Retroalimentación del profesor</p>
                    <p className="text-sm text-foreground">{s.feedback}</p>
                  </div>
                )}

                {!isSubmitted && !isPastDue && (
                  <div className="mt-3">
                    <textarea value={textContent} onChange={e => setTextContent(e.target.value)} rows={3}
                      placeholder="Escribe tu respuesta aquí..."
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-2" />
                    <button onClick={() => handleSubmit(s.homework.id)} disabled={submitting === s.homework.id || !textContent.trim()}
                      className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
                      {submitting === s.homework.id ? 'Enviando...' : 'Entregar tarea'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
