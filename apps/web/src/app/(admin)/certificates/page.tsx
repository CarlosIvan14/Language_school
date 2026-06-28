'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [form, setForm] = useState({ studentId: '', courseId: '' })
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.get<any[]>('/certificates/me').catch(() => [] as any[])
      .then((c: any) => setCerts(Array.isArray(c) ? c : []))
      .finally(() => setLoading(false))
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Certificados</h1>
        <p className="text-sm text-muted-foreground">Emisión y gestión de certificados</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-heading text-sm font-medium mb-3">Emitir certificado</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">ID del estudiante</label>
            <input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
              placeholder="student_id..."
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">ID del curso</label>
            <input value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
              placeholder="course_id..."
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex items-end">
            <button onClick={issueCert} disabled={issuing || !form.studentId || !form.courseId}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {issuing ? 'Emitiendo...' : 'Emitir'}
            </button>
          </div>
        </div>
        {msg && (
          <p className={`text-xs mt-2 ${msg.ok ? 'text-green-600' : 'text-destructive'}`}>{msg.text}</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">Últimos certificados emitidos</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-secondary rounded animate-pulse" />)}</div>
        ) : !certs.length ? (
          <p className="text-sm text-muted-foreground p-4 text-center">Sin certificados aún.</p>
        ) : (
          <div className="divide-y divide-border">
            {certs.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{c.student?.user?.fullName ?? 'Estudiante'}</p>
                  <p className="text-xs text-muted-foreground">{c.course?.title} · Nivel {c.course?.level}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString('es')}</p>
                  <a href={`/certificates/verify/${c.validationHash}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">Verificar</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
