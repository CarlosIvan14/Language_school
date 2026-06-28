// FILE: apps/web/src/app/(admin)/admin/crm/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

type Stage = 'lead' | 'contacted' | 'demo' | 'converted' | 'lost'

interface Activity {
  type: 'call' | 'email' | 'whatsapp'
  notes: string
  performedAt: string
}

interface Prospect {
  id: string
  name: string
  email: string
  phone?: string
  source?: string
  stage: Stage
  createdAt: string
  _count: { activities: number }
  activities: Activity[]
}

interface FunnelItem {
  stage: string
  count: number
}

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'lead',      label: 'Lead',       color: 'rgb(var(--ink3))' },
  { key: 'contacted', label: 'Contactado', color: 'rgb(var(--blue))' },
  { key: 'demo',      label: 'Demo',       color: 'rgb(var(--gold))' },
  { key: 'converted', label: 'Convertido', color: 'rgb(var(--ok))' },
  { key: 'lost',      label: 'Perdido',    color: 'rgb(var(--err))' },
]

const ACTIVITY_ICONS: Record<string, 'phone' | 'mail' | 'message'> = {
  call: 'phone',
  email: 'mail',
  whatsapp: 'message',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function CrmPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [funnel, setFunnel] = useState<FunnelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Prospect | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Add prospect form
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', source: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  // Add activity form
  const [actForm, setActForm] = useState({ type: 'call' as 'call' | 'email' | 'whatsapp', notes: '' })
  const [actLoading, setActLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [p, f] = await Promise.all([
        api.get<Prospect[]>('/crm/prospects'),
        api.get<FunnelItem[]>('/crm/funnel'),
      ])
      setProspects(p)
      setFunnel(f)
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar CRM')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function moveStage(prospectId: string, stage: Stage) {
    try {
      await api.patch(`/crm/prospects/${prospectId}/stage`, { stage })
      setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, stage } : p))
      if (selected?.id === prospectId) setSelected(prev => prev ? { ...prev, stage } : null)
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function addActivity() {
    if (!selected || !actForm.notes.trim()) return
    setActLoading(true)
    try {
      await api.post(`/crm/prospects/${selected.id}/activities`, actForm)
      const newAct: Activity = { ...actForm, performedAt: new Date().toISOString() }
      const updated = {
        ...selected,
        activities: [newAct, ...selected.activities],
        _count: { activities: selected._count.activities + 1 },
      }
      setSelected(updated)
      setProspects(prev => prev.map(p => p.id === selected.id ? updated : p))
      setActForm({ type: 'call', notes: '' })
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActLoading(false)
    }
  }

  async function addProspect() {
    if (!addForm.name.trim() || !addForm.email.trim()) return
    setAddLoading(true)
    setAddError('')
    try {
      const newP = await api.post<Prospect>('/crm/prospects', addForm)
      setProspects(prev => [newP, ...prev])
      setShowAddModal(false)
      setAddForm({ name: '', email: '', phone: '', source: '' })
    } catch (e: any) {
      setAddError(e.message ?? 'Error al agregar prospecto')
    } finally {
      setAddLoading(false)
    }
  }

  const byStage = (stage: Stage) => prospects.filter(p => p.stage === stage)
  const funnelCount = (stage: string) => funnel.find(f => f.stage === stage)?.count ?? 0

  return (
    <div className="p-6 h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'rgb(var(--ink))' }}>CRM</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>Gestión de prospectos y embudo de ventas</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-[13px]">
          <Icon name="plus" size={14} />
          Nuevo prospecto
        </button>
      </div>

      {/* Funnel stats */}
      <div className="bezel mb-4 flex-shrink-0 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <div className="bezel-inner">
          <div className="flex" style={{ borderTop: 'none' }}>
            {STAGES.map(s => (
              <div key={s.key} className="flex-1 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: s.color }}>
                  {s.label}
                </p>
                <p className="font-mono text-xl font-medium" style={{ color: 'rgb(var(--ink))' }}>
                  {loading ? '—' : funnelCount(s.key)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bezel mb-4 flex-shrink-0">
          <div className="bezel-inner p-3 flex items-center gap-2" style={{ color: 'rgb(var(--err))' }}>
            <Icon name="alert-circle" size={14} />
            <span className="text-[13px]">{error}</span>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-3 flex-1 overflow-x-auto min-h-0 animate-fade-up" style={{ animationDelay: '80ms' }}>
        {STAGES.map(stage => (
          <div key={stage.key} className="flex flex-col flex-shrink-0"
            style={{ width: 240 }}>
            {/* Column header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                <span className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>{stage.label}</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgb(var(--s2))', color: 'rgb(var(--ink2))' }}>
                {byStage(stage.key).length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pb-2 pr-1">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgb(var(--s1))' }} />
                ))
              ) : byStage(stage.key).map(prospect => (
                <button key={prospect.id} onClick={() => setSelected(prospect)}
                  className="w-full text-left rounded-xl p-3 transition-all"
                  style={{
                    background: selected?.id === prospect.id ? 'rgb(var(--s2))' : 'rgb(var(--s1))',
                    border: selected?.id === prospect.id ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgb(var(--bd))',
                  }}
                  onMouseEnter={e => {
                    if (selected?.id !== prospect.id)
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={e => {
                    if (selected?.id !== prospect.id)
                      e.currentTarget.style.borderColor = 'rgb(var(--bd))'
                  }}>
                  <p className="text-[13px] font-medium mb-0.5 truncate" style={{ color: 'rgb(var(--ink))' }}>
                    {prospect.name}
                  </p>
                  <p className="text-[11px] truncate mb-2" style={{ color: 'rgb(var(--ink2))' }}>
                    {prospect.email}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgb(var(--ink3))' }}>
                      <Icon name="activity" size={11} />
                      {prospect._count.activities} actividades
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>
                      {formatDate(prospect.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="w-[380px] h-full flex flex-col overflow-hidden"
            style={{
              background: 'rgb(var(--s0))',
              borderLeft: '1px solid rgb(var(--bd))',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
            }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>{selected.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-1.5 rounded-lg">
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Contact info */}
            <div className="px-5 py-3 flex-shrink-0 space-y-1.5" style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
              {selected.phone && (
                <div className="flex items-center gap-2 text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                  <Icon name="phone" size={13} />
                  {selected.phone}
                </div>
              )}
              {selected.source && (
                <div className="flex items-center gap-2 text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
                  <Icon name="tag" size={13} />
                  Fuente: {selected.source}
                </div>
              )}
            </div>

            {/* Stage buttons */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--ink3))' }}>
                Mover a etapa
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map(s => (
                  <button key={s.key} onClick={() => moveStage(selected.id, s.key)}
                    className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all"
                    style={{
                      background: selected.stage === s.key ? `${s.color}22` : 'rgb(var(--s2))',
                      color: selected.stage === s.key ? s.color : 'rgb(var(--ink2))',
                      border: selected.stage === s.key ? `1px solid ${s.color}44` : '1px solid transparent',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add activity */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgb(var(--ink3))' }}>
                Registrar actividad
              </p>
              <div className="flex gap-2 mb-2">
                {(['call', 'email', 'whatsapp'] as const).map(t => (
                  <button key={t} onClick={() => setActForm(f => ({ ...f, type: t }))}
                    className="flex-1 text-[11px] py-1.5 rounded-lg capitalize transition-all"
                    style={{
                      background: actForm.type === t ? 'rgba(79,142,247,0.15)' : 'rgb(var(--s2))',
                      color: actForm.type === t ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                      border: actForm.type === t ? '1px solid rgba(79,142,247,0.3)' : '1px solid transparent',
                    }}>
                    {t === 'call' ? 'Llamada' : t === 'email' ? 'Email' : 'WhatsApp'}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Notas sobre la actividad..."
                rows={2}
                value={actForm.notes}
                onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full text-[12px] rounded-lg px-3 py-2 resize-none outline-none"
                style={{
                  background: 'rgb(var(--s2))',
                  border: '1px solid rgb(var(--bd))',
                  color: 'rgb(var(--ink))',
                }}
              />
              <button onClick={addActivity} disabled={actLoading || !actForm.notes.trim()}
                className="btn-primary mt-2 w-full text-[12px] py-2 disabled:opacity-50">
                {actLoading ? 'Guardando...' : 'Registrar actividad'}
              </button>
            </div>

            {/* Activity log */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink3))' }}>
                Historial de actividades
              </p>
              {selected.activities.length === 0 ? (
                <p className="text-[12px] text-center py-6" style={{ color: 'rgb(var(--ink3))' }}>
                  Sin actividades registradas
                </p>
              ) : (
                <div className="space-y-2">
                  {selected.activities.map((act, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgb(var(--s2))', color: 'rgb(var(--ink2))' }}>
                        <Icon name={ACTIVITY_ICONS[act.type] ?? 'activity'} size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium capitalize" style={{ color: 'rgb(var(--ink))' }}>
                            {act.type === 'call' ? 'Llamada' : act.type === 'email' ? 'Email' : 'WhatsApp'}
                          </span>
                          <span className="text-[10px] flex-shrink-0" style={{ color: 'rgb(var(--ink3))' }}>
                            {formatDateTime(act.performedAt)}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
                          {act.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add prospect modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="bezel w-[400px] animate-fade-up">
            <div className="bezel-inner p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>
                  Nuevo prospecto
                </h2>
                <button onClick={() => setShowAddModal(false)} className="btn-ghost p-1.5 rounded-lg">
                  <Icon name="x" size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Nombre completo', key: 'name', type: 'text', placeholder: 'Juan García' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'juan@ejemplo.com' },
                  { label: 'Teléfono', key: 'phone', type: 'tel', placeholder: '+52 55 1234 5678' },
                  { label: 'Fuente', key: 'source', type: 'text', placeholder: 'Instagram, referido, web...' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(addForm as any)[field.key]}
                      onChange={e => setAddForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full text-[13px] px-3 py-2 rounded-lg outline-none"
                      style={{
                        background: 'rgb(var(--s2))',
                        border: '1px solid rgb(var(--bd))',
                        color: 'rgb(var(--ink))',
                      }}
                    />
                  </div>
                ))}
              </div>

              {addError && (
                <p className="text-[12px] mt-3" style={{ color: 'rgb(var(--err))' }}>{addError}</p>
              )}

              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowAddModal(false)} className="btn-ghost flex-1 text-[13px] py-2">
                  Cancelar
                </button>
                <button onClick={addProspect} disabled={addLoading || !addForm.name.trim() || !addForm.email.trim()}
                  className="btn-primary flex-1 text-[13px] py-2 disabled:opacity-50">
                  {addLoading ? 'Guardando...' : 'Crear prospecto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
