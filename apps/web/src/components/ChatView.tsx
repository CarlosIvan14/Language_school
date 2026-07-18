'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { api, auth } from '@/lib/api'
import { Icon } from '@/components/Icon'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '')

interface ChatUser { id: string; fullName: string; avatarUrl?: string; role?: string }
interface Conversation { with: ChatUser; lastMessage: { body: string; createdAt: string }; unread?: number }
interface Message { id: string; senderId: string; body: string; createdAt: string; readAt?: string | null; attachmentUrl?: string | null; attachmentType?: string | null; sender: { fullName: string; avatarUrl?: string } }

function fileUrl(u?: string | null) { return !u ? '' : u.startsWith('http') ? u : `${API_ORIGIN}${u}` }

// Delivered = single check; Read = double check (blue)
function Ticks({ read }: { read: boolean }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M1 5.5L4 8.5L9.5 2.5" stroke={read ? '#8ec5ff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 8.2L7 8.5L12.5 2.5" stroke={read ? '#8ec5ff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
}
function formatTime(iso: string) {
  const d = new Date(iso)
  const isToday = d.toDateString() === new Date().toDateString()
  return isToday ? d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}
function roleLabel(r?: string) {
  return r === 'admin' ? 'Manager' : r === 'teacher' ? 'Profesor' : r === 'student' ? 'Estudiante' : ''
}
function avatarUrl(u?: string) {
  return u ? (u.startsWith('http') ? u : `${API_ORIGIN}${u}`) : null
}

function Avatar({ user, size = 36 }: { user: ChatUser; size?: number }) {
  const src = avatarUrl(user.avatarUrl)
  return (
    <div className="rounded-full flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size, fontSize: size * 0.33, background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : initials(user.fullName)}
    </div>
  )
}

export function ChatView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [contacts, setContacts] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<ChatUser | null>(null)
  const [input, setInput] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [showContacts, setShowContacts] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const socketRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<ChatUser | null>(null)
  const me = auth.getUser()

  useEffect(() => { selectedRef.current = selected }, [selected])

  useEffect(() => {
    api.get<Conversation[]>('/chat/conversations').then(setConversations).catch(() => {}).finally(() => setLoadingConvs(false))
    api.get<ChatUser[]>('/chat/contacts').then(setContacts).catch(() => {})
  }, [])

  // Socket
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return
    let io: any
    import('socket.io-client').then(({ io: ioFn }) => {
      // Connect to the '/chat' namespace (the gateway lives there, not the default '/')
      io = ioFn(`${API_ORIGIN}/chat`, { path: '/socket.io', auth: { token }, transports: ['websocket'] })
      io.on('message', (msg: Message & { recipientId?: string }) => {
        const sel = selectedRef.current
        const iAmSender = msg.senderId === me?.id
        // The other party in this message relative to me
        const other: ChatUser = iAmSender
          ? (sel ?? { id: (msg as any).recipientId, fullName: '' })
          : { id: msg.senderId, fullName: msg.sender?.fullName ?? '', avatarUrl: msg.sender?.avatarUrl }

        // Append to the open thread if it belongs to the selected conversation
        if (sel && other.id === sel.id) {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
          // If it's an incoming message in the open chat, mark it read immediately
          if (!iAmSender) io.emit('mark_read', { fromUser: sel.id })
        }

        // Update / insert the conversation in the sidebar (+ bump unread if not open)
        const isOpen = sel && other.id === sel.id
        const bump = !iAmSender && !isOpen ? 1 : 0
        setConversations(prev => {
          if (!other.id) return prev
          const exists = prev.find(c => c.with.id === other.id)
          const lastMessage = { body: msg.body || (msg.attachmentType === 'image' ? 'Imagen' : 'Archivo'), createdAt: msg.createdAt }
          if (exists) return prev.map(c => c.with.id === other.id ? { ...c, lastMessage, unread: (c.unread ?? 0) + bump } : c)
          return [{ with: other, lastMessage, unread: bump }, ...prev]
        })
      })

      // The other party read my messages → flip my ticks to "read"
      io.on('read', ({ by }: { by: string }) => {
        const sel = selectedRef.current
        if (sel && sel.id === by) {
          setMessages(prev => prev.map(m => m.senderId === me?.id ? { ...m, readAt: m.readAt ?? new Date().toISOString() } : m))
        }
      })

      socketRef.current = io
    }).catch(() => {})
    return () => { if (socketRef.current) socketRef.current.disconnect() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMessages = useCallback(async (user: ChatUser) => {
    setMessages([])
    try { setMessages(await api.get<Message[]>(`/chat/messages?withUser=${user.id}`)) } catch {}
    // Mark this person's messages as read + clear its unread badge
    if (socketRef.current) socketRef.current.emit('mark_read', { fromUser: user.id })
    setConversations(prev => prev.map(c => c.with.id === user.id ? { ...c, unread: 0 } : c))
    window.dispatchEvent(new Event('chat:read')) // let the sidebar badge refresh
  }, [])

  useEffect(() => { if (selected) loadMessages(selected) }, [selected, loadMessages])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function openContact(u: ChatUser) {
    setSelected(u)
    setShowContacts(false)
    setContactSearch('')
  }

  function sendMessage(attachment?: { url: string; type: string }) {
    if ((!input.trim() && !attachment) || !selected || !socketRef.current) return
    const body = input.trim()
    setInput('')
    socketRef.current.emit('send_message', {
      recipientId: selected.id, body,
      attachmentUrl: attachment?.url, attachmentType: attachment?.type,
    })
  }

  async function onAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selected) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_URL}/chat/upload`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd })
      if (!res.ok) throw new Error()
      const data = await res.json()
      sendMessage({ url: data.url, type: data.type })
    } catch {} finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const filteredContacts = contacts.filter(c => c.fullName.toLowerCase().includes(contactSearch.trim().toLowerCase()))

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Left panel */}
      <div className="w-[280px] flex-shrink-0 flex flex-col" style={{ background: 'rgb(var(--s0))', borderRight: '1px solid rgb(var(--bd))' }}>
        <div className="px-4 py-3.5 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid rgb(var(--bd))' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>
            {showContacts ? 'Nuevo chat' : 'Mensajes'}
          </h2>
          <button onClick={() => setShowContacts(s => !s)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: showContacts ? 'rgba(79,142,247,0.15)' : 'rgb(var(--s2))', color: showContacts ? 'rgb(var(--blue))' : 'rgb(var(--ink2))' }}
            title={showContacts ? 'Ver conversaciones' : 'Nuevo chat'}>
            <Icon name={showContacts ? 'message' : 'plus'} size={15} />
          </button>
        </div>

        {showContacts ? (
          <>
            <div className="p-3 flex-shrink-0">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--ink3))' }}><Icon name="search" size={13} /></span>
                <input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Buscar contacto..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-[12px] outline-none"
                  style={{ background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <p className="text-[12px] text-center py-8 px-4" style={{ color: 'rgb(var(--ink3))' }}>Sin contactos disponibles</p>
              ) : filteredContacts.map(c => (
                <button key={c.id} onClick={() => openContact(c)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <Avatar user={c} size={34} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{c.fullName}</p>
                    <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>{roleLabel(c.role)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
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
              <div className="text-center py-8 px-4">
                <p className="text-[12px]" style={{ color: 'rgb(var(--ink3))' }}>Sin conversaciones aún</p>
                <button onClick={() => setShowContacts(true)} className="text-[12px] mt-2" style={{ color: 'rgb(var(--blue))' }}>Iniciar un chat →</button>
              </div>
            ) : conversations.map(conv => (
              <button key={conv.with.id} onClick={() => setSelected(conv.with)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: selected?.id === conv.with.id ? 'rgba(79,142,247,0.08)' : 'transparent',
                  borderLeft: selected?.id === conv.with.id ? '2px solid rgb(var(--blue))' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (selected?.id !== conv.with.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if (selected?.id !== conv.with.id) e.currentTarget.style.background = 'transparent' }}>
                <Avatar user={conv.with} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[12px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{conv.with.fullName}</p>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'rgb(var(--ink3))' }}>{formatTime(conv.lastMessage.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] truncate mt-0.5" style={{ color: (conv.unread ?? 0) > 0 ? 'rgb(var(--ink))' : 'rgb(var(--ink2))' }}>{conv.lastMessage.body || 'Archivo adjunto'}</p>
                    {(conv.unread ?? 0) > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'rgb(var(--blue))', color: '#fff' }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <div style={{ color: 'rgb(var(--ink3))' }}><Icon name="message" size={36} /></div>
            <p className="text-[13px]" style={{ color: 'rgb(var(--ink3))' }}>Selecciona o inicia una conversación</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgb(var(--bd))', background: 'rgb(var(--s0))' }}>
              <Avatar user={selected} size={32} />
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{selected.fullName}</p>
                {selected.role && <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>{roleLabel(selected.role)}</p>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === me?.id
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>{initials(msg.sender.fullName)}</div>}
                    <div className="max-w-[65%]">
                      <div className="px-3 py-2 rounded-2xl text-[13px]"
                        style={{ background: isMe ? 'rgb(var(--blue))' : 'rgb(var(--s2))', color: isMe ? '#fff' : 'rgb(var(--ink))', borderBottomRightRadius: isMe ? 4 : undefined, borderBottomLeftRadius: !isMe ? 4 : undefined }}>
                        {msg.attachmentUrl && msg.attachmentType === 'image' && (
                          <a href={fileUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer">
                            <img src={fileUrl(msg.attachmentUrl)} alt="" className="rounded-lg mb-1 max-h-56 object-cover" style={{ maxWidth: '100%' }} />
                          </a>
                        )}
                        {msg.attachmentUrl && msg.attachmentType !== 'image' && (
                          <a href={fileUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-1 underline" style={{ color: isMe ? '#fff' : 'rgb(var(--blue))' }}>
                            <Icon name="file-text" size={15} /> Ver archivo (PDF)
                          </a>
                        )}
                        {msg.body}
                      </div>
                      <p className={`text-[10px] mt-1 px-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`} style={{ color: 'rgb(var(--ink3))' }}>
                        {formatTime(msg.createdAt)}
                        {isMe && !String(msg.id).startsWith('temp-') && <Ticks read={!!msg.readAt} />}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-end gap-2 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgb(var(--bd))', background: 'rgb(var(--s0))' }}>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={onAttach} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Adjuntar imagen o PDF"
                className="p-2.5 rounded-xl flex-shrink-0 transition-colors disabled:opacity-40"
                style={{ background: 'rgb(var(--s2))', color: 'rgb(var(--ink2))' }}>
                <Icon name={uploading ? 'clock' : 'plus'} size={16} />
              </button>
              <textarea rows={1} placeholder="Escribe un mensaje..." value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                className="flex-1 text-[13px] px-4 py-2.5 rounded-xl outline-none resize-none"
                style={{ background: 'rgb(var(--s2))', border: '1px solid rgb(var(--bd))', color: 'rgb(var(--ink))', maxHeight: 120 }} />
              <button onClick={() => sendMessage()} disabled={!input.trim()} className="btn-primary p-2.5 rounded-xl flex-shrink-0 disabled:opacity-40">
                <Icon name="send" size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
