// FILE: apps/web/src/app/(teacher)/teacher/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { auth } from '@/lib/api'
import { Icon } from '@/components/Icon'

const nav = [
  { href: '/teacher/dashboard',    label: 'Dashboard',      icon: 'home'         as const },
  { href: '/teacher/courses',      label: 'Mis cursos',     icon: 'book'         as const },
  { href: '/teacher/availability', label: 'Mi horario',     icon: 'calendar'     as const },
  { href: '/teacher/students',     label: 'Estudiantes',    icon: 'users'        as const },
  { href: '/teacher/sessions',     label: 'Sesiones',       icon: 'video'        as const },
  { href: '/teacher/attendance',   label: 'Asistencia',     icon: 'check-circle' as const },
  { href: '/teacher/homework',     label: 'Tareas',         icon: 'clipboard'    as const },
  { href: '/teacher/grades',       label: 'Calificaciones', icon: 'bar-chart'    as const },
  { href: '/teacher/materials',    label: 'Materiales',     icon: 'folder'       as const },
  { href: '/teacher/chat',         label: 'Chat',           icon: 'message'      as const },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ fullName: string; email?: string; role?: string } | null>(null)
  useEffect(() => { setUser(auth.getUser()) }, [])
  const initials = (user?.fullName ?? '').split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'P'

  async function handleLogout() {
    try { await auth.logout() } catch {}
    auth.clearTokens()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'rgb(var(--bg))' }}>

      <aside className="w-[196px] flex-shrink-0 flex flex-col"
        style={{ background: 'rgb(var(--s0))', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

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
            Profesor
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
                <Icon name={item.icon} size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2.5 rounded-lg p-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
              style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>
                {user?.fullName ?? 'Profesor'}
              </p>
              <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>Profesor</p>
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
