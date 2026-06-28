'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STAGES = ['lead', 'contacted', 'demo', 'converted', 'lost'] as const
const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead', contacted: 'Contactado', demo: 'Demo', converted: 'Convertido', lost: 'Perdido',
}
const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-700', contacted: 'bg-amber-100 text-amber-700',
  demo: 'bg-purple-100 text-purple-700', converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default function CrmPage() {
  const [funnel, setFunnel] = useState<any[]>([])
  const [prospects, setProspects] = useState<any[]>([])
  const [stageFilter, setStageFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', email: '', phone: '', source: '' })

  function load() {
    const q = stageFilter ? `?stage=${stageFilter}` : ''
    Promise.all([
      api.get<any[]>('/crm/funnel'),
      api.get<any[]>(`/crm/prospects${q}`),
    ]).then(([f, p]) => { setFunnel(f); setProspects(p) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [stageFilter])

  async function createProspect() {
    await api.post('/crm/prospects', newForm)
    setShowNew(false)
    setNewForm({ name: '', email: '', phone: '', source: '' })
    load()
  }

  async function updateStage(id: string, stage: string) {
    await api.patch(`/crm/prospects/${id}/stage`, { stage })
    load()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground">CRM — Prospectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión del embudo de ventas</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
          + Nuevo prospecto
        </button>
      </div>

      {/* Funnel */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {funnel.map(f => (
          <div key={f.stage} onClick={() => setStageFilter(stageFilter === f.stage ? '' : f.stage)}
            className={`bg-card border rounded-lg p-3 text-center cursor-pointer transition-colors ${stageFilter === f.stage ? 'border-primary' : 'border-border'} hover:border-primary/40`}>
            <p className="text-2xl font-heading font-medium text-foreground">{f.count}</p>
            <p className="text-xs text-muted-foreground capitalize">{STAGE_LABELS[f.stage]}</p>
          </div>
        ))}
      </div>

      {/* New prospect modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="font-heading text-lg font-medium mb-4">Nuevo prospecto</h2>
            <div className="space-y-3">
              {[
                { k: 'name', label: 'Nombre *', placeholder: 'Ana González' },
                { k: 'email', label: 'Email', placeholder: 'ana@email.com' },
                { k: 'phone', label: 'Teléfono', placeholder: '+52 55 1234 5678' },
                { k: 'source', label: 'Fuente', placeholder: 'Instagram, referido, Google...' },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                  <input value={(newForm as any)[f.k]} onChange={e => setNewForm(x => ({ ...x, [f.k]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 border border-border text-sm py-2 rounded-md hover:bg-secondary">Cancelar</button>
              <button onClick={createProspect} disabled={!newForm.name.trim()}
                className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded-md hover:opacity-90 disabled:opacity-50">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse"/>)}</div>
      ) : !prospects.length ? (
        <p className="text-muted-foreground text-sm text-center py-12">Sin prospectos{stageFilter ? ` en etapa "${STAGE_LABELS[stageFilter]}"` : ''}.</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {prospects.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground flex-shrink-0">
                {p.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.email ?? p.phone} {p.source ? `· ${p.source}` : ''}</p>
              </div>
              <select value={p.stage} onChange={e => updateStage(p.id, e.target.value)}
                className={`text-xs px-2 py-1 rounded-full border-0 ${STAGE_COLORS[p.stage]} cursor-pointer`}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
              <span className="text-xs text-muted-foreground flex-shrink-0">{p._count?.activities ?? 0} act.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
