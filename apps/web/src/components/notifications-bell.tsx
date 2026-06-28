'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function NotificationsBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])

  useEffect(() => {
    api.get<any[]>('/notifications?unread=true')
      .then(n => setCount(n.length))
      .catch(() => {})
  }, [])

  async function handleOpen() {
    if (!open) {
      const n = await api.get<any[]>('/notifications').catch(() => [] as any[])
      setNotifs(n)
    }
    setOpen(o => !o)
  }

  async function markAll() {
    if (!notifs.length) return
    await api.patch('/notifications/read', { ids: notifs.map(n => n.id) }).catch(() => {})
    setCount(0)
    setNotifs(n => n.map(x => ({ ...x, sentAt: new Date() })))
  }

  return (
    <div className="relative">
      <button onClick={handleOpen}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
        🔔
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-medium">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Notificaciones</p>
            {count > 0 && (
              <button onClick={markAll} className="text-xs text-primary hover:underline">Marcar leídas</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {!notifs.length ? (
              <p className="text-sm text-muted-foreground p-4 text-center">Sin notificaciones.</p>
            ) : (
              notifs.slice(0, 10).map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 ${!n.sentAt ? 'bg-primary/5' : ''}`}>
                  <p className="text-xs font-medium text-foreground">{n.type.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
