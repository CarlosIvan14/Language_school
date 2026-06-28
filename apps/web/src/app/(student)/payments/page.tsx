'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Pagado', cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Fallido', cls: 'bg-red-100 text-red-700' },
  refunded: { label: 'Reembolsado', cls: 'bg-blue-100 text-blue-700' },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/payments/me')
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [])

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amountCents, 0)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Pagos</h1>
        <p className="text-sm text-muted-foreground mt-1">Historial de tus transacciones</p>
      </div>

      {!loading && payments.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total pagado</p>
            <p className="text-xl font-heading font-medium text-foreground">${(totalPaid / 100).toFixed(2)} USD</p>
          </div>
          <span className="text-2xl">💳</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : !payments.length ? (
        <p className="text-sm text-muted-foreground text-center py-16">Sin pagos registrados.</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {payments.map((p: any) => {
            const st = STATUS_MAP[p.status] ?? { label: p.status, cls: 'bg-secondary text-muted-foreground' }
            return (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.course?.title ?? 'Pago'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">${(p.amountCents / 100).toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
