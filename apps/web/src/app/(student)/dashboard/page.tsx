import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function StudentDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-medium text-foreground mb-2">
        Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'Estudiante'}
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Tu panel de aprendizaje está listo.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Cursos activos', value: '0', sub: 'Inscríbete en uno' },
          { label: 'Asistencia', value: '—', sub: 'Sin clases aún' },
          { label: 'Tareas pendientes', value: '0', sub: 'Al día' },
          { label: 'Puntos', value: '0', sub: 'Empieza a ganar' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-secondary rounded-md p-4">
            <div className="text-xs text-muted-foreground mb-2">{kpi.label}</div>
            <div className="text-2xl font-medium text-foreground">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground text-sm mb-4">
          Aún no estás inscrito en ningún curso.
        </p>
        <a
          href="/courses"
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity"
        >
          Ver cursos disponibles
        </a>
      </div>
    </div>
  )
}
