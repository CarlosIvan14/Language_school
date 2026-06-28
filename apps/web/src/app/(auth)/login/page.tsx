'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await auth.login(email, password)
      auth.saveTokens(res)
      router.push(`/${res.user.role}/dashboard`)
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'rgb(var(--bg))' }}>

      {/* Ambient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 65%)' }} />

      <div className="w-full max-w-[360px] relative z-10 animate-fade-up">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white"
            style={{ background: 'rgb(var(--blue))' }}>E</div>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
            EspañolPro
          </span>
        </div>

        {/* Double-bezel card */}
        <div className="bezel">
          <div className="bezel-inner p-6">

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4 text-2xs font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(var(--blue-dim))', color: 'rgb(var(--blue))' }}>
                <span className="w-1 h-1 rounded-full bg-blue animate-pulse-dot" />
                Plataforma activa
              </div>
              <h1 className="text-xl font-semibold leading-tight mb-1" style={{ color: 'rgb(var(--ink))' }}>
                Bienvenido de vuelta
              </h1>
              <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>
                Accede a tu cuenta para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgb(var(--ink2))' }}>
                  Correo
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com" required
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-300"
                  style={{
                    background: 'rgb(var(--s2))',
                    border: '1px solid rgba(var(--bd))',
                    color: 'rgb(var(--ink))',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(var(--blue), 0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(var(--bd))'}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgb(var(--ink2))' }}>
                  Contraseña
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-300"
                  style={{
                    background: 'rgb(var(--s2))',
                    border: '1px solid rgba(var(--bd))',
                    color: 'rgb(var(--ink))',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(var(--blue), 0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(var(--bd))'}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12px]"
                  style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))' }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-2.5 rounded-lg mt-1 disabled:opacity-40"
                style={{ borderRadius: '0.5rem' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Iniciando...
                  </span>
                ) : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: 'rgba(var(--bd))' }}>
              <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                ¿Sin cuenta?{' '}
                <Link href="/register" className="font-medium transition-colors hover:opacity-80"
                  style={{ color: 'rgb(var(--blue))' }}>
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
