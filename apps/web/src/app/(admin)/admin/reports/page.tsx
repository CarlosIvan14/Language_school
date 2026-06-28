'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null)
  const [funnel, setFunnel] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.get<any>('/admin/dashboard'),
      api.get<any[]>('/crm/funnel'),
    ]).then(([d, f]) => { setData(d); setFunnel(f) }).catch(() => {})
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Reportes</h1>
        <p className="text-sm text-muted-foreground">Estadísticas del negocio</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading text-sm font-medium mb-4">Resumen académico</h2>
          <div className="space-y-3">
            {[
              { label: 'Total estudiantes', value: data?.totalStudents ?? '—' },
              { label: 'Cursos activos', value: data?.activeCourses ?? '—' },
              { label: 'Tasa de asistencia', value: data ? `${data.attendanceRate}%` : '—' },
              { label: 'Certificados emitidos', value: data?.totalCertificates ?? '—' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="text-sm font-medium text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading text-sm font-medium mb-4">Ingresos del mes</h2>
          <div className="text-center py-4">
            <p className="text-4xl font-heading font-medium text-foreground">
              ${data ? (data.monthlyRevenueCents / 100).toLocaleString() : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">USD — mes actual</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-sm font-medium mb-4">Embudo de ventas (CRM)</h2>
        <div className="flex items-end gap-3 h-32">
          {funnel.map(f => {
            const max = Math.max(...funnel.map(x => x.count), 1)
            const pct = (f.count / max) * 100
            const colors: Record<string, string> = {
              lead: 'bg-blue-400', contacted: 'bg-amber-400', demo: 'bg-purple-400',
              converted: 'bg-green-500', lost: 'bg-red-400',
            }
            return (
              <div key={f.stage} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-foreground">{f.count}</span>
                <div className={`w-full rounded-t-md ${colors[f.stage] ?? 'bg-primary'} transition-all`} style={{ height: `${pct}%`, minHeight: f.count > 0 ? 8 : 0 }} />
                <span className="text-[10px] text-muted-foreground capitalize">{f.stage}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
