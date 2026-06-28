// FILE: apps/web/src/app/(student)/student/chat/page.tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { api, auth } from '@/lib/api'
import { Icon } from '@/components/Icon'

interface ConversationUser {
  id: string
  fullName: string
  avatarUrl?: string
}

interface LastMessage {
  body: string
  createdAt: string
}

interface Conversation {
  with: ConversationUser
  lastMessage: LastMessage
}

interface Message {
  id: string
  senderId: string
  body: string
  createdAt: string
  sender: { fullName: string; avatarUrl?: string }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<ConversationUser | null>(null)
  const [input, setInput] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [error, setError] = useState('')
  const socketRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const me = auth.getUser()

  // Load conversations
  useEffect(() => {
    api.get<Conversation[]>('/chat/conversations')
      .then(setConversations)
      .catch(e => setError(e.message))
      .finally(() => setLoadingConvs(false))
  }, [])

  // Connect socket
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return

    let io: any
    import('socket.io-client').then(({ io: ioFn }) => {
      io = ioFn('http://localhost:3001', {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket'],
      })

      io.on('connect', () => { socketRef.current = io })

      io.on('message', (msg: Message) => {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        // Update conversation list last message
        setConversations(prev => prev.map(c =>
          c.with.id === msg.senderId || c.with.id === selected?.id
            ? { ...c, lastMessage: { body: msg.body, createdAt: msg.createdAt } }
            : c
        ))
      })

      socketRef.current = io
    }).catch(() => {})

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load messages for selected conversation
  const loadMessages = useCallback(async (user: ConversationUser) => {
    setLoadingMsgs(true)
    setMessages([])
    try {
      const msgs = await api.get<Message[]>(`/chat/messages?withUser=${user.id}`)
      setMessages(msgs)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingMsgs(false)
    }
  }, [])

  useEffect(() => {
    if (selected) loadMessages(selected)
  }, [selected, loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!input.trim() || !selected || !socketRef.current) return
    const body = input.trim()
    setInput('')

    // Optimistic local message
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: me?.id ?? '',
      body,
      createdAt: new Date().toISOString(),
      sender: { fullName: me?.fullName ?? 'Yo' },
    }
    setMessages(prev => [...prev, tempMsg])

    socketRef.current.emit('send_message', { recipientId: selected.id, body })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Conversation list */}
      <div className="w-[260px] flex-shrink-0 flex flex-col"
        style={{
          background: 'rgb(var(--s0))',
          borderRight: '1px solid rgb(var(--bd))',
        }}>
        <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Mensajes</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full animate-pulse flex-shrink-0" style={{ background: 'rgb(var(--s2))' }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded animate-pulse" style={{ background: 'rgb(var(--s2))', width: '60%' }} />
                  <div className="h-2.5 rounded animate-pulse" style={{ background: 'rgb(var(--s2))', width: '80%' }} />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <p className="text-[12px] text-center py-8 px-4" style={{ color: 'rgb(var(--ink3))' }}>
              Sin conversaciones aún
            </p>
          ) : conversations.map(conv => (
            <button key={conv.with.id} onClick={() => setSelected(conv.with)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{
                background: selected?.id === conv.with.id ? 'rgba(79,142,247,0.08)' : 'transparent',
                borderLeft: selected?.id === conv.with.id ? '2px solid rgb(var(--blue))' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (selected?.id !== conv.with.id)
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={e => {
                if (selected?.id !== conv.with.id)
                  e.currentTarget.style.background = 'transparent'
              }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                {getInitials(conv.with.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[12px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>
                    {conv.with.fullName}
                  </p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'rgb(var(--ink3))' }}>
                    {formatTime(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
                  {conv.lastMessage.body}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <div style={{ color: 'rgb(var(--ink3))' }}>
              <Icon name="message" size={36} />
            </div>
            <p className="text-[13px]" style={{ color: 'rgb(var(--ink3))' }}>
              Selecciona una conversación
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgb(var(--bd))', background: 'rgb(var(--s0))' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                {getInitials(selected.fullName)}
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>
                {selected.fullName}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMsgs ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className="h-10 rounded-2xl animate-pulse"
                      style={{ background: 'rgb(var(--s2))', width: 160 + (i % 3) * 40 }} />
                  </div>
                ))
              ) : messages.map(msg => {
                const isMe = msg.senderId === me?.id
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
                        style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                        {getInitials(msg.sender.fullName)}
                      </div>
                    )}
                    <div className="max-w-[65%]">
                      <div className="px-3 py-2 rounded-2xl text-[13px]"
                        style={{
                          background: isMe ? 'rgb(var(--blue))' : 'rgb(var(--s2))',
                          color: isMe ? '#fff' : 'rgb(var(--ink))',
                          borderBottomRightRadius: isMe ? 4 : undefined,
                          borderBottomLeftRadius: !isMe ? 4 : undefined,
                        }}>
                        {msg.body}
                      </div>
                      <p className={`text-[10px] mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}
                        style={{ color: 'rgb(var(--ink3))' }}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-end gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderTop: '1px solid rgb(var(--bd))', background: 'rgb(var(--s0))' }}>
              <textarea
                rows={1}
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-[13px] px-4 py-2.5 rounded-xl outline-none resize-none"
                style={{
                  background: 'rgb(var(--s2))',
                  border: '1px solid rgb(var(--bd))',
                  color: 'rgb(var(--ink))',
                  maxHeight: 120,
                }}
              />
              <button onClick={sendMessage} disabled={!input.trim()}
                className="btn-primary p-2.5 rounded-xl flex-shrink-0 disabled:opacity-40">
                <Icon name="send" size={16} />
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-[12px] flex items-center gap-2"
            style={{ background: 'rgb(var(--s2))', color: 'rgb(var(--err))', border: '1px solid rgb(var(--bd))' }}>
            <Icon name="alert-circle" size={13} />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
