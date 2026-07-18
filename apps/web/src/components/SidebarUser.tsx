'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, auth } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '')

interface Props { profileHref: string; roleLabel: string; fallback: string }

export function SidebarUser({ profileHref, roleLabel, fallback }: Props) {
  const router = useRouter()
  const [me, setMe] = useState<{ fullName?: string; avatarUrl?: string } | null>(null)

  useEffect(() => {
    // seed instantly from localStorage, then refresh with the photo from the API
    const cached = auth.getUser()
    if (cached) setMe({ fullName: cached.fullName })
    if (auth.isLoggedIn()) api.get<any>('/auth/me').then(m => setMe({ fullName: m.fullName, avatarUrl: m.avatarUrl })).catch(() => {})
  }, [])

  const initials = (me?.fullName ?? '').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || fallback[0]
  const src = me?.avatarUrl ? (me.avatarUrl.startsWith('http') ? me.avatarUrl : `${API_ORIGIN}${me.avatarUrl}`) : null

  async function handleLogout() {
    try { await auth.logout() } catch {}
    auth.clearTokens()
    router.push('/login')
  }

  return (
    <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Link href={profileHref} className="flex items-center gap-2.5 rounded-lg p-1 transition-colors"
        style={{ color: 'inherit', textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 overflow-hidden"
          style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
          {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{me?.fullName ?? fallback}</p>
          <p className="text-[10px]" style={{ color: 'rgb(var(--ink2))' }}>{roleLabel}</p>
        </div>
      </Link>
      <button onClick={handleLogout} className="mt-2 text-[11px] transition-colors" style={{ color: 'rgb(var(--ink2))' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgb(var(--err))')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgb(var(--ink2))')}>
        Cerrar sesión
      </button>
    </div>
  )
}
