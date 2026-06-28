'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajustes de la plataforma</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading text-sm font-medium mb-3">General</h2>
          <div className="space-y-3">
            {[
              { label: 'Nombre de la escuela', placeholder: 'EspañolPro', key: 'schoolName' },
              { label: 'Email de contacto', placeholder: 'contacto@escuela.com', key: 'contactEmail' },
              { label: 'Sitio web', placeholder: 'https://espanolpro.com', key: 'website' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                <input placeholder={f.placeholder}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading text-sm font-medium mb-3">Pagos (Stripe)</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Stripe Publishable Key</label>
              <input type="password" placeholder="pk_live_..." defaultValue="••••••••••••••••"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Webhook Secret</label>
              <input type="password" placeholder="whsec_..."
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading text-sm font-medium mb-3">Notificaciones</h2>
          <div className="space-y-2">
            {[
              'Notificar inscripciones por email',
              'Notificar pagos recibidos',
              'Recordatorio de clase 24h antes',
              'Notificar calificaciones de tareas',
            ].map(label => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}>
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
