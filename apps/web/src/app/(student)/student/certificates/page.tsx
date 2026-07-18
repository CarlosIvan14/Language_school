// FILE: apps/web/src/app/(student)/student/certificates/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const LEVEL_GRAD: Record<string, string> = {
  A1: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)',
  A2: 'linear-gradient(135deg, #3b6fd4, #2f5ab0)',
  B1: 'linear-gradient(135deg, #34d399, #10b981)',
  B2: 'linear-gradient(135deg, #f5a623, #e08c10)',
  C1: 'linear-gradient(135deg, #fb923c, #ea6a15)',
  C2: 'linear-gradient(135deg, #f87171, #dc2626)',
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/certificates/me').then(setCerts).catch(() => setCerts([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-[900px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Certificados</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Tus logros y constancias de finalización</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="bezel"><div className="bezel-inner h-44 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div>)}</div>
      ) : !certs.length ? (
        <div className="bezel animate-fade-up"><div className="bezel-inner py-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: 'rgba(245,166,35,0.12)' }}>
            <Icon name="award" size={22} style={{ color: 'rgb(var(--gold))' }} />
          </div>
          <p className="text-[15px] font-medium mb-1" style={{ color: 'rgb(var(--ink))' }}>Sin certificados aún</p>
          <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Completa un curso para obtener tu primer certificado.</p>
        </div></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {certs.map((c: any) => (
            <div key={c.id} className="bezel animate-fade-up"><div className="bezel-inner overflow-hidden" style={{ padding: 0 }}>
              <div className="p-6 text-white" style={{ background: LEVEL_GRAD[c.course?.level] ?? LEVEL_GRAD.A1 }}>
                <p className="text-[11px] opacity-80 mb-1">Certificado de finalización</p>
                <h3 className="text-[17px] font-semibold">{c.course?.title}</h3>
                <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>Nivel {c.course?.level}</span>
              </div>
              <div className="p-4">
                <p className="text-[11px] mb-3" style={{ color: 'rgb(var(--ink2))' }}>
                  Emitido el {new Date(c.issuedAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <a href={`/api/v1/certificates/verify/${c.validationHash}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center text-[12px] py-2 rounded-lg" style={{ background: 'rgb(var(--s2))', color: 'rgb(var(--ink))' }}>Verificar QR</a>
                  {c.pdfUrl && <a href={c.pdfUrl} download className="flex-1 text-center btn-primary py-2 text-[12px]" style={{ borderRadius: '0.5rem' }}>Descargar PDF</a>}
                </div>
              </div>
            </div></div>
          ))}
        </div>
      )}
    </div>
  )
}
