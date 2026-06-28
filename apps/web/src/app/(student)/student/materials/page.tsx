'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const TYPE_ICONS: Record<string, string> = {
  pdf: '📄', video: '🎥', audio: '🎧', exercise: '✏️', other: '📎',
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<any>('/students/me/dashboard').then(d => {
      const active = d.enrollments ?? []
      setCourses(active.map((e: any) => e.course))
      if (active[0]) setSelectedCourse(active[0].courseId)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedCourse) return
    setLoading(true)
    api.get<any[]>(`/courses/${selectedCourse}/materials`)
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false))
  }, [selectedCourse])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Materiales</h1>
        <p className="text-sm text-muted-foreground mt-1">Recursos de aprendizaje de tus cursos</p>
      </div>

      {courses.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {courses.map((c: any) => (
            <button key={c.id} onClick={() => setSelectedCourse(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCourse === c.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {c.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : !materials.length ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Sin materiales disponibles aún.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {materials.map((m: any) => (
            <a key={m.id} href={m.fileUrl ?? '#'} target="_blank" rel="noopener noreferrer"
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                {TYPE_ICONS[m.type] ?? '📎'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{m.title}</p>
                {m.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.description}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.type.toUpperCase()} · {new Date(m.createdAt).toLocaleDateString('es')}
                </p>
              </div>
              <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">↓</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
