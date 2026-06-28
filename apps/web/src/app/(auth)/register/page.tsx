'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', 'Другой']
const TIMEZONES = [
  'America/Mexico_City', 'America/Bogota', 'America/Lima',
  'America/Santiago', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'UTC',
]
const STEPS = ['Cuenta', 'Perfil', 'Nivel', 'Confirmar']

interface Form {
  fullName: string; email: string; password: string; confirm: string
  phone: string; nativeLanguage: string; timezone: string
  spanishLevel: string; goals: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>({
    fullName: '', email: '', password: '', confirm: '',
    phone: '', nativeLanguage: 'English', timezone: 'America/Mexico_City',
    spanishLevel: 'A1', goals: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function validate() {
    if (step === 0) {
      if (!form.fullName.trim()) return 'Nombre requerido'
      if (!form.email.includes('@')) return 'Email inválido'
      if (form.password.length < 8) return 'Contraseña mínimo 8 caracteres'
      if (form.password !== form.confirm) return 'Las contraseñas no coinciden'
    }
    if (step === 1) {
      if (!form.phone.trim()) return 'Teléfono requerido'
    }
    return null
  }

  function next() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
  }

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const res = await auth.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        nativeLanguage: form.nativeLanguage,
        timezone: form.timezone,
        spanishLevel: form.spanishLevel,
        language: 'es',
      })
      auth.saveTokens(res)
      router.push('/student/dashboard')
    } catch (e: any) {
      setError(e?.message ?? 'Error al registrarse. Intenta de nuevo.')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const levelLabels: Record<string, string> = {
    A1: 'Principiante', A2: 'Básico', B1: 'Intermedio',
    B2: 'Interm. alto', C1: 'Avanzado', C2: 'Experto',
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-medium text-sm">E</div>
            <span className="font-heading font-medium text-foreground">EspañolPro</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs ml-1 mr-2 hidden sm:block ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-medium">Crea tu cuenta</h2>
              {[
                { label: 'Nombre completo', key: 'fullName', type: 'text', placeholder: 'María García' },
                { label: 'Correo electrónico', key: 'email', type: 'email', placeholder: 'tu@correo.com' },
                { label: 'Contraseña', key: 'password', type: 'password', placeholder: 'Mínimo 8 caracteres' },
                { label: 'Confirmar contraseña', key: 'confirm', type: 'password', placeholder: 'Repite tu contraseña' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof Form]} onChange={set(f.key as keyof Form)}
                    placeholder={f.placeholder}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-medium">Tu perfil</h2>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Teléfono / WhatsApp</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+52 55 1234 5678"
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Idioma nativo</label>
                <select value={form.nativeLanguage} onChange={set('nativeLanguage')}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Zona horaria</label>
                <select value={form.timezone} onChange={set('timezone')}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {TIMEZONES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-medium">Nivel de español</h2>
              <p className="text-sm text-muted-foreground">Si no sabes tu nivel, elige A1.</p>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map(l => (
                  <button key={l} type="button" onClick={() => setForm(f => ({ ...f, spanishLevel: l }))}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${form.spanishLevel === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    <div className="text-lg font-heading font-medium">{l}</div>
                    <div className="text-[10px] mt-0.5">{levelLabels[l]}</div>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">¿Por qué quieres aprender? (opcional)</label>
                <textarea value={form.goals} onChange={set('goals')} rows={2} placeholder="Trabajo, viajes, familia..."
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-medium">Confirma tus datos</h2>
              <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
                {[
                  ['Nombre', form.fullName], ['Email', form.email], ['Teléfono', form.phone],
                  ['Idioma nativo', form.nativeLanguage], ['Zona horaria', form.timezone.replace(/_/g, ' ')],
                  ['Nivel', form.spanishLevel],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md mt-4">{error}</p>}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button type="button" onClick={() => { setStep(s => s - 1); setError(null) }}
                className="flex-1 border border-border text-foreground py-2.5 rounded-md text-sm hover:bg-secondary transition-colors">
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={next}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Continuar
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
