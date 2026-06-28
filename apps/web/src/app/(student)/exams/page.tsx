'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function ExamsPage() {
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<{ exam: any; attemptId: string; answers: Record<string, string> } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<any[]>('/students/me/exams')
      .then(setAttempts)
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false))
  }, [])

  async function startExam(examId: string) {
    try {
      const attempt = await api.post<any>(`/exams/${examId}/attempt`, {})
      const exam = await api.get<any>(`/courses/${attempt.exam?.courseId}/exams`).catch(() => null)
      setActive({ exam: attempt.exam, attemptId: attempt.id, answers: {} })
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function submitExam() {
    if (!active) return
    setSubmitting(true)
    try {
      const result = await api.post<any>(`/exams/attempts/${active.attemptId}/submit`, { answers: active.answers })
      const fresh = await api.get<any[]>('/students/me/exams')
      setAttempts(fresh)
      setActive(null)
      alert(`Resultado: ${result.score}/100 — ${result.passed ? '¡Aprobado! 🎉' : 'Reprobado, intenta de nuevo'}`)
    } catch {}
    finally { setSubmitting(false) }
  }

  if (active) {
    const questions = active.exam?.questions ?? []
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-medium text-foreground">{active.exam?.title}</h1>
          <span className="text-xs text-muted-foreground">{Object.keys(active.answers).length}/{questions.length} respondidas</span>
        </div>
        <div className="space-y-6 mb-6">
          {questions.map((q: any, i: number) => (
            <div key={q.id} className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-medium text-foreground mb-3">{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt: string) => (
                  <label key={opt} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${active.answers[q.id] === opt ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
                    <input type="radio" name={q.id} value={opt} checked={active.answers[q.id] === opt}
                      onChange={() => setActive(a => a ? ({ ...a, answers: { ...a.answers, [q.id]: opt } }) : a)}
                      className="accent-primary" />
                    <span className="text-sm text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActive(null)} className="border border-border text-foreground px-4 py-2 rounded-md text-sm hover:bg-secondary">Cancelar</button>
          <button onClick={submitExam} disabled={submitting}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Enviando...' : 'Entregar examen'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Exámenes</h1>
        <p className="text-sm text-muted-foreground mt-1">Tus intentos y resultados</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}</div>
      ) : !attempts.length ? (
        <p className="text-sm text-muted-foreground text-center py-16">Sin exámenes disponibles.</p>
      ) : (
        <div className="space-y-3">
          {attempts.map((a: any) => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{a.exam?.title}</p>
                <p className="text-xs text-muted-foreground">{a.exam?.course?.title}</p>
                {a.completedAt && (
                  <p className={`text-xs mt-1 ${a.passed ? 'text-green-600' : 'text-destructive'}`}>
                    {a.score}/100 — {a.passed ? 'Aprobado' : 'Reprobado'}
                  </p>
                )}
              </div>
              {!a.completedAt ? (
                <button onClick={() => setActive({ exam: a.exam, attemptId: a.id, answers: {} })}
                  className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90">
                  Continuar
                </button>
              ) : !a.passed && (
                <button onClick={() => startExam(a.exam.id)}
                  className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-md hover:bg-secondary">
                  Reintentar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
