import Link from 'next/link'

interface VerifyResult {
  valid: boolean
  studentName: string
  courseTitle: string
  level: string
  issuedAt: string
}

export default async function VerifyCertificatePage({ params }: { params: { hash: string } }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
  let result: VerifyResult | null = null
  let error = false

  try {
    const res = await fetch(`${API_URL}/certificates/verify/${params.hash}`, { cache: 'no-store' })
    if (res.ok) result = await res.json()
    else error = true
  } catch {
    error = true
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">E</div>
            <span className="font-heading font-medium text-foreground">EspañolPro</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
          {error || !result ? (
            <>
              <div className="text-4xl mb-3">❌</div>
              <h1 className="font-heading text-lg font-medium text-foreground mb-2">Certificado inválido</h1>
              <p className="text-sm text-muted-foreground">Este certificado no existe o el código es incorrecto.</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">✅</div>
              <h1 className="font-heading text-lg font-medium text-foreground mb-1">Certificado válido</h1>
              <p className="text-sm text-muted-foreground mb-4">Este es un certificado oficial de EspañolPro.</p>
              <div className="bg-secondary rounded-lg p-4 text-left space-y-2 text-sm">
                {[
                  ['Estudiante', result.studentName],
                  ['Curso', result.courseTitle],
                  ['Nivel', result.level],
                  ['Emitido', new Date(result.issuedAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <Link href="/courses" className="mt-4 inline-block text-xs text-primary hover:underline">Ver cursos disponibles →</Link>
        </div>
      </div>
    </div>
  )
}
