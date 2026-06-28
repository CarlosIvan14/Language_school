'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).catch(() => setData({}))
  }, [])

  const kpis = [
    { label: 'Total estudiantes', value: data?.totalStudents ?? '—', icon: '👥', link: '/admin/students' },
    { label: 'Cursos activos', value: data?.activeCourses ?? '—', icon: '📚', link: '/admin/courses' },
    { label: 'Ingresos del mes', value: data?.monthlyRevenueCents != null ? `$${(data.monthlyRevenueCents / 100).toLocaleString()}` : '—', icon: '💰', link: '/admin/payments' },
    { label: 'Tasa de asistencia', value: data?.attendanceRate != null ? `${data.attendanceRate}%` : '—', icon: '✅', link: '/admin/reports' },
    { label: 'Prospectos activos', value: data?.activeProspects ?? '—', icon: '🎯', link: '/admin/crm' },
    { label: 'Certificados emitidos', value: data?.totalCertificates ?? '—', icon: '🎓', link: '/admin/certificates' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mt-1">Vista general de EspañolPro</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/courses/new" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">+ Nuevo curso</Link>
          <Link href="/admin/crm/new" className="text-sm border border-border text-foreground px-4 py-2 rounded-md hover:bg-secondary transition-colors">+ Prospecto</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {kpis.map(kpi => (
          <Link key={kpi.label} href={kpi.link} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-xs">{kpi.label}</span>
              <span className="text-lg">{kpi.icon}</span>
            </div>
            <p className="text-2xl font-heading font-medium text-foreground">{kpi.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent enrollments */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium">Inscripciones recientes</h2>
            <Link href="/admin/enrollments" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          {!data?.recentEnrollments?.length ? (
            <p className="text-sm text-muted-foreground">Sin inscripciones recientes.</p>
          ) : (
            <div className="space-y-3">
              {data.recentEnrollments.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
                    {e.student?.user?.fullName?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{e.student?.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.course?.title}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {e.status === 'active' ? 'Activo' : 'Espera'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by course */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium">Pagos recientes</h2>
            <Link href="/admin/payments" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          {!data?.recentPayments?.length ? (
            <p className="text-sm text-muted-foreground">Sin pagos registrados.</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.student?.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('es')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">${(p.amountCents / 100).toFixed(2)}</p>
                    <span className={`text-[10px] ${p.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{p.status === 'paid' ? 'Pagado' : 'Pendiente'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
