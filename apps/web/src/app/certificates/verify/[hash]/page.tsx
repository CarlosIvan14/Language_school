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
  } catch { error = true }

  const ok = !(error || !result)

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'rgb(5,7,14)' }}>
      <div className="absolute pointer-events-none" style={{ top: '20%', left: '50%', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(79,142,247,0.06) 0%, transparent 65%)', transform: 'translateX(-50%)' }} />
      <div className="w-full max-w-[380px] relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white" style={{ background: 'rgb(var(--blue))' }}>E</div>
            <span className="text-[14px] font-semibold" style={{ color: 'rgb(var(--ink))' }}>EspañolPro</span>
          </Link>
        </div>

        <div className="bezel"><div className="bezel-inner p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
            style={{ background: ok ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={ok ? 'rgb(52,211,153)' : 'rgb(248,113,113)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {ok ? <><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></> : <><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></>}
            </svg>
          </div>

          {!ok ? (
            <>
              <h1 className="text-[17px] font-semibold mb-2" style={{ color: 'rgb(var(--ink))' }}>Certificado inválido</h1>
              <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>Este certificado no existe o el código es incorrecto.</p>
            </>
          ) : (
            <>
              <h1 className="text-[17px] font-semibold mb-1" style={{ color: 'rgb(var(--ink))' }}>Certificado válido</h1>
              <p className="text-[13px] mb-4" style={{ color: 'rgb(var(--ink2))' }}>Este es un certificado oficial de EspañolPro.</p>
              <div className="rounded-lg p-4 text-left space-y-2" style={{ background: 'rgb(var(--s2))' }}>
                {[
                  ['Estudiante', result!.studentName],
                  ['Curso', result!.courseTitle],
                  ['Nivel', result!.level],
                  ['Emitido', new Date(result!.issuedAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[12px]">
                    <span style={{ color: 'rgb(var(--ink2))' }}>{k}</span>
                    <span className="font-medium" style={{ color: 'rgb(var(--ink))' }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <Link href="/courses" className="mt-4 inline-block text-[12px]" style={{ color: 'rgb(var(--blue))' }}>Ver cursos disponibles →</Link>
        </div></div>
      </div>
    </div>
  )
}
