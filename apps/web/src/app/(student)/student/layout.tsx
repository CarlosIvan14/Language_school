// FILE: apps/web/src/app/(student)/student/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { ChatNavBadge } from '@/components/ChatNavBadge'
import { SidebarUser } from '@/components/SidebarUser'

const nav = [
  { href: '/student/dashboard',    label: 'Dashboard',    icon: 'home'        as const },
  { href: '/student/courses',      label: 'Mis cursos',   icon: 'book'        as const },
  { href: '/student/calendar',     label: 'Calendario',   icon: 'calendar'    as const },
  { href: '/student/exams',        label: 'Exámenes',     icon: 'file-text'   as const },
  { href: '/student/certificates', label: 'Certificados', icon: 'award'       as const },
  { href: '/student/chat',         label: 'Chat',         icon: 'message'     as const },
  { href: '/student/payments',     label: 'Pagos',        icon: 'credit-card' as const },
  { href: '/student/profile',      label: 'Mi perfil',    icon: 'user'        as const },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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
                <Icon name={item.icon} size={15} />
                {item.label}
                {item.href.endsWith('/chat') && <ChatNavBadge />}
              </Link>
            )
          })}
        </nav>

        <SidebarUser profileHref="/student/profile" roleLabel="Estudiante" fallback="Estudiante" />
      </aside>

      <div className="flex-1 overflow-auto relative z-10">
        {children}
      </div>
    </div>
  )
}
