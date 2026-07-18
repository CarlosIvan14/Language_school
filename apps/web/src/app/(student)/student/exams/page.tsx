// FILE: apps/web/src/app/(student)/student/exams/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

export default function ExamsPage() {
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<{ exam: any; attemptId: string; answers: Record<string, string> } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  useEffect(() => {
    api.get<any[]>('/students/me/exams').then(setAttempts).catch(() => setAttempts([])).finally(() => setLoading(false))
  }, [])

  async function startExam(examId: string) {
    try {
      const attempt = await api.post<any>(`/exams/${examId}/attempt`, {})
      setActive({ exam: attempt.exam, attemptId: attempt.id, answers: {} })
    } catch (e: any) { alert(e.message) }
  }

  async function submitExam() {
    if (!active) return
    setSubmitting(true)
    try {
      const res = await api.post<any>(`/exams/attempts/${active.attemptId}/submit`, { answers: active.answers })
      setAttempts(await api.get<any[]>('/students/me/exams'))
      setActive(null)
      setResult({ score: res.score, passed: res.passed })
    } catch {} finally { setSubmitting(false) }
  }

  const inputStyle: React.CSSProperties = { background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }

  if (active) {
    const questions = active.exam?.questions ?? []
    return (
      <div className="p-6 max-w-[720px] mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <h1 className="text-[18px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>{active.exam?.title}</h1>
          <span className="text-[12px] font-mono" style={{ color: 'rgb(var(--ink2))' }}>{Object.keys(active.answers).length}/{questions.length} respondidas</span>
        </div>
        <div className="space-y-4 mb-6">
          {questions.map((q: any, i: number) => (
            <div key={q.id} className="bezel"><div className="bezel-inner p-5">
              <p className="text-[13px] font-medium mb-3" style={{ color: 'rgb(var(--ink))' }}>{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt: string) => {
                  const on = active.answers[q.id] === opt
                  return (
                    <label key={opt} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all"
                      style={{ background: on ? 'rgba(79,142,247,0.08)' : 'rgb(var(--s2))', border: on ? '1px solid rgba(79,142,247,0.4)' : '1px solid transparent' }}>
                      <input type="radio" name={q.id} value={opt} checked={on}
                        onChange={() => setActive(a => a ? ({ ...a, answers: { ...a.answers, [q.id]: opt } }) : a)} className="accent-blue-500" />
                      <span className="text-[13px]" style={{ color: 'rgb(var(--ink))' }}>{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div></div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActive(null)} className="btn-ghost px-4 py-2 text-[13px]">Cancelar</button>
          <button onClick={submitExam} disabled={submitting} className="btn-primary px-6 py-2 text-[13px] disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>
            {submitting ? 'Enviando...' : 'Entregar examen'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[720px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Exámenes</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Tus intentos y resultados</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="bezel"><div className="bezel-inner h-20 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !attempts.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-14 text-center text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Sin exámenes disponibles</div></div>
      ) : (
        <div className="space-y-2.5">
          {attempts.map((a: any) => (
            <div key={a.id} className="bezel animate-fade-up"><div className="bezel-inner p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{a.exam?.title}</p>
                <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{a.exam?.course?.title}</p>
                {a.completedAt && (
                  <p className="text-[11px] mt-1 font-medium" style={{ color: a.passed ? 'rgb(var(--ok))' : 'rgb(var(--err))' }}>
                    {a.score}/100 — {a.passed ? 'Aprobado' : 'Reprobado'}
                  </p>
                )}
              </div>
              {!a.completedAt ? (
                <button onClick={() => setActive({ exam: a.exam, attemptId: a.id, answers: {} })} className="btn-primary text-[12px] px-3 py-1.5" style={{ borderRadius: '0.5rem' }}>Continuar</button>
              ) : !a.passed && (
                <button onClick={() => startExam(a.exam.id)} className="btn-ghost text-[12px] px-3 py-1.5">Reintentar</button>
              )}
            </div></div>
          ))}
        </div>
      )}

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setResult(null)}>
          <div className="bezel w-[360px] animate-fade-up"><div className="bezel-inner p-6 text-center">
            <Icon name={result.passed ? 'check-circle' : 'alert-circle'} size={40} className="mx-auto mb-3" style={{ color: result.passed ? 'rgb(var(--ok))' : 'rgb(var(--err))' }} />
            <p className="font-mono text-2xl font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>{result.score}/100</p>
            <p className="text-[13px] mb-4" style={{ color: 'rgb(var(--ink2))' }}>{result.passed ? '¡Aprobado! Bien hecho.' : 'Reprobado — puedes reintentar.'}</p>
            <button onClick={() => setResult(null)} className="btn-primary w-full py-2 text-[13px]" style={{ borderRadius: '0.5rem' }}>Entendido</button>
          </div></div>
        </div>
      )}
    </div>
  )
}
