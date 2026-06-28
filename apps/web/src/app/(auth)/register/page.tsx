// FILE: apps/web/src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Phone, Globe, Loader2, XCircle, CheckCircle, ChevronLeft } from 'lucide-react'
import { auth } from '@/lib/api'

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST/CDT)' },
  { value: 'America/New_York', label: 'Nueva York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Santiago', label: 'Santiago (CLT)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'UTC', label: 'UTC' },
]

const LEVELS = [
  { code: 'A1', name: 'Principiante', desc: 'Sin experiencia previa con el español' },
  { code: 'A2', name: 'Básico', desc: 'Comprendo frases y expresiones simples' },
  { code: 'B1', name: 'Intermedio', desc: 'Me comunico en situaciones cotidianas' },
  { code: 'B2', name: 'Intermedio-Alto', desc: 'Converso con fluidez sobre temas variados' },
  { code: 'C1', name: 'Avanzado', desc: 'Expreso ideas con espontaneidad y precisión' },
  { code: 'C2', name: 'Maestría', desc: 'Dominio completo del idioma' },
]

function passwordStrength(pwd: string): number {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return Math.min(4, score)
}

const STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte']
const STRENGTH_COLORS = ['', 'rgb(var(--err))', 'rgb(var(--gold))', 'rgb(var(--blue))', 'rgb(var(--ok))']
const STEP_LABELS = ['Tu cuenta', 'Tu perfil', 'Tu nivel', 'Confirmación']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [timezone, setTimezone] = useState('America/Mexico_City')
  const [level, setLevel] = useState('')
  const [terms, setTerms] = useState(false)

  const strength = passwordStrength(password)
  const progress = ((step + 1) / 4) * 100

  function canContinue() {
    if (step === 0) return email.length > 3 && password.length >= 6 && confirm === password
    if (step === 1) return fullName.trim().length >= 2
    if (step === 2) return level !== ''
    if (step === 3) return terms
    return false
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await auth.register({
        email,
        password,
        fullName,
        phone: phone || undefined,
        timezone,
        spanishLevel: level,
      })
      auth.saveTokens(res)
      router.push('/student/dashboard')
    } catch (e: any) {
      setError(e.message ?? 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const baseInput: React.CSSProperties = {
    background: 'rgb(var(--s2))',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'rgb(var(--ink))',
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'rgba(79,142,247,0.45)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.08)'
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'rgb(5,7,14)' }}
    >
      {/* Orbs */}
      <div className="absolute pointer-events-none" style={{ top: '10%', left: '15%', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(79,142,247,0.07) 0%, transparent 65%)', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '5%', right: '5%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 65%)' }} />

      <div className="w-full max-w-[490px] relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-bold text-white" style={{ background: 'rgb(var(--blue))' }}>E</div>
            <span className="text-[16px] font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>EspañolPro</span>
          </div>
        </div>

        {/* Card */}
        <div className="bezel">
          <div className="bezel-inner">
            {/* Progress bar */}
            <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: 'rgb(var(--blue))' }} />
            </div>

            <div className="p-7">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--blue))' }}>
                  Paso {step + 1} de 4
                </span>
              </div>
              <h2 className="text-[20px] font-semibold mb-1" style={{ color: 'rgb(var(--ink))' }}>{STEP_LABELS[step]}</h2>
              <p className="text-[13px] mb-6" style={{ color: 'rgb(var(--ink2))' }}>
                {step === 0 && 'Crea tus credenciales de acceso.'}
                {step === 1 && 'Cuéntanos un poco sobre ti.'}
                {step === 2 && 'Selecciona tu nivel actual de español.'}
                {step === 3 && 'Revisa tus datos y crea tu cuenta.'}
              </p>

              {/* STEP 0 — Account */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Correo electrónico</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}><Mail size={14} /></span>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none transition-all" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Contraseña</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}><Lock size={14} /></span>
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[13px] outline-none transition-all" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity" style={{ color: 'rgb(var(--ink3))' }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: strength >= i ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.06)' }} />
                          ))}
                        </div>
                        <p className="text-[11px]" style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Confirmar contraseña</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}><Lock size={14} /></span>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[13px] outline-none transition-all"
                        style={{ ...baseInput, ...(confirm && confirm !== password ? { borderColor: 'rgba(248,113,113,0.4)' } : {}) }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity" style={{ color: 'rgb(var(--ink3))' }}>
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-[11px] mt-1" style={{ color: 'rgb(var(--err))' }}>Las contraseñas no coinciden</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 1 — Profile */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Nombre completo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}><User size={14} /></span>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre y apellido" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none transition-all" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                      Teléfono <span style={{ color: 'rgb(var(--ink3))', textTransform: 'none', letterSpacing: 'normal' }}>(opcional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}><Phone size={14} /></span>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 55 0000 0000" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none transition-all" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Zona horaria</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--ink3))' }}><Globe size={14} /></span>
                      <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none transition-all appearance-none" style={baseInput} onFocus={onFocus} onBlur={onBlur}>
                        {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Level */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-2.5">
                  {LEVELS.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLevel(l.code)}
                      className="text-left p-3.5 rounded-xl transition-all duration-150"
                      style={{
                        background: level === l.code ? 'rgba(79,142,247,0.12)' : 'rgb(var(--s2))',
                        border: level === l.code ? '1px solid rgba(79,142,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="font-mono text-[18px] font-bold mb-0.5" style={{ color: level === l.code ? 'rgb(var(--blue))' : 'rgb(var(--ink))' }}>{l.code}</div>
                      <div className="text-[12px] font-medium mb-0.5" style={{ color: level === l.code ? 'rgb(var(--blue))' : 'rgb(var(--ink))' }}>{l.name}</div>
                      <div className="text-[11px] leading-snug" style={{ color: 'rgb(var(--ink2))' }}>{l.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 3 — Confirm */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bezel">
                    <div className="bezel-inner p-4 space-y-3">
                      {[
                        { label: 'Correo', value: email },
                        { label: 'Nombre', value: fullName },
                        { label: 'Teléfono', value: phone || '—' },
                        { label: 'Zona horaria', value: TIMEZONES.find(t => t.value === timezone)?.label ?? timezone },
                        {
                          label: 'Nivel',
                          value: (() => {
                            const found = LEVELS.find(l => l.code === level)
                            return found ? `${found.code} — ${found.name}` : level
                          })()
                        },
                      ].map(row => (
                        <div key={row.label} className="flex items-start justify-between gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: 'rgb(var(--ink3))' }}>{row.label}</span>
                          <span className="text-[13px] text-right" style={{ color: 'rgb(var(--ink))' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <div
                      onClick={() => setTerms(v => !v)}
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150"
                      style={{
                        background: terms ? 'rgb(var(--blue))' : 'rgb(var(--s2))',
                        border: terms ? '1px solid rgb(var(--blue))' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {terms && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                      Acepto los{' '}
                      <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: 'rgb(var(--blue))' }}>términos de servicio</Link>
                      {' '}y la{' '}
                      <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: 'rgb(var(--blue))' }}>política de privacidad</Link>
                    </span>
                  </label>

                  {error && (
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-[12px]" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgb(var(--err))' }}>
                      <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-7">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-1.5">
                    <ChevronLeft size={14} />
                    Atrás
                  </button>
                )}
                <div className="flex-1" />
                {step < 3 ? (
                  <button type="button" disabled={!canContinue()} onClick={() => setStep(s => s + 1)} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                    Continuar
                  </button>
                ) : (
                  <button type="button" disabled={!canContinue() || loading} onClick={handleSubmit} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Creando cuenta...</span>
                    ) : (
                      <span className="flex items-center gap-2"><CheckCircle size={14} />Crear mi cuenta</span>
                    )}
                  </button>
                )}
              </div>

              {step === 0 && (
                <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="font-medium hover:opacity-70 transition-opacity" style={{ color: 'rgb(var(--blue))' }}>Inicia sesión</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
