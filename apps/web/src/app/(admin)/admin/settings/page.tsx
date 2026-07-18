// FILE: apps/web/src/app/(admin)/admin/settings/page.tsx
'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  const inputStyle: React.CSSProperties = { background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }

  return (
    <div className="p-6 max-w-[640px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Configuración</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Ajustes de la plataforma</p>
      </div>

      <div className="space-y-3">
        <div className="bezel animate-fade-up" style={{ animationDelay: '40ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>General</p>
          <div className="space-y-3">
            {[
              { label: 'Nombre de la escuela', placeholder: 'EspañolPro' },
              { label: 'Email de contacto', placeholder: 'contacto@escuela.com' },
              { label: 'Sitio web', placeholder: 'https://espanolpro.com' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
              </div>
            ))}
          </div>
        </div></div>

        <div className="bezel animate-fade-up" style={{ animationDelay: '80ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Pagos (Stripe)</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Stripe Publishable Key</label>
              <input type="password" placeholder="pk_live_..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--ink2))' }}>Webhook Secret</label>
              <input type="password" placeholder="whsec_..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
            </div>
          </div>
        </div></div>

        <div className="bezel animate-fade-up" style={{ animationDelay: '120ms' }}><div className="bezel-inner p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Notificaciones</p>
          <div className="space-y-2.5">
            {[
              'Notificar inscripciones por email',
              'Notificar pagos recibidos',
              'Recordatorio de clase (10 y 5 min antes)',
              'Notificar calificaciones de tareas',
            ].map(label => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-blue-500 w-4 h-4" />
                <span className="text-[13px]" style={{ color: 'rgb(var(--ink))' }}>{label}</span>
              </label>
            ))}
          </div>
        </div></div>

        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="btn-primary w-full py-2.5 text-[13px]" style={{ borderRadius: '0.5rem' }}>
          {saved ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
