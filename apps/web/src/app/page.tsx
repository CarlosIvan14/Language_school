import Link from 'next/link'

const features = [
  {
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    title: 'Clases en vivo',
    desc: 'Sesiones interactivas con profesores nativos via Zoom. Grabaciones disponibles 24/7.',
  },
  {
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    title: 'Certificados DELE',
    desc: 'Obtén tu certificado oficial al completar cada nivel. Verificación con código QR.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    title: 'Tareas y exámenes',
    desc: 'Sistema completo de evaluación con retroalimentación personalizada de tu profesor.',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Progreso gamificado',
    desc: 'Gana puntos, desbloquea badges y sube en el ranking de tu grupo. Aprender nunca fue tan adictivo.',
  },
  {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Chat con profesores',
    desc: 'Comunicación directa con tu profesor y compañeros de clase en tiempo real.',
  },
  {
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    title: 'Pagos simples',
    desc: 'Paga mensualidades de forma segura. Historial de pagos y facturas disponibles siempre.',
  },
]

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function FeatureIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      {d.split(' M').map((p, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? p : 'M' + p} />
      ))}
    </svg>
  )
}

export default function HomePage() {
  return (
    <div style={{ background: 'rgb(var(--bg))', minHeight: '100dvh', overflowX: 'hidden' }}>

      {/* ── Animated background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Orb 1 — top left blue */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.13) 0%, transparent 65%)',
          animation: 'orb1 18s ease-in-out infinite',
        }} />
        {/* Orb 2 — bottom right teal */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)',
          animation: 'orb2 22s ease-in-out infinite',
        }} />
        {/* Orb 3 — center gold accent */}
        <div style={{
          position: 'absolute', top: '40%', left: '35%',
          width: '30vw', height: '30vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 60%)',
          animation: 'orb3 28s ease-in-out infinite',
        }} />

        {/* Horizontal grid lines — subtle */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(79,142,247,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(4vw, 6vh) scale(1.08); }
          66%       { transform: translate(-3vw, 3vh) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-5vw, -4vh) scale(1.1); }
          70%       { transform: translate(3vw, 5vh) scale(0.92); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          50%       { transform: translate(-8vw, -6vh) scale(1.15); opacity: 0.6; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes slide-hero {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .hero-1 { animation: slide-hero 0.7s cubic-bezier(0.32,0.72,0,1) 0.1s both; }
        .hero-2 { animation: slide-hero 0.7s cubic-bezier(0.32,0.72,0,1) 0.22s both; }
        .hero-3 { animation: slide-hero 0.7s cubic-bezier(0.32,0.72,0,1) 0.34s both; }
        .hero-4 { animation: slide-hero 0.7s cubic-bezier(0.32,0.72,0,1) 0.46s both; }
        .feat-card { transition: all 500ms cubic-bezier(0.32,0.72,0,1); }
        .feat-card:hover { transform: translateY(-4px); }
        .btn-hero {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.5rem; border-radius: 9999px;
          font-size: 0.875rem; font-weight: 600;
          transition: all 600ms cubic-bezier(0.32,0.72,0,1);
        }
        .btn-hero:active { transform: scale(0.97); }
      `}</style>

      {/* ── Floating pill nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.75rem 1.5rem' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 0.75rem 0.5rem 1rem',
          background: 'rgba(9,13,24,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '9999px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgb(var(--blue))', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff',
            }}>E</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--ink))', letterSpacing: '-0.01em' }}>
              EspañolPro
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link href="/courses" style={{
              padding: '0.375rem 0.875rem', borderRadius: '9999px',
              fontSize: '13px', color: 'rgb(var(--ink2))',
              transition: 'color 200ms',
              textDecoration: 'none',
            }}
              onMouseEnter={undefined}>
              Cursos
            </Link>
            <Link href="/login" style={{
              padding: '0.375rem 0.875rem', borderRadius: '9999px',
              fontSize: '13px', color: 'rgb(var(--ink2))',
              transition: 'color 200ms',
              textDecoration: 'none',
            }}>
              Iniciar sesión
            </Link>
            <Link href="/register" style={{
              padding: '0.4rem 1rem', borderRadius: '9999px',
              background: 'rgb(var(--blue))', color: '#fff',
              fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 300ms',
            }}>
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: '820px', margin: '0 auto',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        {/* Eyebrow badge */}
        <div className="hero-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 0.875rem', borderRadius: '9999px', marginBottom: '1.75rem',
          border: '1px solid rgba(79,142,247,0.25)',
          background: 'rgba(79,142,247,0.08)',
          animation: 'float-badge 3s ease-in-out infinite',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgb(var(--blue))', display: 'inline-block', boxShadow: '0 0 8px rgba(79,142,247,0.6)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(var(--blue))', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Plataforma certificada DELE
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-2" style={{
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700,
          lineHeight: 1.1, letterSpacing: '-0.03em',
          color: 'rgb(var(--ink))', marginBottom: '1.25rem',
          textWrap: 'balance',
        }}>
          Domina el español con una plataforma{' '}
          <span style={{
            background: 'linear-gradient(135deg, rgb(var(--blue)) 0%, rgb(var(--ok)) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            que trabaja contigo
          </span>
        </h1>

        {/* Sub */}
        <p className="hero-3" style={{
          fontSize: '1.0625rem', lineHeight: 1.65,
          color: 'rgb(var(--ink2))', maxWidth: '560px', margin: '0 auto 2.25rem',
        }}>
          Clases en vivo, materiales, tareas, certificados y seguimiento de progreso — todo en un solo lugar. Desde A1 hasta C2.
        </p>

        {/* CTAs */}
        <div className="hero-4" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn-hero" style={{
            background: 'rgb(var(--blue))', color: '#fff',
            boxShadow: '0 0 24px rgba(79,142,247,0.25)',
          }}>
            Empezar gratis
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link href="/courses" className="btn-hero" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgb(var(--ink))',
          }}>
            Ver cursos disponibles
          </Link>
        </div>

        {/* Avatars + social proof */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}
          className="hero-4">
          <div style={{ display: 'flex' }}>
            {['#4F8EF7','#34D399','#F59E0B','#F87171','#A78BFA'].map((c, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: `${c}30`, border: `2px solid ${c}`,
                marginLeft: i > 0 ? '-8px' : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: c, fontWeight: 700,
              }}>{['M','S','A','R','J'][i]}</div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>
            <span style={{ color: 'rgb(var(--ink))', fontWeight: 600 }}>+1,240</span> estudiantes activos
          </p>
        </div>
      </section>

      {/* ── Level pills marquee ── */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', padding: '1.5rem 0', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex', gap: '0.75rem', width: 'max-content',
          animation: 'marquee 18s linear infinite',
        }}>
          {[...levels, ...levels, ...levels, ...levels].map((l, i) => (
            <div key={i} style={{
              padding: '0.375rem 1.25rem', borderRadius: '9999px',
              border: '1px solid rgba(79,142,247,0.18)',
              background: 'rgba(79,142,247,0.05)',
              fontSize: '12px', fontWeight: 600, color: 'rgb(var(--blue))',
              letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}>{l}</div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { val: '1,240+', lbl: 'Estudiantes activos' },
            { val: '48',     lbl: 'Profesores certificados' },
            { val: 'A1–C2', lbl: 'Todos los niveles' },
            { val: '98%',   lbl: 'Tasa de satisfacción' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgb(var(--s1))', padding: '2rem 1.5rem', textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono"), monospace',
                fontSize: '2rem', fontWeight: 500, color: 'rgb(var(--blue))',
                letterSpacing: '-0.02em', marginBottom: '0.375rem',
              }}>{s.val}</p>
              <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block', padding: '0.25rem 0.875rem', borderRadius: '9999px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            background: 'rgba(52,211,153,0.08)', color: 'rgb(var(--ok))',
            border: '1px solid rgba(52,211,153,0.2)', marginBottom: '1rem',
          }}>Todo incluido</div>
          <h2 style={{
            fontSize: 'clamp(1.625rem, 3vw, 2.25rem)', fontWeight: 700,
            color: 'rgb(var(--ink))', letterSpacing: '-0.025em',
            lineHeight: 1.2, textWrap: 'balance',
          }}>
            Cada herramienta que necesitas,<br />en un solo lugar
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {features.map((f, i) => (
            <div key={i} className="feat-card bezel">
              <div className="bezel-inner" style={{ padding: '1.5rem' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgb(var(--blue))', marginBottom: '1rem',
                }}>
                  <FeatureIcon d={f.icon} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--ink))', marginBottom: '0.5rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'rgb(var(--ink2))' }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div className="bezel">
          <div className="bezel-inner" style={{
            padding: 'clamp(2.5rem, 5vw, 4rem)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgb(var(--s1)) 0%, rgba(79,142,247,0.06) 100%)',
          }}>
            {/* Glowing dot */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 1.5rem',
              background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(79,142,247,0.2)',
            }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700,
              color: 'rgb(var(--ink))', letterSpacing: '-0.025em', marginBottom: '0.875rem',
              textWrap: 'balance',
            }}>
              Empieza tu camino al español hoy
            </h2>
            <p style={{ fontSize: '14px', color: 'rgb(var(--ink2))', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              Únete a más de 1,200 estudiantes. Prueba gratuita de 7 días, sin tarjeta de crédito.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-hero" style={{
                background: 'rgb(var(--blue))', color: '#fff',
                boxShadow: '0 0 28px rgba(79,142,247,0.3)',
              }}>
                Crear cuenta gratis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/login" className="btn-hero" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgb(var(--ink))',
              }}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'rgb(var(--blue))', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff',
          }}>E</div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--ink2))' }}>EspañolPro</span>
        </div>
        <p style={{ fontSize: '11px', color: 'rgb(var(--ink3))' }}>© 2026 EspañolPro · Plataforma de enseñanza de español</p>
      </footer>
    </div>
  )
}
