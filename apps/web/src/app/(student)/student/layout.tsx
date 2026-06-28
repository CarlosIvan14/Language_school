'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { auth } from '@/lib/api'

const nav = [
  { href: '/student/dashboard',    label: 'Dashboard',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/student/courses',      label: 'Mis cursos',   icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { href: '/student/calendar',     label: 'Calendario',   icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/student/homework',     label: 'Tareas',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/student/exams',        label: 'Exámenes',     icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/student/materials',    label: 'Materiales',   icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
  { href: '/student/certificates', label: 'Certificados', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { href: '/student/chat',         label: 'Chat',         icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { href: '/student/payments',     label: 'Pagos',        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-[15px] h-[15px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      {d.split(' M').map((p, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? p : 'M' + p} />
      ))}
    </svg>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = auth.getUser()
  const initials = (user?.fullName ?? 'E').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  async function handleLogout() {
    try { await auth.logout() } catch {}
    auth.clearTokens()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'rgb(var(--bg))' }}>

      <aside className="w-[196px] flex-shrink-0 flex flex-col"
        style={{
          background: 'rgb(var(--s0))',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>

        <div className="flex items-center gap-2.5 px-4 h-[52px] flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'rgb(var(--blue))' }}>E</div>
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
            EspañolPro
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-px overflow-y-auto">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] px-2 py-1.5 mb-1"
            style={{ color: 'rgb(var(--ink3))' }}>
            Estudiante
          </p>

          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12.5px] transition-all"
                style={{
                  background: active ? 'rgba(79,142,247,0.1)' : 'transparent',
                  color: active ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                  fontWeight: active ? 500 : 400,
                  transitionDuration: '150ms',
                  transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'rgb(var(--ink))'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgb(var(--ink2))'
                  }
                }}>
                <Icon d={item.icon} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
              style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>
                {user?.fullName ?? 'Estudiante'}
              </p>
              <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>Estudiante</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="mt-2 text-[11px] transition-colors"
            style={{ color: 'rgb(var(--ink2))' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgb(var(--err))')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgb(var(--ink2))')}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto relative z-10">
        {children}
      </div>
    </div>
  )
}
