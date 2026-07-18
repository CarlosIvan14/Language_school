// FILE: apps/web/src/app/(teacher)/teacher/availability/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

interface Slot { weekday: number; startMin: number; endMin: number }

// Display Monday-first; weekday index stays 0=Sunday for the backend
const DAYS = [
  { idx: 1, label: 'Lun' },
  { idx: 2, label: 'Mar' },
  { idx: 3, label: 'Mié' },
  { idx: 4, label: 'Jue' },
  { idx: 5, label: 'Vie' },
  { idx: 6, label: 'Sáb' },
  { idx: 0, label: 'Dom' },
]
const HOURS = Array.from({ length: 15 }, (_, i) => 7 + i) // 07:00 .. 21:00

function key(weekday: number, hour: number) { return `${weekday}-${hour}` }
function fmtHour(h: number) { return `${String(h).padStart(2, '0')}:00` }

export default function AvailabilityPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dragging, setDragging] = useState<null | boolean>(null) // true=painting on, false=erasing

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const slots = await api.get<Slot[]>('/teachers/me/availability')
      const set = new Set<string>()
      slots.forEach(s => {
        for (let h = Math.floor(s.startMin / 60); h < Math.ceil(s.endMin / 60); h++) {
          set.add(key(s.weekday, h))
        }
      })
      setSelected(set)
    } catch {
      setSelected(new Set())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function paint(weekday: number, hour: number, on: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      const k = key(weekday, hour)
      if (on) next.add(k); else next.delete(k)
      return next
    })
    setSaved(false)
  }

  function toggleCell(weekday: number, hour: number) {
    const on = !selected.has(key(weekday, hour))
    setDragging(on)
    paint(weekday, hour, on)
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    // Merge consecutive hours per day into compact slots
    const slots: Slot[] = []
    for (const { idx } of DAYS) {
      const hrs = HOURS.filter(h => selected.has(key(idx, h))).sort((a, b) => a - b)
      let start: number | null = null
      let prev: number | null = null
      for (const h of hrs) {
        if (start === null) { start = h; prev = h }
        else if (prev !== null && h === prev + 1) { prev = h }
        else { slots.push({ weekday: idx, startMin: start * 60, endMin: (prev! + 1) * 60 }); start = h; prev = h }
      }
      if (start !== null) slots.push({ weekday: idx, startMin: start * 60, endMin: (prev! + 1) * 60 })
    }
    try {
      await api.put('/teachers/me/availability', { slots })
      setSaved(true)
    } catch {
      /* keep silent error; button re-enables */
    } finally {
      setSaving(false)
    }
  }

  const totalHours = selected.size

  return (
    <div className="p-6 max-w-[900px] mx-auto relative z-10"
      onMouseUp={() => setDragging(null)}
      onMouseLeave={() => setDragging(null)}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(79,142,247,0.1)', color: 'rgb(var(--blue))' }}>
            <Icon name="calendar" size={11} />
            Horario semanal
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>
            Mi disponibilidad
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>
            Marca las horas en que estás libre para dar clases. Haz clic o arrastra para pintar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>
            {totalHours} h/semana
          </span>
          <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 disabled:opacity-40"
            style={{ borderRadius: '0.5rem' }}>
            {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="bezel animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="bezel-inner p-4 overflow-x-auto">
          {loading ? (
            <div className="h-[420px] rounded-lg animate-pulse" style={{ background: 'rgb(var(--s2))' }} />
          ) : (
            <div style={{ minWidth: 560 }}>
              {/* Day headers */}
              <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)', gap: 3 }}>
                <div />
                {DAYS.map(d => (
                  <div key={d.idx} className="text-center text-[11px] font-semibold pb-2"
                    style={{ color: 'rgb(var(--ink2))' }}>
                    {d.label}
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              {HOURS.map(h => (
                <div key={h} className="grid items-center" style={{ gridTemplateColumns: '52px repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
                  <div className="text-right pr-2 font-mono text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>
                    {fmtHour(h)}
                  </div>
                  {DAYS.map(d => {
                    const on = selected.has(key(d.idx, h))
                    return (
                      <button
                        key={d.idx}
                        onMouseDown={() => toggleCell(d.idx, h)}
                        onMouseEnter={() => { if (dragging !== null) paint(d.idx, h, dragging) }}
                        className="h-7 rounded-md transition-all select-none"
                        style={{
                          background: on ? 'rgba(52,211,153,0.22)' : 'rgb(var(--s2))',
                          border: on ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                        }}
                        title={`${d.label} ${fmtHour(h)}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[11px] animate-fade-up" style={{ animationDelay: '100ms', color: 'rgb(var(--ink2))' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(52,211,153,0.22)', border: '1px solid rgba(52,211,153,0.5)' }} />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.05)' }} />
          Ocupado / sin marcar
        </span>
      </div>
    </div>
  )
}
