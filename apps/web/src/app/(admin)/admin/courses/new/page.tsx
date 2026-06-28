'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const MODALITIES = [
  { value: 'online', label: 'En línea' },
  { value: 'in_person', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
]

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', level: 'A1', modality: 'online',
    capacity: 10, priceCents: 0, teacherId: '',
  })

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/courses', {
        ...form,
        capacity: Number(form.capacity),
        priceCents: Number(form.priceCents),
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
      {/* Back */}
      <div className="flex items-center gap-2 mb-6 animate-fade-up">
        <Link href="/admin/courses" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70"
          style={{ color: 'rgb(var(--ink2))' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Cursos
        </Link>
        <span style={{ color: 'rgb(var(--ink3))' }}>/</span>
        <span className="text-[12px]" style={{ color: 'rgb(var(--ink))' }}>Nuevo curso</span>
      </div>

      <div className="mb-6 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
          Crear nuevo curso
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>
          Completa los datos para publicar el curso en la plataforma
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 animate-fade-up" style={{ animationDelay: '80ms' }}>

        <div className="bezel">
          <div className="bezel-inner p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'rgb(var(--ink2))' }}>Información básica</p>

            <Field label="Título del curso">
              <input value={form.title} onChange={e => set('title', e.target.value)}
                required placeholder="ej. Español conversacional B2"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                style={inputStyle} />
            </Field>

            <Field label="Descripción">
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="Describe el curso, objetivos y metodología..."
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                style={inputStyle} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nivel">
                <select value={form.level} onChange={e => set('level', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                  style={inputStyle}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Modalidad">
                <select value={form.modality} onChange={e => set('modality', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                  style={inputStyle}>
                  {MODALITIES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacidad (alumnos)">
                <input type="number" min={1} max={100} value={form.capacity}
                  onChange={e => set('capacity', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono"
                  style={inputStyle} />
              </Field>
              <Field label="Precio (centavos USD)">
                <input type="number" min={0} value={form.priceCents}
                  onChange={e => set('priceCents', e.target.value)}
                  placeholder="ej. 9900 = $99"
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono"
                  style={inputStyle} />
              </Field>
            </div>

            <Field label="ID del profesor (opcional)">
              <input value={form.teacherId} onChange={e => set('teacherId', e.target.value)}
                placeholder="UUID del profesor"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono"
                style={inputStyle} />
            </Field>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px]"
            style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))', border: '1px solid rgba(248,113,113,0.15)' }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-40"
            style={{ borderRadius: '0.5rem' }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creando...
              </span>
            ) : 'Crear curso'}
          </button>
          <Link href="/admin/courses" className="btn-ghost px-5 py-2.5" style={{ borderRadius: '0.5rem' }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: 'rgb(var(--ink2))' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgb(var(--s2))',
  border: '1px solid rgba(255,255,255,0.06)',
  color: 'rgb(var(--ink))',
}
