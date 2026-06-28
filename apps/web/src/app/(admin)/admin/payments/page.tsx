// FILE: apps/web/src/app/(admin)/admin/payments/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import { TrendingUp, Clock, XCircle, CreditCard } from 'lucide-react'

interface Payment {
  id: string
  amountCents: number
  status: string
  createdAt: string
  student?: { user?: { fullName: string; email?: string } }
  course?: { title: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  paid: { label: 'Completado', color: 'rgb(var(--ok))', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  completed: { label: 'Completado', color: 'rgb(var(--ok))', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  pending: { label: 'Pendiente', color: 'rgb(var(--gold))', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.2)' },
  failed: { label: 'Fallido', color: 'rgb(var(--err))', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? { label: status, color: 'rgb(var(--ink2))', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: 'rgb(var(--ok))', completed: 'rgb(var(--ok))',
    pending: 'rgb(var(--gold))',
    failed: 'rgb(var(--err))',
  }
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[status] ?? 'rgb(var(--ink3))' }} />
}

function getInitials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMXN(cents: number) {
  return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const FILTER_TABS = [
  { key: '', label: 'Todos' },
  { key: 'pending', label: 'Pendiente' },
  { key: 'paid', label: 'Completado' },
  { key: 'failed', label: 'Fallido' },
]

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get<Payment[]>('/payments')
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const thisMonth = useMemo(() => payments.filter(p => {
    const d = new Date(p.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }), [payments])

  const totalThisMonth = thisMonth.reduce((sum, p) => sum + (p.status === 'paid' || p.status === 'completed' ? p.amountCents : 0), 0)
  const pendingCount = payments.filter(p => p.status === 'pending').length
  const failedCount = payments.filter(p => p.status === 'failed').length

  const filtered = filter
    ? payments.filter(p => {
        if (filter === 'paid') return p.status === 'paid' || p.status === 'completed'
        return p.status === filter
      })
    : payments

  const COLS = ['Estudiante', 'Curso', 'Monto', 'Estado', 'Fecha']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--ink))' }}>Pagos</h1>
        <p className="text-[12px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
          {loading ? 'Cargando...' : `${payments.length} transacciones registradas`}
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: 'Ingresos este mes',
            value: loading ? '—' : formatMXN(totalThisMonth),
            icon: <TrendingUp size={16} />,
            accent: 'rgb(var(--blue))',
            delay: 0,
          },
          {
            label: 'Pagos pendientes',
            value: loading ? '—' : String(pendingCount),
            icon: <Clock size={16} />,
            accent: 'rgb(var(--gold))',
            delay: 60,
          },
          {
            label: 'Pagos fallidos',
            value: loading ? '—' : String(failedCount),
            icon: <XCircle size={16} />,
            accent: 'rgb(var(--err))',
            delay: 120,
          },
        ].map(stat => (
          <div key={stat.label} className="bezel animate-fade-up" style={{ animationDelay: `${stat.delay}ms` }}>
            <div className="bezel-inner p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${stat.accent} 12%, transparent)`, color: stat.accent }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgb(var(--ink3))' }}>{stat.label}</p>
                <p className="font-mono text-[20px] font-semibold leading-none" style={{ color: stat.accent }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: filter === tab.key ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === tab.key ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
              border: filter === tab.key ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-[12px] self-center" style={{ color: 'rgb(var(--ink3))' }}>
          {!loading && `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Table */}
      <div className="bezel animate-fade-up" style={{ animationDelay: '180ms' }}>
        <div className="bezel-inner overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {COLS.map(col => (
                  <th key={col} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--ink3))' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[160, 140, 80, 80, 90].map((w, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ background: 'rgb(var(--s2))', width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      <CreditCard size={30} style={{ color: 'rgb(var(--ink3))' }} />
                      <p className="text-[14px] font-medium" style={{ color: 'rgb(var(--ink))' }}>Sin pagos</p>
                      <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                        {filter ? 'No hay pagos con este estado.' : 'No se han registrado pagos todavía.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(payment => (
                  <tr
                    key={payment.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Student */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                          style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}
                        >
                          {getInitials(payment.student?.user?.fullName)}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>
                            {payment.student?.user?.fullName ?? '—'}
                          </p>
                          {payment.student?.user?.email && (
                            <p className="text-[11px]" style={{ color: 'rgb(var(--ink3))' }}>{payment.student.user.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Course */}
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                      {payment.course?.title ?? '—'}
                    </td>
                    {/* Amount */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>
                        {formatMXN(payment.amountCents)}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusDot status={payment.status} />
                        <StatusBadge status={payment.status} />
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
