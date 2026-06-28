'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    api.get<any>('/admin/dashboard')
      .then(d => {
        setPayments(d.recentPayments ?? [])
        setTotal(d.monthlyRevenueCents ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Pagos</h1>
        <p className="text-sm text-muted-foreground">Historial de transacciones</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Ingresos del mes</p>
          <p className="text-2xl font-heading font-medium text-foreground">${(total / 100).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Pagos recientes</p>
          <p className="text-2xl font-heading font-medium text-foreground">{payments.length}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {['Estudiante', 'Curso', 'Monto', 'Estado', 'Fecha'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-4"><div className="h-4 bg-secondary rounded animate-pulse" /></td></tr>
              ))
            ) : !payments.length ? (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8 text-sm">Sin pagos registrados.</td></tr>
            ) : (
              payments.map(p => (
                <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-foreground">{p.student?.user?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.course?.title ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-foreground">${(p.amountCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-secondary text-muted-foreground'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('es')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
