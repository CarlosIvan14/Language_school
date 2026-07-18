'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '')

const TIMEZONES = [
  'America/Mexico_City', 'America/New_York', 'America/Los_Angeles',
  'America/Bogota', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'Europe/London', 'UTC',
]

interface Me {
  id: string
  email: string
  role: string
  fullName: string
  avatarUrl?: string
  bio?: string
  phone?: string
  timezone?: string
}

export function ProfilePanel({ accent = 'blue', children }: { accent?: 'blue' | 'gold'; children?: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const [form, setForm] = useState({ fullName: '', phone: '', timezone: 'UTC', bio: '' })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // modals
  const [pwdOpen, setPwdOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  const accentColor = accent === 'gold' ? 'rgb(var(--gold))' : 'rgb(var(--blue))'
  const accentBg = accent === 'gold' ? 'rgba(245,166,35,0.15)' : 'rgba(79,142,247,0.15)'

  async function loadMe() {
    const data = await api.get<Me>('/auth/me')
    setMe(data)
    setForm({ fullName: data.fullName ?? '', phone: data.phone ?? '', timezone: data.timezone ?? 'UTC', bio: data.bio ?? '' })
  }

  useEffect(() => { loadMe().catch(() => setError('No se pudo cargar el perfil')) }, [])

  const initials = (me?.fullName ?? '').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  const avatarSrc = me?.avatarUrl ? (me.avatarUrl.startsWith('http') ? me.avatarUrl : `${API_ORIGIN}${me.avatarUrl}`) : null

  async function save() {
    setSaving(true); setError(''); setSavedMsg('')
    try {
      await api.patch('/auth/profile', form)
      // keep localStorage user name in sync
      const stored = localStorage.getItem('user')
      if (stored) { const u = JSON.parse(stored); localStorage.setItem('user', JSON.stringify({ ...u, fullName: form.fullName })) }
      setSavedMsg('Cambios guardados')
      loadMe()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_URL}/auth/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al subir la imagen')
      const data = await res.json()
      setMe(m => m ? { ...m, avatarUrl: data.avatarUrl } : m)
    } catch (e: any) {
      setError(e.message ?? 'Error al subir la imagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="p-6 max-w-[720px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Mi perfil</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Administra tu información, foto y seguridad</p>
      </div>

      {/* Identity card */}
      <div className="bezel animate-fade-up" style={{ animationDelay: '40ms' }}>
        <div className="bezel-inner p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-semibold overflow-hidden"
                style={{ background: accentBg, color: accentColor }}>
                {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : initials}
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                style={{ background: 'rgb(var(--blue))', color: '#fff', border: '2px solid rgb(var(--s1))' }}
                title="Cambiar foto">
                {uploading ? <Icon name="clock" size={13} /> : <Icon name="edit" size={13} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>{me?.fullName ?? '—'}</p>
              <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>{me?.email}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest"
                style={{ background: accentBg, color: accentColor }}>
                {me?.role === 'admin' ? 'Administrador' : me?.role === 'teacher' ? 'Profesor' : 'Estudiante'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="bezel mt-3 animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="bezel-inner p-5 space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--ink2))' }}>Información</p>

          <Field label="Nombre completo">
            <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+52 55 ..." className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
            </Field>
            <Field label="Zona horaria">
              <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Descripción (opcional)">
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
              placeholder="Cuéntanos un poco sobre ti..." maxLength={280}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none" style={inputStyle} />
          </Field>

          {/* role-specific extra fields */}
          {children}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
              style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))', border: '1px solid rgba(248,113,113,0.15)' }}>
              <Icon name="alert-circle" size={14} /> {error}
            </div>
          )}
          {savedMsg && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
              style={{ background: 'rgba(52,211,153,0.08)', color: 'rgb(var(--ok))', border: '1px solid rgba(52,211,153,0.15)' }}>
              <Icon name="check-circle" size={14} /> {savedMsg}
            </div>
          )}

          <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bezel mt-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Seguridad</p>
          <div className="space-y-2">
            <SecurityRow icon="lock" title="Contraseña" desc="Recibe un código en tu correo para cambiarla"
              action="Cambiar" onClick={() => setPwdOpen(true)} />
            <SecurityRow icon="mail" title="Correo electrónico" desc={me?.email ?? ''}
              action="Cambiar" onClick={() => setEmailOpen(true)} />
          </div>
        </div>
      </div>

      {pwdOpen && me && <PasswordModal email={me.email} onClose={() => setPwdOpen(false)} />}
      {emailOpen && <EmailModal onClose={() => setEmailOpen(false)} onDone={loadMe} />}
    </div>
  )
}

function SecurityRow({ icon, title, desc, action, onClick }: { icon: any; title: string; desc: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'rgb(var(--s2))' }}>
      <div className="flex items-center gap-3 min-w-0">
        <Icon name={icon} size={16} style={{ color: 'rgb(var(--ink2))' }} />
        <div className="min-w-0">
          <p className="text-[13px]" style={{ color: 'rgb(var(--ink))' }}>{title}</p>
          <p className="text-[11px] truncate" style={{ color: 'rgb(var(--ink2))' }}>{desc}</p>
        </div>
      </div>
      <button onClick={onClick} className="btn-ghost text-[12px] px-3 py-1.5 flex-shrink-0" style={{ borderRadius: '0.5rem' }}>{action}</button>
    </div>
  )
}

// ── Password change: request code to own email, then code + new password ──
function PasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [step, setStep] = useState<'send' | 'verify'>('send')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function sendCode() {
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setStep('verify')
    } catch (e: any) { setError(e.message ?? 'Error') } finally { setLoading(false) }
  }
  async function reset() {
    setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password', { email, code, newPassword })
      setDone(true)
    } catch (e: any) { setError(e.message ?? 'Código inválido') } finally { setLoading(false) }
  }

  return (
    <ModalShell title="Cambiar contraseña" onClose={onClose}>
      {done ? (
        <Done text="Tu contraseña fue actualizada." onClose={onClose} />
      ) : step === 'send' ? (
        <>
          <p className="text-[12px] mb-4" style={{ color: 'rgb(var(--ink2))' }}>
            Te enviaremos un código de 6 dígitos a <strong style={{ color: 'rgb(var(--ink))' }}>{email}</strong> para verificar el cambio.
          </p>
          {error && <ErrLine text={error} />}
          <button onClick={sendCode} disabled={loading} className="btn-primary w-full py-2 text-[13px]" style={{ borderRadius: '0.5rem' }}>
            {loading ? 'Enviando...' : 'Enviar código'}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Código de 6 dígitos" maxLength={6}
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono tracking-widest text-center" style={inputStyle} />
          <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="Nueva contraseña (mín. 6)"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
          {error && <ErrLine text={error} />}
          <button onClick={reset} disabled={loading || code.length < 6 || newPassword.length < 6}
            className="btn-primary w-full py-2 text-[13px] disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      )}
    </ModalShell>
  )
}

// ── Email change: enter new email, then code sent to new email ──
function EmailModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<'req' | 'verify'>('req')
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function request() {
    setLoading(true); setError('')
    try {
      await api.post('/auth/request-email-change', { newEmail })
      setStep('verify')
    } catch (e: any) { setError(e.message ?? 'Error') } finally { setLoading(false) }
  }
  async function confirm() {
    setLoading(true); setError('')
    try {
      await api.post('/auth/confirm-email-change', { code })
      setDone(true); onDone()
    } catch (e: any) { setError(e.message ?? 'Código inválido') } finally { setLoading(false) }
  }

  return (
    <ModalShell title="Cambiar correo" onClose={onClose}>
      {done ? (
        <Done text="Tu correo fue actualizado." onClose={onClose} />
      ) : step === 'req' ? (
        <div className="space-y-3">
          <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
            Enviaremos un código al nuevo correo para confirmarlo.
          </p>
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="nuevo@correo.com"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
          {error && <ErrLine text={error} />}
          <button onClick={request} disabled={loading || !newEmail.includes('@')}
            className="btn-primary w-full py-2 text-[13px] disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
            {loading ? 'Enviando...' : 'Enviar código'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Ingresa el código enviado a {newEmail}.</p>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Código de 6 dígitos" maxLength={6}
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono tracking-widest text-center" style={inputStyle} />
          {error && <ErrLine text={error} />}
          <button onClick={confirm} disabled={loading || code.length < 6}
            className="btn-primary w-full py-2 text-[13px] disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
            {loading ? 'Confirmando...' : 'Confirmar nuevo correo'}
          </button>
        </div>
      )}
    </ModalShell>
  )
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bezel w-[400px] animate-fade-up">
        <div className="bezel-inner p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>{title}</h2>
            <button onClick={onClose} style={{ color: 'rgb(var(--ink2))' }}><Icon name="x" size={16} /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Done({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="text-center py-2">
      <Icon name="check-circle" size={36} className="mx-auto mb-2" style={{ color: 'rgb(var(--ok))' }} />
      <p className="text-[13px] mb-4" style={{ color: 'rgb(var(--ink))' }}>{text}</p>
      <button onClick={onClose} className="btn-primary w-full py-2 text-[13px]" style={{ borderRadius: '0.5rem' }}>Entendido</button>
    </div>
  )
}

function ErrLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
      style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))', border: '1px solid rgba(248,113,113,0.15)' }}>
      <Icon name="alert-circle" size={14} /> {text}
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
