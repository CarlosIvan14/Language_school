// FILE: apps/web/src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, XCircle, ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await auth.login(email, password)
      auth.saveTokens(res)
      const role = res.user.role
      if (role === 'admin') router.push('/admin/dashboard')
      else if (role === 'teacher') router.push('/teacher/dashboard')
      else router.push('/student/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'rgb(5,7,14)' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '15%', left: '20%',
          width: 600, height: 600,
          background: 'radial-gradient(ellipse, rgba(79,142,247,0.07) 0%, transparent 65%)',
          transform: 'translate(-50%,-50%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '80%', right: '10%',
          width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 65%)',
          transform: 'translate(50%,50%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '30%', left: '60%',
          width: 400, height: 300,
          background: 'radial-gradient(ellipse, rgba(245,166,35,0.04) 0%, transparent 65%)',
        }}
      />

      <Link href="/" className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full transition-colors"
        style={{ color: 'rgb(var(--ink2))', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <ArrowLeft size={13} /> Inicio
      </Link>

      <div className="w-full max-w-[390px] relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-bold text-white"
              style={{ background: 'rgb(var(--blue))' }}
            >
              E
            </div>
            <span
              className="text-[16px] font-semibold tracking-tight"
              style={{ color: 'rgb(var(--ink))' }}
            >
              EspañolPro
            </span>
          </div>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgb(var(--ink3))' }}
          >
            Acceso seguro
          </span>
        </div>

        {/* Card */}
        <div className="bezel">
          <div className="bezel-inner p-7">
            {/* Heading */}
            <div className="mb-7">
              <h1
                className="text-[22px] font-semibold leading-tight mb-1.5"
                style={{ color: 'rgb(var(--ink))' }}
              >
                Bienvenido de vuelta
              </h1>
              <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>
                Inicia sesión en tu cuenta para continuar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgb(var(--ink2))' }}
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--ink3))' }}
                  >
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-200"
                    style={{
                      background: 'rgb(var(--s2))',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgb(var(--ink))',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(79,142,247,0.45)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgb(var(--ink2))' }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--ink3))' }}
                  >
                    <Lock size={14} />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-200"
                    style={{
                      background: 'rgb(var(--s2))',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgb(var(--ink))',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(79,142,247,0.45)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: 'rgb(var(--ink3))' }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setRemember(v => !v)}
                    className="w-4 h-4 rounded flex items-center justify-center transition-all duration-150 flex-shrink-0"
                    style={{
                      background: remember ? 'rgb(var(--blue))' : 'rgb(var(--s2))',
                      border: remember ? '1px solid rgb(var(--blue))' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {remember && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Recordarme</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] transition-opacity hover:opacity-70"
                  style={{ color: 'rgb(var(--blue))' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-[12px]"
                  style={{
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    color: 'rgb(var(--err))',
                  }}
                >
                  <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: '0.5rem' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Footer link */}
            <div
              className="mt-6 pt-5 border-t text-center"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                ¿No tienes cuenta?{' '}
                <Link
                  href="/register"
                  className="font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'rgb(var(--blue))' }}
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
