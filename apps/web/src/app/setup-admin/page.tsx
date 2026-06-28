'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

export default function SetupAdminPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMsg('')

    const token = localStorage.getItem('access_token')
    if (!token) {
      setStatus('error')
      setMsg('No hay sesión activa. Inicia sesión primero y vuelve a esta página.')
      return
    }

    try {
      const res = await fetch(`${API}/auth/make-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ secret }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Error desconocido')

      // Update localStorage user with new role
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...u, role: 'admin' }))
      }

      setStatus('ok')
      setMsg(`¡Listo! Tu cuenta (${data.email}) ahora tiene rol admin. Cierra sesión y vuelve a entrar.`)
    } catch (err: any) {
      setStatus('error')
      setMsg(err.message ?? 'Secreto incorrecto o sesión inválida.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'rgb(5,7,14)' }}>
      <div className="w-full max-w-[380px]">
        <div className="bezel">
          <div className="bezel-inner p-6">

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(79,142,247,0.15)' }}>
                <Shield size={18} style={{ color: 'rgb(var(--blue))' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Setup Admin</p>
                <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>Eleva tu cuenta a administrador</p>
              </div>
            </div>

            {status === 'ok' ? (
              <div className="text-center py-4">
                <CheckCircle size={40} className="mx-auto mb-3" style={{ color: 'rgb(var(--ok))' }} />
                <p className="text-[13px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>¡Rol actualizado!</p>
                <p className="text-[12px] mb-4" style={{ color: 'rgb(var(--ink2))' }}>{msg}</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')
                    document.cookie = 'access_token=; path=/; max-age=0'
                    router.push('/login')
                  }}
                  className="btn-primary w-full"
                >
                  Ir a iniciar sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                    Secreto de configuración
                  </label>
                  <input
                    type="password"
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    placeholder="Ingresa el secreto..."
                    required
                    className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-all"
                    style={{
                      background: 'rgb(var(--s2))',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgb(var(--ink))',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px]"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgb(var(--err))' }}>
                    <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  {status === 'loading' ? 'Procesando...' : 'Hacerme administrador'}
                </button>

                <p className="text-center text-[11px]" style={{ color: 'rgb(var(--ink3))' }}>
                  Debes tener sesión iniciada. El secreto está en{' '}
                  <code className="font-mono" style={{ color: 'rgb(var(--ink2))' }}>apps/api/.env</code>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
