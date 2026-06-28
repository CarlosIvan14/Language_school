import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') redirect('/login')

  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-52 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-medium text-xs">
            E
          </div>
          <span className="font-heading font-medium text-sm text-foreground">EspañolPro</span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-muted-foreground px-2 py-1 uppercase tracking-wide">
            Estudiante
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-foreground truncate">{profile.full_name}</p>
              <p className="text-[10px] text-muted-foreground">Estudiante</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <div />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </header>
        <main className="min-h-full">{children}</main>
      </div>
    </div>
  )
}
