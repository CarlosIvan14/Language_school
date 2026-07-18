'use client'

import { useEffect, useState } from 'react'
import { api, auth } from '@/lib/api'

/**
 * Small unread-count bubble shown next to the "Chat" sidebar item.
 * Polls /chat/unread and refreshes instantly when a conversation is opened
 * (the ChatView dispatches a `chat:read` window event).
 */
export function ChatNavBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!auth.isLoggedIn()) return
    let alive = true
    const load = () => api.get<number>('/chat/unread').then(n => { if (alive) setCount(Number(n) || 0) }).catch(() => {})
    load()
    const id = setInterval(load, 10_000)
    const onRead = () => setTimeout(load, 400)
    window.addEventListener('chat:read', onRead)
    return () => { alive = false; clearInterval(id); window.removeEventListener('chat:read', onRead) }
  }, [])

  if (count <= 0) return null
  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
      style={{ background: 'rgb(var(--blue))', color: '#fff' }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
