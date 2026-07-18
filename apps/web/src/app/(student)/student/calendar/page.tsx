// FILE: apps/web/src/app/(student)/student/calendar/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'
import { ZoomLogo } from '@/components/ZoomLogo'

export default function CalendarPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any>('/students/me/dashboard').then(d => setSessions(d.upcomingSessions ?? [])).catch(() => setSessions([])).finally(() => setLoading(false))
  }, [])

  const grouped: Record<string, any[]> = {}
  sessions.forEach(s => {
    const day = new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
    grouped[day] = [...(grouped[day] ?? []), s]
  })

  return (
    <div className="p-6 max-w-[720px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Calendario</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Tus próximas clases</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="bezel"><div className="bezel-inner h-20 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !sessions.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-14 text-center text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Sin clases próximas</div></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, list]) => (
            <div key={day} className="animate-fade-up">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 capitalize" style={{ color: 'rgb(var(--ink3))' }}>{day}</p>
              <div className="space-y-2">
                {list.map(s => (
                  <div key={s.id} className="bezel"><div className="bezel-inner p-4 flex items-center gap-4">
                    <div className="text-center flex-shrink-0 w-14 font-mono font-medium text-[13px]" style={{ color: 'rgb(var(--blue))' }}>
                      {new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{s.title ?? s.course?.title}</p>
                      <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{s.durationMin ?? 60} min</p>
                    </div>
                    {s.zoomLink && (
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <ZoomLogo size={18} />
                        <a href={s.zoomLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-[12px] px-3 py-1.5" style={{ borderRadius: '0.5rem' }}>Unirse</a>
                      </span>
                    )}
                  </div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
