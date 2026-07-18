// FILE: apps/web/src/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, KeyRound, Loader2, XCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setStep('reset')
    } catch (e: any) { setError(e.message ?? 'Error') } finally { setLoading(false) }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password', { email, code, newPassword })
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (e: any) { setError(e.message ?? 'Código inválido o expirado') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'rgb(5,7,14)' }}>
      <div className="absolute pointer-events-none" style={{ top: '15%', left: '20%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(79,142,247,0.07) 0%, transparent 65%)', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '10%', right: '15%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 65%)' }} />

      <div className="w-full max-w-[390px] relative z-10 animate-fade-up">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-bold text-white" style={{ background: 'rgb(var(--blue))' }}>E</div>
          <span className="text-[13px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>EspañolPro</span>
        </div>

        <div className="bezel">
          <div className="bezel-inner p-6">
            {done ? (
              <div className="text-center py-4">
                <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: 'rgb(var(--ok))' }} />
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(var(--ink))' }}>¡Contraseña actualizada!</p>
                <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Redirigiendo al inicio de sesión...</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ background: 'rgba(79,142,247,0.1)', color: 'rgb(var(--blue))' }}>
                    <KeyRound size={11} /> Recuperar acceso
                  </div>
                  <h1 className="text-[19px] font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
                    {step === 'email' ? 'Restablecer contraseña' : 'Ingresa el código'}
                  </h1>
                  <p className="text-[12px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>
                    {step === 'email'
                      ? 'Te enviaremos un código de 6 dígitos a tu correo.'
                      : `Revisa la consola/correo. Enviamos el código a ${email}.`}
                  </p>
                </div>

                {step === 'email' ? (
                  <form onSubmit={sendCode} className="space-y-3">
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--ink3))' }} />
                      <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="tu@correo.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
                    </div>
                    {error && <Err text={error} />}
                    <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 justify-center disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : 'Enviar código'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={reset} className="space-y-3">
                    <input value={code} onChange={e => setCode(e.target.value)} placeholder="Código de 6 dígitos" maxLength={6} required
                      className="w-full px-3 py-2.5 rounded-lg text-[15px] outline-none font-mono tracking-[0.3em] text-center" style={inputStyle} />
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--ink3))' }} />
                      <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" required minLength={6} placeholder="Nueva contraseña"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={inputStyle} />
                    </div>
                    {error && <Err text={error} />}
                    <button type="submit" disabled={loading || code.length < 6 || newPassword.length < 6}
                      className="btn-primary w-full py-2.5 justify-center disabled:opacity-40" style={{ borderRadius: '0.5rem' }}>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : 'Cambiar contraseña'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <Link href="/login" className="flex items-center justify-center gap-1.5 mt-5 text-[12px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>
          <ArrowLeft size={13} /> Volver a iniciar sesión
        </Link>
      </div>
    </div>
  )
}

function Err({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]"
      style={{ background: 'rgba(248,113,113,0.08)', color: 'rgb(var(--err))', border: '1px solid rgba(248,113,113,0.15)' }}>
      <XCircle size={14} /> {text}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgb(var(--s2))',
  border: '1px solid rgba(255,255,255,0.06)',
  color: 'rgb(var(--ink))',
}
