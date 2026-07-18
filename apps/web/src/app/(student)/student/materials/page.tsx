// FILE: apps/web/src/app/(student)/student/materials/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon, type IconName } from '@/components/Icon'

const TYPE_ICONS: Record<string, IconName> = {
  pdf: 'file-text', video: 'video', audio: 'message', exercise: 'edit', other: 'folder',
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
    api.get<any[]>(`/courses/${selectedCourse}/materials`).then(setMaterials).catch(() => setMaterials([])).finally(() => setLoading(false))
  }, [selectedCourse])

  return (
    <div className="p-6 max-w-[960px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Materiales</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Recursos de aprendizaje de tus cursos</p>
      </div>

      {courses.length > 1 && (
        <div className="flex gap-1.5 mb-5 flex-wrap animate-fade-up" style={{ animationDelay: '40ms' }}>
          {courses.map((c: any) => (
            <button key={c.id} onClick={() => setSelectedCourse(c.id)} className="text-[12px] px-3 py-1.5 rounded-full font-medium transition-all"
              style={{
                background: selectedCourse === c.id ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedCourse === c.id ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                border: selectedCourse === c.id ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>{c.title}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="bezel"><div className="bezel-inner h-20 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !materials.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-14 text-center text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Sin materiales disponibles aún</div></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {materials.map((m: any) => (
            <a key={m.id} href={m.fileUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="bezel group">
              <div className="bezel-inner p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>
                  <Icon name={TYPE_ICONS[m.type] ?? 'folder'} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{m.title}</p>
                  {m.description && <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>{m.description}</p>}
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--ink3))' }}>{String(m.type).toUpperCase()} · {new Date(m.createdAt).toLocaleDateString('es')}</p>
                </div>
                <Icon name="arrow-right" size={14} style={{ color: 'rgb(var(--blue))' }} />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
