'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function TeacherGradesPage() {
  const [data, setData] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  useEffect(() => {
    api.get<any>('/teachers/me/dashboard').then(d => {
      setData(d)
      if (d.courses?.[0]) setSelectedCourse(d.courses[0].id)
    }).catch(() => {})
  }, [])

  const [submissions, setSubmissions] = useState<any[]>([])
  const [grading, setGrading] = useState<{ id: string; score: string; feedback: string } | null>(null)

  useEffect(() => {
    if (!selectedCourse) return
    api.get<any>(`/courses/${selectedCourse}/homework`).then(hws => {
      const allSubs: any[] = []
      hws.forEach((hw: any) => {
        if (hw._count?.submissions > 0) allSubs.push(hw)
      })
      setSubmissions(allSubs)
    }).catch(() => {})
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Calificaciones</h1>
        <p className="text-sm text-muted-foreground">Revisa y califica las entregas de tus estudiantes</p>
      </div>

      {courses.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {courses.map((c: any) => (
            <button key={c.id} onClick={() => setSelectedCourse(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCourse === c.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {!submissions.length ? (
        <p className="text-sm text-muted-foreground text-center py-12">Sin tareas con entregas pendientes.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map(hw => (
            <div key={hw.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-foreground">{hw.title}</p>
                <span className="text-xs text-muted-foreground">{hw._count?.submissions} entregas</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vence: {new Date(hw.dueAt).toLocaleDateString('es')}
              </p>
            </div>
          ))}
        </div>
      )}

      {grading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="font-heading text-lg font-medium mb-4">Calificar entrega</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Puntuación (0–100)</label>
                <input type="number" min="0" max="100" value={grading.score}
                  onChange={e => setGrading(g => g ? ({ ...g, score: e.target.value }) : g)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Retroalimentación</label>
                <textarea value={grading.feedback} rows={3}
                  onChange={e => setGrading(g => g ? ({ ...g, feedback: e.target.value }) : g)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setGrading(null)} className="flex-1 border border-border text-sm py-2 rounded-md">Cancelar</button>
              <button onClick={saveGrade} className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-md">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
