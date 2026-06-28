'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Step = 'account' | 'profile' | 'level' | 'docs'

const LEVELS = [
  { code: 'A1', label: 'Principiante', desc: 'Sin conocimiento previo' },
  { code: 'A2', label: 'Básico', desc: 'Frases simples' },
  { code: 'B1', label: 'Intermedio', desc: 'Temas cotidianos' },
  { code: 'B2', label: 'Avanzado', desc: 'Conversación fluida' },
  { code: 'C1', label: 'Dominio', desc: 'Textos complejos' },
  { code: 'C2', label: 'Maestría', desc: 'Nivel nativo' },
] as const

const STEPS: Step[] = ['account', 'profile', 'level', 'docs']
const STEP_LABELS = ['Cuenta', 'Perfil', 'Nivel', 'Documentos']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    country: '',
    native_language: '',
    timezone: 'UTC',
    phone: '',
    language: 'es' as 'es' | 'en' | 'uk',
    spanish_level: 'A1' as typeof LEVELS[number]['code'],
  })

  const stepIndex = STEPS.indexOf(step)

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleNext() {
    setError(null)

    if (step === 'account') {
      if (!form.email || !form.password) return setError('Completa todos los campos.')
      if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden.')
      if (form.password.length < 8) return setError('Mínimo 8 caracteres.')
      setStep('profile')
    } else if (step === 'profile') {
      if (!form.full_name || !form.native_language) return setError('Completa todos los campos.')
      setStep('level')
    } else if (step === 'level') {
      setStep('docs')
    } else {
      await handleSubmit()
    }
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: 'student',
          timezone: form.timezone,
          language: form.language,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/student/dashboard')
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-medium text-sm">E</div>
            <span className="font-heading font-medium text-foreground">EspañolPro</span>
          </Link>
        </div>

        {/* Progress steps */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors ${
                i < stepIndex ? 'bg-primary text-primary-foreground' :
                i === stepIndex ? 'bg-accent text-foreground' :
                'bg-muted text-muted-foreground border border-border'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-6 px-0">
          {STEP_LABELS.map((l, i) => (
            <span key={l} className={i === stepIndex ? 'text-foreground font-medium' : ''}>{l}</span>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

          {/* Step 1: Account */}
          {step === 'account' && (
            <>
              <h1 className="font-heading text-xl font-medium mb-1">Crea tu cuenta</h1>
              <p className="text-sm text-muted-foreground mb-5">Paso 1 de 4 — Acceso a la plataforma</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Correo electrónico</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Contraseña</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Confirmar contraseña</label>
                  <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o regístrate con</span></div>
              </div>
              <button onClick={handleGoogle}
                className="w-full border border-border rounded-md py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
              <p className="text-center text-xs text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
              </p>
            </>
          )}

          {/* Step 2: Profile */}
          {step === 'profile' && (
            <>
              <h1 className="font-heading text-xl font-medium mb-1">Tu perfil de estudiante</h1>
              <p className="text-sm text-muted-foreground mb-5">Paso 2 de 4 — Personaliza tu experiencia</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground block mb-1.5">Nombre completo</label>
                  <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                    placeholder="Olena Kovalenko"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">País de origen</label>
                  <select value={form.country} onChange={e => set('country', e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Seleccionar...</option>
                    <option>Ucrania</option>
                    <option>Rusia</option>
                    <option>Polonia</option>
                    <option>México</option>
                    <option>Estados Unidos</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Idioma nativo</label>
                  <select value={form.native_language} onChange={e => set('native_language', e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Seleccionar...</option>
                    <option>Ucraniano</option>
                    <option>Ruso</option>
                    <option>Inglés</option>
                    <option>Polaco</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Zona horaria</label>
                  <select value={form.timezone} onChange={e => set('timezone', e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="UTC+2">UTC+2 — Kiev (Europa del Este)</option>
                    <option value="UTC+1">UTC+1 — Europa Central</option>
                    <option value="UTC+0">UTC+0 — Londres</option>
                    <option value="UTC-5">UTC-5 — Nueva York</option>
                    <option value="UTC-6">UTC-6 — Ciudad de México</option>
                    <option value="UTC-7">UTC-7 — Denver</option>
                    <option value="UTC-8">UTC-8 — Los Ángeles</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">WhatsApp / Teléfono</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+380 99 123 4567"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground block mb-1.5">Idioma de la plataforma</label>
                  <div className="flex rounded-md overflow-hidden border border-input">
                    {(['es', 'en', 'uk'] as const).map(lang => (
                      <button key={lang} type="button" onClick={() => set('language', lang)}
                        className={`flex-1 py-2 text-sm transition-colors ${form.language === lang ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}>
                        {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Українська'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-950 rounded-md p-3 text-xs text-blue-700 dark:text-blue-300 flex gap-2">
                <span>ℹ</span>
                <span>Tu zona horaria se usará para mostrar horarios de clase en tu hora local y enviarte recordatorios a tiempo.</span>
              </div>
            </>
          )}

          {/* Step 3: Level */}
          {step === 'level' && (
            <>
              <h1 className="font-heading text-xl font-medium mb-1">Nivel de español</h1>
              <p className="text-sm text-muted-foreground mb-5">Paso 3 de 4 — ¿Cuál es tu nivel actual?</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {LEVELS.map(({ code, label, desc }) => (
                  <button key={code} type="button" onClick={() => set('spanish_level', code)}
                    className={`border rounded-lg p-3 text-left transition-all ${
                      form.spanish_level === code
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-border/80 hover:bg-secondary'
                    }`}>
                    <div className={`text-lg font-heading font-medium mb-0.5 ${form.spanish_level === code ? 'text-primary' : 'text-foreground'}`}>{code}</div>
                    <div className="text-xs font-medium text-foreground">{label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
              {form.spanish_level && (
                <div className="bg-secondary rounded-md p-3 text-sm">
                  <span className="font-medium text-foreground">{form.spanish_level} — {LEVELS.find(l => l.code === form.spanish_level)?.label}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.spanish_level === 'A1' && 'Puedes entender y usar expresiones familiares y frases muy básicas.'}
                    {form.spanish_level === 'A2' && 'Puedes comunicarte en tareas simples y cotidianas.'}
                    {form.spanish_level === 'B1' && 'Puedes entender los puntos principales de textos en lengua estándar.'}
                    {form.spanish_level === 'B2' && 'Puedes entender las ideas principales de textos complejos.'}
                    {form.spanish_level === 'C1' && 'Puedes expresarte de forma fluida y espontánea.'}
                    {form.spanish_level === 'C2' && 'Puedes comprender con facilidad prácticamente todo lo que oyes o lees.'}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                ¿No estás seguro?{' '}
                <span className="text-primary cursor-pointer hover:underline">Haz el test de nivel gratuito</span>
              </p>
            </>
          )}

          {/* Step 4: Documents */}
          {step === 'docs' && (
            <>
              <h1 className="font-heading text-xl font-medium mb-1">Documentos de inscripción</h1>
              <p className="text-sm text-muted-foreground mb-5">Paso 4 de 4 — Puedes subirlos ahora o después desde tu perfil</p>
              {[
                { label: 'Pasaporte o identificación oficial', icon: '🪪', sub: 'PDF, JPG o PNG — máx. 5 MB' },
                { label: 'Comprobante de pago', icon: '🧾', sub: 'Recibo de inscripción en PDF o imagen' },
              ].map(({ label, icon, sub }) => (
                <div key={label} className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-colors mb-3">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{sub}</div>
                </div>
              ))}
              <div className="bg-amber-50 dark:bg-amber-950 rounded-md p-3 text-xs text-amber-700 dark:text-amber-300 flex gap-2 mt-2">
                <span>⚠</span>
                <span>Los documentos son opcionales al registro. Puedes completarlos más tarde desde tu perfil en &ldquo;Mi cuenta&rdquo;.</span>
              </div>
            </>
          )}

          {error && (
            <p className="mt-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <button onClick={() => stepIndex > 0 && setStep(STEPS[stepIndex - 1])}
              disabled={stepIndex === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
              ← Atrás
            </button>
            <span className="text-xs text-muted-foreground">Paso {stepIndex + 1} de 4</span>
            <button onClick={handleNext} disabled={loading}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1">
              {loading ? 'Creando cuenta...' : step === 'docs' ? 'Completar registro ✓' : 'Continuar →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
