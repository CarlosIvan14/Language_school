import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-medium text-sm">
            E
          </div>
          <span className="font-heading font-medium text-foreground">EspañolPro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs rounded-full px-3 py-1 mb-6">
          Plataforma certificada DELE
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-medium text-foreground mb-6 leading-tight">
          Aprende español con una plataforma completa y moderna
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Clases en vivo, materiales, tareas, certificados y seguimiento de progreso — todo en un solo lugar. Desde A1 hasta C2.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Inscribirme ahora
          </Link>
          <Link
            href="/courses"
            className="border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-secondary transition-colors"
          >
            Ver cursos disponibles
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          {[
            { value: '1,240+', label: 'Estudiantes activos' },
            { value: '48', label: 'Profesores certificados' },
            { value: 'A1–C2', label: 'Todos los niveles' },
            { value: '3', label: 'Idiomas de interfaz' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-heading font-medium text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
