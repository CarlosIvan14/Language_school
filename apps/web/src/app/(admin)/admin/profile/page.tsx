// FILE: apps/web/src/app/(admin)/admin/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  timezone?: string
  language?: string
  avatarUrl?: string
  role: string
}

const TIMEZONES = [
  'America/Mexico_City',
  'America/Monterrey',
  'America/Tijuana',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Caracas',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/London',
  'UTC',
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    timezone: '',
  })

  useEffect(() => {
    api.get<UserProfile>('/auth/me')
      .then(p => {
        setProfile(p)
        setForm({
          fullName: p.fullName ?? '',
          phone: p.phone ?? '',
          timezone: p.timezone ?? '',
        })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.patch('/auth/profile', form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: 'rgb(var(--s2))',
    border: '1px solid rgb(var(--bd))',
    color: 'rgb(var(--ink))',
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--ink))' }}>Mi perfil</h1>
        <p className="text-[12px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
          Actualiza tu información de administrador
        </p>
      </div>

      {/* Avatar card */}
      <div className="bezel mb-5 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <div className="bezel-inner p-5 flex items-center gap-4">
          {loading ? (
            <div className="w-16 h-16 rounded-full animate-pulse flex-shrink-0" style={{ background: 'rgb(var(--s2))' }} />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0"
              style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
              {getInitials(profile?.fullName ?? 'A')}
            </div>
          )}
          <div>
            <p className="text-[15px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>
              {profile?.fullName ?? '—'}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
              {profile?.email}
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: 'rgba(245,166,35,0.12)', color: 'rgb(var(--gold))' }}>
              Administrador
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="bezel animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="bezel-inner p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgb(var(--ink3))' }}>
              Información personal
            </p>

            <div className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                  Nombre completo
                </label>
                {loading ? (
                  <div className="h-9 rounded-lg animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                ) : (
                  <input type="text" value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full text-[13px] px-3 py-2 rounded-lg outline-none"
                    style={inputStyle} />
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                  Correo electrónico
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: 'rgb(var(--s1))', border: '1px solid rgb(var(--bd))', color: 'rgb(var(--ink3))' }}>
                  <Icon name="lock" size={13} />
                  {profile?.email ?? '—'}
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'rgb(var(--ink3))' }}>
                  El email no se puede cambiar desde aquí
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                  Teléfono
                </label>
                {loading ? (
                  <div className="h-9 rounded-lg animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                ) : (
                  <input type="tel" value={form.phone} placeholder="+52 55 1234 5678"
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full text-[13px] px-3 py-2 rounded-lg outline-none"
                    style={inputStyle} />
                )}
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                  Zona horaria
                </label>
                {loading ? (
                  <div className="h-9 rounded-lg animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
                ) : (
                  <select value={form.timezone}
                    onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                    className="w-full text-[13px] px-3 py-2 rounded-lg outline-none"
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Seleccionar zona horaria</option>
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-[13px]" style={{ color: 'rgb(var(--err))' }}>
            <Icon name="alert-circle" size={14} />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 text-[13px]" style={{ color: 'rgb(var(--ok))' }}>
            <Icon name="check-circle" size={14} />
            Perfil actualizado correctamente
          </div>
        )}

        {/* Save */}
        <div className="mt-5 flex justify-end animate-fade-up" style={{ animationDelay: '120ms' }}>
          <button type="submit" disabled={saving || loading} className="btn-primary px-6 py-2.5 text-[13px] disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
