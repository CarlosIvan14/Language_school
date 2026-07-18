// FILE: apps/web/src/app/(admin)/admin/courses/new/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const MODALITIES = [
  { value: 'online', label: 'En línea' },
  { value: 'in_person', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
]

interface Teacher {
  id: string
  fullName: string
  email: string
  specialties: string[]
}

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherQuery, setTeacherQuery] = useState('')
  const [showTeacherList, setShowTeacherList] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', level: 'A1', modality: 'online',
    capacity: 10, priceUsd: '', durationWeeks: 12, teacherId: '', startsAt: '',
  })
  const selectedTeacher = teachers.find(t => t.id === form.teacherId)

  // Load teachers once; filter client-side by name/level
  useEffect(() => {
    api.get<Teacher[]>('/teachers').then(setTeachers).catch(() => setTeachers([]))
  }, [])

  const filteredTeachers = teachers.filter(t => {
    const q = teacherQuery.trim().toLowerCase()
    if (!q) return true
    return (
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.specialties.some(s => s.toLowerCase().includes(q))
    )
  })

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.teacherId) { setError('Selecciona un profesor para el curso'); return }
    if (!form.startsAt) { setError('Indica la fecha de inicio del curso'); return }
    setLoading(true)
    try {
      await api.post('/courses', {
        title: form.title,
        description: form.description || undefined,
        level: form.level,
        modality: form.modality,
        teacher_id: form.teacherId,
        capacity: Number(form.capacity),
        duration_weeks: Number(form.durationWeeks),
        price_cents: Math.round(Number(form.priceUsd || 0) * 100), // dollars → cents
        currency: 'USD',
        starts_at: new Date(form.startsAt).toISOString(),
      })
      router.push('/admin/courses')
    } catch (err: any) {
      setError(err.message ?? 'Error al crear el curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-[640px] mx-auto relative z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 animate-fade-up">
        <Link href="/admin/courses" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70"
          style={{ color: 'rgb(var(--ink2))' }}>
          <Icon name="arrow-left" size={14} /> Cursos
        </Link>
        <span style={{ color: 'rgb(var(--ink3))' }}>/</span>
        <span className="text-[12px]" style={{ color: 'rgb(var(--ink))' }}>Nuevo curso</span>
      </div>

      <div className="mb-6 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Crear nuevo curso</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Completa los datos para publicar el curso</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="bezel">
          <div className="bezel-inner p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--ink2))' }}>Información básica</p>

            <Field label="Título del curso">
              <input value={form.title} onChange={e => set('title', e.target.value)} required
                placeholder="ej. Español conversacional B2"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
            </Field>

            <Field label="Descripción">
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                placeholder="Describe el curso, objetivos y metodología..."
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none" style={inputStyle} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nivel">
                <select value={form.level} onChange={e => set('level', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Modalidad">
                <select value={form.modality} onChange={e => set('modality', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle}>
                  {MODALITIES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
            </div>

            {/* Teacher searchable selector */}
            <Field label="Profesor">
              {selectedTeacher ? (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={inputStyle}>
                  <span className="flex items-center gap-2 text-[13px]" style={{ color: 'rgb(var(--ink))' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                      style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                      {selectedTeacher.fullName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                    </span>
                    {selectedTeacher.fullName}
                    <span className="flex gap-1">
                      {selectedTeacher.specialties.map(s => (
                        <span key={s} className="px-1 rounded text-[9px] font-bold" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{s}</span>
                      ))}
                    </span>
                  </span>
                  <button type="button" onClick={() => { set('teacherId', ''); setShowTeacherList(false) }} style={{ color: 'rgb(var(--ink2))' }}>
                    <Icon name="x" size={15} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--ink3))' }}>
                    <Icon name="search" size={14} />
                  </span>
                  <input
                    value={teacherQuery}
                    onChange={e => { setTeacherQuery(e.target.value); setShowTeacherList(true) }}
                    onFocusCapture={() => setShowTeacherList(true)}
                    onFocus={() => setShowTeacherList(true)}
                    placeholder={teachers.length ? 'Buscar profesor por nombre o nivel...' : 'No hay profesores — crea uno primero'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
                  {showTeacherList && filteredTeachers.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg overflow-hidden max-h-56 overflow-y-auto"
                      style={{ background: 'rgb(var(--s1))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                      {filteredTeachers.map(t => (
                        <button type="button" key={t.id}
                          onClick={() => { set('teacherId', t.id); setShowTeacherList(false); setTeacherQuery('') }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                          style={{ color: 'rgb(var(--ink))' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s2))')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                            style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                            {t.fullName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[12.5px] truncate">{t.fullName}</span>
                            <span className="block text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>{t.email}</span>
                          </span>
                          <span className="flex gap-1">
                            {t.specialties.map(s => (
                              <span key={s} className="px-1 rounded text-[9px] font-bold" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{s}</span>
                            ))}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Capacidad">
                <input type="number" min={1} max={100} value={form.capacity} onChange={e => set('capacity', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
              </Field>
              <Field label="Duración (sem)">
                <input type="number" min={1} max={52} value={form.durationWeeks} onChange={e => set('durationWeeks', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
              </Field>
              <Field label="Precio (USD/hora)">
                <input type="number" min={0} step="0.01" value={form.priceUsd} onChange={e => set('priceUsd', e.target.value)}
                  placeholder="ej. 12" className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
              </Field>
            </div>

            <Field label="Fecha de inicio">
              <input type="date" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
            </Field>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px]"
            style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))', border: '1px solid rgba(248,113,113,0.15)' }}>
            <Icon name="alert-circle" size={14} /> {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
            {loading ? 'Creando...' : 'Crear curso'}
          </button>
          <Link href="/admin/courses" className="btn-ghost px-5 py-2.5" style={{ borderRadius: '0.5rem' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgb(var(--s2))',
  border: '1px solid rgba(255,255,255,0.06)',
  color: 'rgb(var(--ink))',
}
