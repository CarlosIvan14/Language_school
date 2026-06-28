'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const LEVEL_LABELS: Record<string, string> = {
  A1: 'Principiante', A2: 'Básico', B1: 'Intermedio',
  B2: 'Interm. alto', C1: 'Avanzado', C2: 'Experto',
}
const LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', 'Otro']
const TIMEZONES = [
  'America/Mexico_City', 'America/Bogota', 'America/Lima',
  'America/Santiago', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'UTC',
]
const STEPS = ['Cuenta', 'Perfil', 'Nivel', 'Confirmar']

interface Form {
  fullName: string; email: string; password: string; confirm: string
  phone: string; nativeLanguage: string; timezone: string; spanishLevel: string
}

const inputStyle: React.CSSProperties = {
  background: 'rgb(var(--s2))',
  border: '1px solid rgba(255,255,255,0.07)',
  color: 'rgb(var(--ink))',
  width: '100%', padding: '0.625rem 0.75rem',
  borderRadius: '0.5rem', fontSize: '13px', outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '10px', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: 'rgb(var(--ink2))', marginBottom: '0.375rem',
      }}>{label}</label>
      {children}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>({
    fullName: '', email: '', password: '', confirm: '',
    phone: '', nativeLanguage: 'English',
    timezone: 'America/Mexico_City', spanishLevel: 'A1',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function validate() {
    if (step === 0) {
      if (!form.fullName.trim()) return 'Nombre requerido'
      if (!form.email.includes('@')) return 'Email inválido'
      if (form.password.length < 8) return 'Contraseña mínimo 8 caracteres'
      if (form.password !== form.confirm) return 'Las contraseñas no coinciden'
    }
    if (step === 1 && !form.phone.trim()) return 'Teléfono requerido'
    return null
  }

  function next() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
  }

  async function submit() {
    setLoading(true); setError(null)
    try {
      const res = await auth.register({
        fullName: form.fullName, email: form.email, password: form.password,
        phone: form.phone, nativeLanguage: form.nativeLanguage,
        timezone: form.timezone, spanishLevel: form.spanishLevel, language: 'es',
      })
      auth.saveTokens(res)
      router.push('/student/dashboard')
    } catch (e: any) {
      setError(e?.message ?? 'Error al registrarse. Intenta de nuevo.')
      setStep(0)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'rgb(var(--bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient orb */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="animate-fade-up">

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.75rem', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgb(var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>E</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--ink))' }}>EspañolPro</span>
        </Link>

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '4px' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%', height: '3px', borderRadius: '9999px',
                background: i <= step ? 'rgb(var(--blue))' : 'rgba(255,255,255,0.06)',
                transition: 'background 400ms',
              }} />
              <span style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: i === step ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
              }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bezel">
          <div className="bezel-inner" style={{ padding: '1.5rem' }}>

            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--ink))', marginBottom: '0.25rem' }}>Crea tu cuenta</h2>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>Empieza gratis, sin tarjeta de crédito</p>
                </div>
                <Field label="Nombre completo">
                  <input value={form.fullName} onChange={set('fullName')} type="text" placeholder="María García" style={inputStyle} />
                </Field>
                <Field label="Correo electrónico">
                  <input value={form.email} onChange={set('email')} type="email" placeholder="tu@correo.com" style={inputStyle} />
                </Field>
                <Field label="Contraseña">
                  <input value={form.password} onChange={set('password')} type="password" placeholder="Mínimo 8 caracteres" style={inputStyle} />
                </Field>
                <Field label="Confirmar contraseña">
                  <input value={form.confirm} onChange={set('confirm')} type="password" placeholder="Repite tu contraseña" style={inputStyle} />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--ink))', marginBottom: '0.25rem' }}>Tu perfil</h2>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>Personaliza tu experiencia</p>
                </div>
                <Field label="Teléfono / WhatsApp">
                  <input value={form.phone} onChange={set('phone')} placeholder="+52 55 1234 5678" style={inputStyle} />
                </Field>
                <Field label="Idioma nativo">
                  <select value={form.nativeLanguage} onChange={set('nativeLanguage')} style={{ ...inputStyle, appearance: 'none' }}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Zona horaria">
                  <select value={form.timezone} onChange={set('timezone')} style={{ ...inputStyle, appearance: 'none' }}>
                    {TIMEZONES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--ink))', marginBottom: '0.25rem' }}>Nivel de español</h2>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>Si no sabes tu nivel, elige A1</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                  {LEVELS.map(l => (
                    <button key={l} type="button"
                      onClick={() => setForm(f => ({ ...f, spanishLevel: l }))}
                      style={{
                        padding: '0.75rem 0.5rem', borderRadius: '0.625rem', textAlign: 'center',
                        border: `1px solid ${form.spanishLevel === l ? 'rgba(79,142,247,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        background: form.spanishLevel === l ? 'rgba(79,142,247,0.1)' : 'rgb(var(--s2))',
                        cursor: 'pointer', transition: 'all 200ms',
                      }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: form.spanishLevel === l ? 'rgb(var(--blue))' : 'rgb(var(--ink))', fontFamily: 'var(--font-mono, monospace)' }}>{l}</div>
                      <div style={{ fontSize: '9px', color: form.spanishLevel === l ? 'rgb(var(--blue))' : 'rgb(var(--ink2))', marginTop: '2px' }}>{LEVEL_LABELS[l]}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'rgb(var(--ink))', marginBottom: '0.25rem' }}>Confirma tus datos</h2>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>Revisa antes de crear tu cuenta</p>
                </div>
                <div style={{ borderRadius: '0.625rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    ['Nombre', form.fullName], ['Email', form.email],
                    ['Teléfono', form.phone], ['Idioma nativo', form.nativeLanguage],
                    ['Zona horaria', form.timezone.replace(/_/g, ' ')], ['Nivel', form.spanishLevel],
                  ].map(([k, v], i) => (
                    <div key={k} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0.875rem',
                      borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: i % 2 === 0 ? 'rgb(var(--s2))' : 'transparent',
                    }}>
                      <span style={{ fontSize: '11px', color: 'rgb(var(--ink2))' }}>{k}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--ink))' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem', marginTop: '0.875rem',
                background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))',
                border: '1px solid rgba(248,113,113,0.15)', fontSize: '12px',
              }}>
                <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              {step > 0 && (
                <button type="button" onClick={() => { setStep(s => s - 1); setError(null) }}
                  className="btn-ghost" style={{ flex: 1, justifyContent: 'center', borderRadius: '0.5rem' }}>
                  Atrás
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={next}
                  className="btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: '0.5rem' }}>
                  Continuar
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={loading}
                  className="btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: '0.5rem', opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgb(var(--ink2))', marginTop: '1.25rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'rgb(var(--blue))', textDecoration: 'none', fontWeight: 500 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
