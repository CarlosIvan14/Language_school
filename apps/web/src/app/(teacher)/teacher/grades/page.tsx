// FILE: apps/web/src/app/(teacher)/teacher/grades/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

export default function TeacherGradesPage() {
  const [data, setData] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [grading, setGrading] = useState<{ id: string; score: string; feedback: string } | null>(null)

  useEffect(() => {
    api.get<any>('/teachers/me/dashboard').then(d => {
      setData(d)
      if (d.courses?.[0]) setSelectedCourse(d.courses[0].id)
    }).catch(() => setData({}))
  }, [])

  useEffect(() => {
    if (!selectedCourse) return
    api.get<any>(`/courses/${selectedCourse}/homework`).then(hws => {
      setSubmissions((hws ?? []).filter((hw: any) => hw._count?.submissions > 0))
    }).catch(() => setSubmissions([]))
  }, [selectedCourse])

  async function saveGrade() {
    if (!grading) return
    await api.patch(`/homework/submissions/${grading.id}/grade`, {
      score: parseInt(grading.score),
      feedback: grading.feedback,
    }).catch(() => {})
    setGrading(null)
  }

  const courses = data?.courses ?? []

  return (
    <div className="p-6 max-w-[900px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Calificaciones</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Revisa y califica las entregas de tus estudiantes</p>
      </div>

      {courses.length > 0 && (
        <div className="flex gap-1.5 mb-5 flex-wrap animate-fade-up" style={{ animationDelay: '40ms' }}>
          {courses.map((c: any) => (
            <button key={c.id} onClick={() => setSelectedCourse(c.id)}
              className="text-[12px] px-3 py-1.5 rounded-full font-medium transition-all"
              style={{
                background: selectedCourse === c.id ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedCourse === c.id ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                border: selectedCourse === c.id ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {!data ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bezel"><div className="bezel-inner h-16 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !submissions.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-14 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: 'rgba(79,142,247,0.1)' }}>
            <Icon name="clipboard" size={20} style={{ color: 'rgb(var(--blue))' }} />
          </div>
          <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Sin tareas con entregas pendientes</p>
        </div></div>
      ) : (
        <div className="space-y-2.5">
          {submissions.map(hw => (
            <div key={hw.id} className="bezel animate-fade-up">
              <div className="bezel-inner p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{hw.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
                    Vence: {new Date(hw.dueAt).toLocaleDateString('es')}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-[11px] font-medium"
                  style={{ background: 'rgba(245,166,35,0.12)', color: 'rgb(var(--gold))' }}>
                  {hw._count?.submissions} entregas
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {grading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setGrading(null) }}>
          <div className="bezel w-[420px] animate-fade-up"><div className="bezel-inner p-6">
            <h2 className="text-[15px] font-semibold mb-4" style={{ color: 'rgb(var(--ink))' }}>Calificar entrega</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Puntuación (0–100)</label>
                <input type="number" min="0" max="100" value={grading.score}
                  onChange={e => setGrading(g => g ? ({ ...g, score: e.target.value }) : g)}
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Retroalimentación</label>
                <textarea value={grading.feedback} rows={3}
                  onChange={e => setGrading(g => g ? ({ ...g, feedback: e.target.value }) : g)}
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setGrading(null)} className="btn-ghost flex-1 py-2 text-[13px]">Cancelar</button>
              <button onClick={saveGrade} className="btn-primary flex-1 py-2 text-[13px]">Guardar</button>
            </div>
          </div></div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgb(var(--s2))',
  border: '1px solid rgba(255,255,255,0.06)',
  color: 'rgb(var(--ink))',
}
