// FILE: apps/web/src/app/(admin)/admin/teachers/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

interface Teacher {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
  specialties: string[]
  bio?: string
  zoomLink?: string
  hourlyRate?: number
  courseCount: number
}

const emptyForm = {
  fullName: '', email: '', password: '',
  specialties: [] as string[], bio: '', zoomLink: '', hourlyRate: '',
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (levelFilter) params.set('level', levelFilter)
    try {
      setTeachers(await api.get<Teacher[]>(`/teachers?${params}`))
    } catch {
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [search, levelFilter])

  useEffect(() => { load() }, [levelFilter])          // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSpecialty(l: string) {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(l) ? f.specialties.filter(x => x !== l) : [...f.specialties, l],
    }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await api.post('/teachers', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        specialties: form.specialties,
        bio: form.bio || undefined,
        zoomLink: form.zoomLink || undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
      })
      setShowModal(false); setForm(emptyForm); load()
    } catch (err: any) {
      setError(err.message ?? 'Error al crear el profesor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-[1140px] mx-auto relative z-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Profesores</h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>
            {loading ? 'Cargando...' : `${teachers.length} profesor${teachers.length === 1 ? '' : 'es'}`}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2" style={{ borderRadius: '0.5rem' }}>
          <Icon name="plus" size={14} /> Nuevo profesor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <form onSubmit={e => { e.preventDefault(); load() }} className="relative flex-1 min-w-[240px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--ink3))' }}>
            <Icon name="search" size={14} />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: 'rgb(var(--s1))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }} />
        </form>
        <div className="flex gap-1.5">
          <button onClick={() => setLevelFilter('')}
            className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
            style={{
              background: !levelFilter ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
              color: !levelFilter ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
              border: !levelFilter ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>Todos</button>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={{
                background: levelFilter === l ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
                color: levelFilter === l ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                border: levelFilter === l ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bezel"><div className="bezel-inner p-4 h-[128px] animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: 'rgba(79,142,247,0.1)' }}>
            <Icon name="users" size={22} style={{ color: 'rgb(var(--blue))' }} />
          </div>
          <p className="text-[14px] font-medium" style={{ color: 'rgb(var(--ink))' }}>Sin profesores todavía</p>
          <p className="text-[12px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Crea tu primer profesor para poder asignarlo a cursos.</p>
        </div></div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {teachers.map((t, i) => (
            <div key={t.id} className="bezel animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="bezel-inner p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                    style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                    {t.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{t.fullName}</p>
                    <p className="text-[11px] truncate" style={{ color: 'rgb(var(--ink2))' }}>{t.email}</p>
                  </div>
                </div>

                {t.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.specialties.map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{s}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>
                  <span className="flex items-center gap-1"><Icon name="book" size={12} /> {t.courseCount} cursos</span>
                  {t.zoomLink ? (
                    <a href={t.zoomLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 transition-opacity hover:opacity-70"
                      style={{ color: 'rgb(var(--ok))' }}>
                      <Icon name="video" size={12} /> Zoom
                    </a>
                  ) : (
                    <span className="flex items-center gap-1" style={{ color: 'rgb(var(--ink3))' }}>
                      <Icon name="video" size={12} /> Sin Zoom
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-[440px] bezel animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="bezel-inner p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[15px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Nuevo profesor</p>
                <button onClick={() => setShowModal(false)} style={{ color: 'rgb(var(--ink2))' }}>
                  <Icon name="x" size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nombre completo" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Correo electrónico" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
                <input required type="password" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Contraseña (mín. 6)" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Especialidades (niveles)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map(l => {
                      const on = form.specialties.includes(l)
                      return (
                        <button type="button" key={l} onClick={() => toggleSpecialty(l)}
                          className="px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all"
                          style={{
                            background: on ? 'rgba(79,142,247,0.15)' : 'rgb(var(--s2))',
                            color: on ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                            border: on ? '1px solid rgba(79,142,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          }}>{l}</button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                    Link de Zoom (sala personal)
                  </label>
                  <input value={form.zoomLink} onChange={e => setForm(f => ({ ...f, zoomLink: e.target.value }))}
                    placeholder="https://zoom.us/j/..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                    type="number" min={0} placeholder="Tarifa/hora (USD)" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
                </div>

                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={2} placeholder="Bio / experiencia (opcional)" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={inputStyle} />

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
                    style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))', border: '1px solid rgba(248,113,113,0.15)' }}>
                    <Icon name="alert-circle" size={14} /> {error}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2 disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
                    {saving ? 'Creando...' : 'Crear profesor'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost px-4 py-2" style={{ borderRadius: '0.5rem' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
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
