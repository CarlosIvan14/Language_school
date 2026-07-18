// FILE: apps/web/src/app/(student)/student/payments/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  paid:     { label: 'Pagado',      bg: 'rgba(52,211,153,0.15)', color: 'rgb(var(--ok))' },
  pending:  { label: 'Pendiente',   bg: 'rgba(245,166,35,0.15)', color: 'rgb(var(--gold))' },
  failed:   { label: 'Fallido',     bg: 'rgba(248,113,113,0.15)', color: 'rgb(var(--err))' },
  refunded: { label: 'Reembolsado', bg: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/payments/me').then(setPayments).catch(() => setPayments([])).finally(() => setLoading(false))
  }, [])

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amountCents, 0)

  return (
    <div className="p-6 max-w-[720px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Pagos</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Historial de tus transacciones</p>
      </div>

      {!loading && payments.length > 0 && (
        <div className="bezel mb-4 animate-fade-up"><div className="bezel-inner p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>Total pagado</p>
            <p className="font-mono text-xl font-medium" style={{ color: 'rgb(var(--ok))' }}>${(totalPaid / 100).toFixed(2)} USD</p>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
            <Icon name="credit-card" size={18} style={{ color: 'rgb(var(--ok))' }} />
          </div>
        </div></div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bezel"><div className="bezel-inner h-14 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !payments.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-14 text-center text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Sin pagos registrados</div></div>
      ) : (
        <div className="bezel animate-fade-up"><div className="bezel-inner">
          {payments.map((p: any) => {
            const st = STATUS_MAP[p.status] ?? { label: p.status, bg: 'rgb(var(--s2))', color: 'rgb(var(--ink2))' }
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{p.course?.title ?? 'Pago'}</p>
                  <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{new Date(p.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-medium font-mono" style={{ color: 'rgb(var(--ink))' }}>${(p.amountCents / 100).toFixed(2)}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              </div>
            )
          })}
        </div></div>
      )}
    </div>
  )
}
