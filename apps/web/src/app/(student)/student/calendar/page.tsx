'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function CalendarPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any>('/students/me/dashboard')
      .then(d => setSessions(d.upcomingSessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const grouped: Record<string, any[]> = {}
  sessions.forEach(s => {
    const day = new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
    grouped[day] = [...(grouped[day] ?? []), s]
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Calendario</h1>
        <p className="text-sm text-muted-foreground mt-1">Tus próximas clases</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}</div>
      ) : !sessions.length ? (
        <p className="text-sm text-muted-foreground text-center py-16">Sin clases próximas.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, list]) => (
            <div key={day}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 capitalize">{day}</p>
              <div className="space-y-2">
                {list.map(s => (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="text-center flex-shrink-0 w-12">
                      <p className="text-primary font-medium text-sm">{new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{s.title ?? s.course?.title}</p>
                      <p className="text-xs text-muted-foreground">{s.durationMin ?? 60} min</p>
                    </div>
                    {s.zoomLink && (
                      <a href={s.zoomLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 flex-shrink-0">
                        Unirse
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
