'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/api'

export function LandingNav() {
  const [role, setRole] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Read session only on the client, and only if a valid token exists
    if (auth.isLoggedIn()) setRole(auth.getUser()?.role ?? 'student')
    else setRole(null)
    setReady(true)
  }, [])

  const dashboardHref =
    role === 'admin' ? '/admin/dashboard' : role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.875rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem 0.5rem 1rem', background: 'rgba(9,13,24,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9999px', boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgb(var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', boxShadow: '0 0 12px rgba(79,142,247,0.4)' }}>E</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--ink))', letterSpacing: '-0.01em' }}>EspañolPro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link href="/courses" className="nav-link">Cursos</Link>
          {/* Until the client confirms auth state, render nothing to avoid a flash/mismatch */}
          {ready && (
            role ? (
              <Link href={dashboardHref} className="btn-liquid" style={{ padding: '0.4rem 1rem', fontSize: '13px', animation: 'none', boxShadow: '0 0 12px rgba(79,142,247,0.25)', borderRadius: '9999px' }}>
                Mi panel
              </Link>
            ) : (
              <>
                <Link href="/login" className="nav-link">Iniciar sesión</Link>
                <Link href="/register" className="btn-liquid" style={{ padding: '0.4rem 1rem', fontSize: '13px', animation: 'none', boxShadow: '0 0 12px rgba(79,142,247,0.25)', borderRadius: '9999px' }}>
                  Registrarse
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
