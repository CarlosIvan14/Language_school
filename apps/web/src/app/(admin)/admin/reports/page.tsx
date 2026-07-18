// FILE: apps/web/src/app/(admin)/admin/reports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STAGE_COLORS: Record<string, string> = {
  lead: 'rgb(var(--ink3))', contacted: 'rgb(var(--blue))', demo: 'rgb(var(--gold))',
  converted: 'rgb(var(--ok))', lost: 'rgb(var(--err))',
}
const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', contacted: 'Contactado', demo: 'Demo', converted: 'Cliente', lost: 'Perdido',
}

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null)
  const [funnel, setFunnel] = useState<any[]>([])

  useEffect(() => {
    Promise.all([api.get<any>('/admin/dashboard'), api.get<any[]>('/crm/funnel')])
      .then(([d, f]) => { setData(d); setFunnel(f) }).catch(() => {})
  }, [])

  const rows = [
    { label: 'Total estudiantes', value: data?.totalStudents ?? '—' },
    { label: 'Cursos activos', value: data?.activeCourses ?? '—' },
    { label: 'Tasa de asistencia', value: data ? `${data.attendanceRate}%` : '—' },
    { label: 'Certificados emitidos', value: data?.totalCertificates ?? '—' },
  ]
  const max = Math.max(...funnel.map(x => x.count), 1)

  return (
    <div className="p-6 max-w-[1140px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Reportes</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Estadísticas del negocio</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bezel animate-fade-up" style={{ animationDelay: '40ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgb(var(--ink2))' }}>Resumen académico</p>
          <div className="space-y-3">
            {rows.map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>{r.label}</span>
                <span className="text-[14px] font-mono font-medium" style={{ color: 'rgb(var(--ink))' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div></div>

        <div className="bezel animate-fade-up" style={{ animationDelay: '80ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgb(var(--ink2))' }}>Ingresos del mes</p>
          <div className="text-center py-4">
            <p className="font-mono text-4xl font-medium" style={{ color: 'rgb(var(--ok))' }}>
              ${data ? (data.monthlyRevenueCents / 100).toLocaleString() : '—'}
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>USD — mes actual</p>
          </div>
        </div></div>
      </div>

      <div className="bezel animate-fade-up" style={{ animationDelay: '120ms' }}><div className="bezel-inner p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgb(var(--ink2))' }}>Embudo de ventas (CRM)</p>
        <div className="flex items-end gap-3 h-40">
          {funnel.map(f => {
            const pct = (f.count / max) * 100
            return (
              <div key={f.stage} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[13px] font-mono font-medium" style={{ color: 'rgb(var(--ink))' }}>{f.count}</span>
                <div className="w-full rounded-t-md transition-all" style={{ height: `${pct}%`, minHeight: f.count > 0 ? 8 : 2, background: STAGE_COLORS[f.stage] ?? 'rgb(var(--blue))' }} />
                <span className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>{STAGE_LABELS[f.stage] ?? f.stage}</span>
              </div>
            )
          })}
        </div>
      </div></div>
    </div>
  )
}
