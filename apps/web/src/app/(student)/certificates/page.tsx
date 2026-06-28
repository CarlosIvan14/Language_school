'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'from-blue-500 to-blue-600', A2: 'from-blue-600 to-blue-700',
  B1: 'from-green-500 to-green-600', B2: 'from-amber-500 to-amber-600',
  C1: 'from-orange-500 to-orange-600', C2: 'from-red-500 to-red-600',
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/certificates/me')
      .then(setCerts)
      .catch(() => setCerts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Certificados</h1>
        <p className="text-sm text-muted-foreground mt-1">Tus logros y constancias de finalización</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-48 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : !certs.length ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎓</p>
          <p className="font-heading text-lg text-foreground mb-1">Sin certificados aún</p>
          <p className="text-sm text-muted-foreground">Completa un curso para obtener tu primer certificado.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map((c: any) => (
            <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${LEVEL_COLORS[c.course?.level] ?? 'from-primary to-primary/80'} p-6 text-white`}>
                <p className="text-xs opacity-80 mb-1">Certificado de finalización</p>
                <h3 className="font-heading text-lg font-medium">{c.course?.title}</h3>
                <span className="inline-block mt-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  Nivel {c.course?.level}
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Emitido el {new Date(c.issuedAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <a href={`/api/v1/certificates/verify/${c.validationHash}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center text-xs border border-border text-muted-foreground py-2 rounded-md hover:bg-secondary transition-colors">
                    Verificar QR
                  </a>
                  {c.pdfUrl && (
                    <a href={c.pdfUrl} download
                      className="flex-1 text-center text-xs bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity">
                      Descargar PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
