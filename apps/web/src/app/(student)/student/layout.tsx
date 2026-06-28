'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/api'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/student/courses', label: 'Mis cursos', icon: '📚' },
  { href: '/student/calendar', label: 'Calendario', icon: '📅' },
  { href: '/student/homework', label: 'Tareas', icon: '📋' },
  { href: '/student/exams', label: 'Exámenes', icon: '📝' },
  { href: '/student/materials', label: 'Materiales', icon: '📁' },
  { href: '/student/certificates', label: 'Certificados', icon: '🎓' },
  { href: '/student/chat', label: 'Chat', icon: '💬' },
  { href: '/student/payments', label: 'Pagos', icon: '💳' },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = auth.getUser()

  const initials = (user?.fullName ?? 'E')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    try { await auth.logout() } catch {}
    auth.clearTokens()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-52 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-medium text-xs">E</div>
          <span className="font-heading font-medium text-sm text-foreground">EspañolPro</span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-muted-foreground px-2 py-1 uppercase tracking-wide">Estudiante</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}>
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-foreground truncate">{user?.fullName ?? 'Estudiante'}</p>
              <p className="text-[10px] text-muted-foreground">Estudiante</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <main className="min-h-full">{children}</main>
      </div>
    </div>
  )
}
