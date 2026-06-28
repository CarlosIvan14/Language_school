import Link from 'next/link'

const features = [
  {
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    title: 'Clases en vivo',
    desc: 'Sesiones interactivas con profesores nativos vía Zoom. Grabaciones disponibles 24/7.',
    accent: '79,142,247',
  },
  {
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    title: 'Certificados oficiales',
    desc: 'Obtén tu certificado al completar cada nivel. Verificación con código QR único.',
    accent: '52,211,153',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    title: 'Tareas y exámenes',
    desc: 'Sistema completo de evaluación con retroalimentación personalizada.',
    accent: '245,166,35',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Progreso gamificado',
    desc: 'Gana puntos, desbloquea badges y compite en el ranking de tu grupo.',
    accent: '167,139,250',
  },
  {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Chat con profesores',
    desc: 'Comunicación directa con tu profesor y compañeros en tiempo real.',
    accent: '79,142,247',
  },
  {
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    title: 'Pagos simples',
    desc: 'Mensualidades seguras con historial de pagos y facturas siempre disponibles.',
    accent: '52,211,153',
  },
]

function FeatIcon({ d, accent }: { d: string; accent: string }) {
  return (
    <svg style={{ width: '18px', height: '18px', color: `rgb(${accent})` }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      {d.split(' M').map((p, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? p : 'M' + p} />
      ))}
    </svg>
  )
}

export default function HomePage() {
  return (
    <div style={{ background: 'rgb(var(--bg))', minHeight: '100dvh', overflowX: 'hidden' }}>

      {/* ─── CSS animations ─── */}
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes orb-drift-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(5vw,8vh) scale(1.1); }
          66%      { transform: translate(-4vw,2vh) scale(0.93); }
        }
        @keyframes orb-drift-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-6vw,-5vh) scale(1.12); }
          70%      { transform: translate(4vw,6vh) scale(0.9); }
        }
        @keyframes orb-drift-3 {
          0%,100% { transform: translate(0,0); opacity: 0.8; }
          50%      { transform: translate(-10vw,-8vh); opacity: 0.4; }
        }
        @keyframes spin-angle {
          to { --angle: 360deg; }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(79,142,247,0.35), 0 0 24px rgba(79,142,247,0.2); }
          50%      { box-shadow: 0 0 0 6px rgba(79,142,247,0), 0 0 36px rgba(79,142,247,0.35); }
        }
        @keyframes shimmer {
          from { transform: translateX(-120%) skewX(-15deg); }
          to   { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes badge-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes liquid-border {
          to { --angle: 360deg; }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .h1 { animation: hero-in 0.8s cubic-bezier(0.32,0.72,0,1) 0.05s both; }
        .h2 { animation: hero-in 0.8s cubic-bezier(0.32,0.72,0,1) 0.18s both; }
        .h3 { animation: hero-in 0.8s cubic-bezier(0.32,0.72,0,1) 0.30s both; }
        .h4 { animation: hero-in 0.8s cubic-bezier(0.32,0.72,0,1) 0.42s both; }
        .h5 { animation: hero-in 0.8s cubic-bezier(0.32,0.72,0,1) 0.54s both; }

        /* ── Liquid glass primary button ── */
        .btn-liquid {
          position: relative;
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.625rem;
          border-radius: 9999px;
          font-size: 0.875rem; font-weight: 600; color: #fff;
          background: rgba(79,142,247,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          overflow: hidden;
          cursor: pointer; text-decoration: none;
          animation: pulse-ring 2.8s ease-in-out infinite;
          transition: transform 600ms cubic-bezier(0.32,0.72,0,1),
                      background 400ms ease;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.15),
            0 0 0 0 rgba(79,142,247,0.35),
            0 0 24px rgba(79,142,247,0.2);
        }
        /* Spinning conic gradient ring */
        .btn-liquid::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          background: conic-gradient(from var(--angle),
            transparent 0deg,
            rgba(255,255,255,0.7) 40deg,
            rgba(79,142,247,1) 80deg,
            rgba(52,211,153,0.8) 140deg,
            transparent 180deg
          );
          animation: spin-angle 3s linear infinite;
          z-index: -1;
          opacity: 0;
          transition: opacity 300ms;
        }
        /* Shimmer sweep */
        .btn-liquid::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
          width: 40%;
          transform: translateX(-120%) skewX(-15deg);
          transition: none;
        }
        .btn-liquid:hover {
          transform: translateY(-2px) scale(1.02);
          background: rgba(79,142,247,0.95);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.15),
            0 0 0 0 rgba(79,142,247,0),
            0 0 48px rgba(79,142,247,0.4);
          animation: none;
        }
        .btn-liquid:hover::before { opacity: 1; }
        .btn-liquid:hover::after {
          animation: shimmer 0.65s cubic-bezier(0.32,0.72,0,1) forwards;
        }
        .btn-liquid:active { transform: scale(0.97); }

        /* ── Glass secondary button ── */
        .btn-glass-sec {
          position: relative;
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.625rem;
          border-radius: 9999px;
          font-size: 0.875rem; font-weight: 500;
          color: rgba(225,232,255,0.9);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          cursor: pointer; text-decoration: none;
          overflow: hidden;
          transition: all 500ms cubic-bezier(0.32,0.72,0,1);
        }
        .btn-glass-sec::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          width: 40%;
          transform: translateX(-120%) skewX(-15deg);
        }
        .btn-glass-sec:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.2);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.25);
        }
        .btn-glass-sec:hover::after {
          animation: shimmer 0.65s cubic-bezier(0.32,0.72,0,1) forwards;
        }
        .btn-glass-sec:active { transform: scale(0.97); }

        /* ── Feature card hover ── */
        .feat-card {
          transition: transform 500ms cubic-bezier(0.32,0.72,0,1),
                      box-shadow 500ms cubic-bezier(0.32,0.72,0,1);
          cursor: default;
        }
        .feat-card:hover {
          transform: translateY(-6px);
        }
        .feat-card:hover .bezel-inner {
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
        }

        /* Nav link hover */
        .nav-link {
          padding: 0.375rem 0.875rem; border-radius: 9999px;
          font-size: 13px; color: rgba(94,113,158,1);
          text-decoration: none;
          transition: color 200ms, background 200ms;
        }
        .nav-link:hover { color: rgba(225,232,255,0.9); background: rgba(255,255,255,0.05); }
      `}</style>

      {/* ─── Animated background ─── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-12%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.14) 0%, transparent 65%)', animation: 'orb-drift-1 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-12%', right: '-8%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 65%)', animation: 'orb-drift-2 25s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', left: '30%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%)', animation: 'orb-drift-3 32s ease-in-out infinite' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(94,113,158,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* ─── Floating pill nav ─── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.875rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem 0.5rem 1rem', background: 'rgba(9,13,24,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9999px', boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgb(var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', boxShadow: '0 0 12px rgba(79,142,247,0.4)' }}>E</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--ink))', letterSpacing: '-0.01em' }}>EspañolPro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link href="/courses" className="nav-link">Cursos</Link>
            <Link href="/login" className="nav-link">Iniciar sesión</Link>
            <Link href="/register" className="btn-liquid" style={{ padding: '0.4rem 1rem', fontSize: '13px', animation: 'none', boxShadow: '0 0 12px rgba(79,142,247,0.25)', borderRadius: '9999px' }}>
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '4.5rem 1.5rem 3.5rem', textAlign: 'center' }}>

        {/* Eyebrow */}
        <div className="h1" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 1rem', borderRadius: '9999px', marginBottom: '2rem', border: '1px solid rgba(79,142,247,0.2)', background: 'rgba(79,142,247,0.06)', backdropFilter: 'blur(8px)', animation: 'badge-float 3.5s ease-in-out infinite' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgb(79,142,247)', display: 'inline-block', boxShadow: '0 0 8px rgba(79,142,247,0.8)', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgb(79,142,247)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Aprende con profesores nativos
          </span>
        </div>

        {/* Headline */}
        <h1 className="h2" style={{ fontSize: 'clamp(2.25rem, 5.5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.035em', color: 'rgb(var(--ink))', marginBottom: '1.125rem' }}>
          Domina el español<br />
          con una plataforma{' '}
          <span style={{ background: 'linear-gradient(135deg, rgb(79,142,247) 0%, rgb(52,211,153) 55%, rgb(167,139,250) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            que trabaja contigo
          </span>
        </h1>

        {/* Sub */}
        <p className="h3" style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'rgb(var(--ink2))', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
          Clases en vivo, materiales, tareas, certificados y seguimiento de progreso — todo en un solo lugar. Desde A1 hasta C2.
        </p>

        {/* CTAs */}
        <div className="h4" style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/register" className="btn-liquid">
            Empezar gratis
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link href="/courses" className="btn-glass-sec">
            Ver cursos disponibles
          </Link>
        </div>

        {/* Social proof */}
        <div className="h5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2.25rem' }}>
          <div style={{ display: 'flex' }}>
            {['#4F8EF7','#34D399','#F59E0B','#F87171','#A78BFA'].map((c, i) => (
              <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${c}20`, border: `2px solid ${c}60`, marginLeft: i > 0 ? '-9px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: c, backdropFilter: 'blur(4px)', boxShadow: `0 0 8px ${c}30` }}>
                {['M','S','A','R','J'][i]}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'rgb(var(--ink2))' }}>
            <span style={{ color: 'rgb(var(--ink))', fontWeight: 600 }}>+1,240</span> estudiantes ya aprenden con nosotros
          </p>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          {[
            { val: '1,240+', lbl: 'Estudiantes activos',    col: '79,142,247' },
            { val: '48',     lbl: 'Profesores certificados', col: '52,211,153' },
            { val: 'A1–C2', lbl: 'Todos los niveles',       col: '245,166,35' },
            { val: '98%',   lbl: 'Tasa de satisfacción',    col: '167,139,250' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgb(var(--s1))', padding: '2.25rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%, rgba(${s.col},0.07) 0%, transparent 65%)`, pointerEvents: 'none' }} />
              <p style={{ fontFamily: 'var(--font-mono,"JetBrains Mono"),monospace', fontSize: '2.125rem', fontWeight: 600, color: `rgb(${s.col})`, letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>{s.val}</p>
              <p style={{ fontSize: '12px', color: 'rgb(var(--ink2))' }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-block', padding: '0.25rem 0.875rem', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(52,211,153,0.07)', color: 'rgb(52,211,153)', border: '1px solid rgba(52,211,153,0.18)', marginBottom: '1rem' }}>Todo incluido</div>
          <h2 style={{ fontSize: 'clamp(1.625rem,3vw,2.375rem)', fontWeight: 700, color: 'rgb(var(--ink))', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Cada herramienta que necesitas,<br />
            <span style={{ color: 'rgb(var(--ink2))' }}>en un solo lugar</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.875rem' }}>
          {features.map((f, i) => (
            <div key={i} className="feat-card bezel" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="bezel-inner" style={{ padding: '1.625rem', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle accent glow in corner */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, rgba(${f.accent},0.1) 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: `rgba(${f.accent},0.1)`, border: `1px solid rgba(${f.accent},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: `0 0 16px rgba(${f.accent},0.08)` }}>
                  <FeatIcon d={f.icon} accent={f.accent} />
                </div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgb(var(--ink))', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '12.5px', lineHeight: 1.65, color: 'rgb(var(--ink2))' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div className="bezel">
          <div className="bezel-inner" style={{ padding: 'clamp(2.5rem,5vw,4.5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Background orb inside card */}
            <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '80%', background: 'radial-gradient(ellipse, rgba(79,142,247,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1.5rem', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(79,142,247,0.15), inset 0 1px 0 rgba(255,255,255,0.1)', fontSize: '22px' }}>🎯</div>

            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.125rem)', fontWeight: 700, color: 'rgb(var(--ink))', letterSpacing: '-0.025em', marginBottom: '0.875rem', lineHeight: 1.2 }}>
              Empieza tu camino al español hoy
            </h2>
            <p style={{ fontSize: '14px', color: 'rgb(var(--ink2))', maxWidth: '400px', margin: '0 auto 2.25rem', lineHeight: 1.75 }}>
              Únete a más de 1,200 estudiantes. Prueba gratuita de 7 días, sin tarjeta de crédito.
            </p>

            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-liquid">
                Crear cuenta gratis
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/login" className="btn-glass-sec">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgb(var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>E</div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgb(var(--ink2))' }}>EspañolPro</span>
        </div>
        <p style={{ fontSize: '11px', color: 'rgb(var(--ink3))' }}>© 2026 EspañolPro · Plataforma de enseñanza de español</p>
      </footer>
    </div>
  )
}
