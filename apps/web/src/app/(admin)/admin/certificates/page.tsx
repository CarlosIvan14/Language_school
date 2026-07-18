// FILE: apps/web/src/app/(admin)/admin/certificates/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [form, setForm] = useState({ studentId: '', courseId: '' })
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.get<any[]>('/certificates/me').catch(() => [] as any[])
      .then((c: any) => setCerts(Array.isArray(c) ? c : [])).finally(() => setLoading(false))
  }, [])

  async function issueCert() {
    if (!form.studentId || !form.courseId) return
    setIssuing(true)
    try {
      await api.post('/certificates/issue', form)
      setMsg({ text: 'Certificado emitido exitosamente', ok: true })
      setForm({ studentId: '', courseId: '' })
    } catch (e: any) {
      setMsg({ text: e.message ?? 'Error al emitir', ok: false })
    } finally { setIssuing(false) }
  }

  return (
    <div className="p-6 max-w-[900px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Certificados</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Emisión y gestión de certificados</p>
      </div>

      <div className="bezel mb-4 animate-fade-up" style={{ animationDelay: '40ms' }}><div className="bezel-inner p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Emitir certificado</p>
        <div className="grid grid-cols-3 gap-3">
          <input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} placeholder="ID del estudiante"
            className="px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
          <input value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} placeholder="ID del curso"
            className="px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
          <button onClick={issueCert} disabled={issuing || !form.studentId || !form.courseId} className="btn-primary py-2 disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>
            {issuing ? 'Emitiendo...' : 'Emitir'}
          </button>
        </div>
        {msg && <p className="text-[12px] mt-2 flex items-center gap-1.5" style={{ color: msg.ok ? 'rgb(var(--ok))' : 'rgb(var(--err))' }}>
          <Icon name={msg.ok ? 'check-circle' : 'alert-circle'} size={13} /> {msg.text}
        </p>}
      </div></div>

      <div className="bezel animate-fade-up" style={{ animationDelay: '80ms' }}><div className="bezel-inner">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
          <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>Últimos certificados emitidos</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'rgb(var(--s2))' }} />)}</div>
        ) : !certs.length ? (
          <p className="text-[13px] p-6 text-center" style={{ color: 'rgb(var(--ink2))' }}>Sin certificados aún</p>
        ) : (
          <div>
            {certs.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,166,35,0.12)' }}>
                  <Icon name="award" size={15} style={{ color: 'rgb(var(--gold))' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate" style={{ color: 'rgb(var(--ink))' }}>{c.student?.user?.fullName ?? 'Estudiante'}</p>
                  <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{c.course?.title} · Nivel {c.course?.level}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{new Date(c.issuedAt).toLocaleDateString('es')}</p>
                  <a href={`/certificates/verify/${c.validationHash}`} target="_blank" rel="noopener noreferrer" className="text-[11px]" style={{ color: 'rgb(var(--blue))' }}>Verificar</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div></div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }
