'use client'

import { useEffect, useRef, useState } from 'react'
import { api, auth } from '@/lib/api'

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const currentUser = auth.getUser()

  useEffect(() => {
    api.get<any[]>('/chat/conversations').then(setConversations).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) return
    api.get<any[]>(`/chat/messages?withUser=${selected.with.id}`).then(msgs => {
      setMessages(msgs)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }).catch(() => {})
  }, [selected])

  async function sendMessage() {
    if (!text.trim() || !selected || sending) return
    setSending(true)
    try {
      const msg = await api.post<any>('/chat/send', { recipientId: selected.with.id, body: text.trim() })
      setMessages(m => [...m, msg])
      setText('')
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-heading text-sm font-medium text-foreground">Mensajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!conversations.length ? (
            <p className="text-xs text-muted-foreground p-4">Sin conversaciones.</p>
          ) : (
            conversations.map(conv => (
              <button key={conv.with.id} onClick={() => setSelected(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left ${selected?.with.id === conv.with.id ? 'bg-secondary' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                  {conv.with.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{conv.with.fullName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{conv.lastMessage.body}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {selected.with.fullName?.charAt(0)}
              </div>
              <p className="text-sm font-medium text-foreground">{selected.with.fullName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const isMe = m.senderId === currentUser?.id
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm'}`}>
                      {m.body}
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(m.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border p-3 flex gap-2">
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Escribe un mensaje..." autoFocus
                className="flex-1 border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={sendMessage} disabled={!text.trim() || sending}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending ? '...' : 'Enviar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
