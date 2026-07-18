// FILE: apps/web/src/app/(teacher)/teacher/courses/[id]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Icon, type IconName } from '@/components/Icon'
import { ZoomLogo } from '@/components/ZoomLogo'

type Tab = 'students' | 'sessions' | 'attendance' | 'homework' | 'grades' | 'materials'
const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'students', label: 'Estudiantes', icon: 'users' },
  { key: 'sessions', label: 'Sesiones', icon: 'video' },
  { key: 'attendance', label: 'Asistencia', icon: 'check-circle' },
  { key: 'homework', label: 'Tareas', icon: 'clipboard' },
  { key: 'grades', label: 'Calificaciones', icon: 'bar-chart' },
  { key: 'materials', label: 'Materiales', icon: 'folder' },
]

const ATT = {
  present: { label: 'P', color: 'rgb(var(--ok))', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)' },
  absent:  { label: 'A', color: 'rgb(var(--err))', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)' },
  excused: { label: 'J', color: 'rgb(var(--gold))', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)' },
} as const

function initials(n?: string) { return (n ?? '').split(' ').filter(Boolean).map(x => x[0]).slice(0,2).join('').toUpperCase() || '?' }
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '')
function fileHref(sp?: string) { return !sp ? '#' : sp.startsWith('http') ? sp : `${API_ORIGIN}${sp}` }
const inputStyle: React.CSSProperties = { background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }

export default function TeacherCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('students')

  const [roster, setRoster] = useState<any[] | null>(null)

  useEffect(() => { api.get(`/courses/${id}`).then(setCourse).catch(() => {}) }, [id])

  const loadRoster = useCallback(() => { if (roster === null) api.get<any[]>(`/courses/${id}/students`).then(setRoster).catch(() => setRoster([])) }, [id, roster])

  useEffect(() => {
    if (tab === 'students' || tab === 'attendance') loadRoster()
  }, [tab, loadRoster])

  const level = course?.level
  const sessions = course?.sessions ?? []

  return (
    <div className="p-6 max-w-[960px] mx-auto relative z-10">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-2 mb-4 animate-fade-up">
        <Link href="/teacher/courses" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: 'rgb(var(--ink2))' }}>
          <Icon name="arrow-left" size={14} /> Mis cursos
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-5 animate-fade-up" style={{ animationDelay: '30ms' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{level ?? '—'}</div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>{course?.title ?? 'Cargando...'}</h1>
          <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>{course?._count?.enrollments ?? 0} estudiantes · {course?.durationWeeks ?? '?'} semanas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto animate-fade-up" style={{ animationDelay: '60ms' }}>
        {TABS.map(t => {
          const on = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-all"
              style={{
                background: on ? 'rgba(79,142,247,0.12)' : 'transparent',
                color: on ? 'rgb(var(--blue))' : 'rgb(var(--ink2))',
                border: on ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent',
              }}>
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '90ms' }}>
        {tab === 'students' && <StudentsTab roster={roster} />}
        {tab === 'sessions' && <SessionsTab sessions={sessions} />}
        {tab === 'attendance' && <AttendanceTab courseId={id} sessions={sessions} roster={roster} />}
        {tab === 'homework' && <HomeworkTab courseId={id} />}
        {tab === 'grades' && <GradesTab courseId={id} />}
        {tab === 'materials' && <MaterialsTab courseId={id} />}
      </div>
    </div>
  )
}

function Empty({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="bezel"><div className="bezel-inner py-12 text-center">
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-3" style={{ background: 'rgba(79,142,247,0.1)' }}>
        <Icon name={icon} size={20} style={{ color: 'rgb(var(--blue))' }} />
      </div>
      <p className="text-[13px]" style={{ color: 'rgb(var(--ink2))' }}>{text}</p>
    </div></div>
  )
}
function Loading() { return <div className="bezel"><div className="bezel-inner h-40 animate-pulse" style={{ background: 'rgb(var(--s2))' }} /></div> }

function StudentsTab({ roster }: { roster: any[] | null }) {
  if (roster === null) return <Loading />
  if (!roster.length) return <Empty icon="users" text="Sin estudiantes inscritos todavía" />
  return (
    <div className="bezel"><div className="bezel-inner">
      {roster.map((s, i) => (
        <div key={s.enrollmentId} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < roster.length - 1 ? '1px solid rgba(var(--bd-soft))' : 'none' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>{initials(s.fullName)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{s.fullName}</p>
            <p className="text-[11px] truncate" style={{ color: 'rgb(var(--ink2))' }}>{s.email}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: s.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(245,166,35,0.12)', color: s.status === 'active' ? 'rgb(var(--ok))' : 'rgb(var(--gold))' }}>
            {s.status === 'active' ? 'Activo' : 'Lista de espera'}
          </span>
        </div>
      ))}
    </div></div>
  )
}

function SessionsTab({ sessions }: { sessions: any[] }) {
  if (!sessions.length) return <Empty icon="video" text="Sin sesiones programadas" />
  return (
    <div className="space-y-2">
      {sessions.map((s: any) => (
        <div key={s.id} className="bezel"><div className="bezel-inner p-4 flex items-center gap-3">
          <div className="text-center flex-shrink-0 w-14">
            <p className="font-mono text-[13px] font-medium" style={{ color: 'rgb(var(--blue))' }}>{new Date(s.scheduledAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>{new Date(s.scheduledAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{s.title ?? 'Sesión'}</p>
            <p className="text-[11px]" style={{ color: 'rgb(var(--ink2))' }}>{s.durationMin ?? 60} min</p>
          </div>
          {s.zoomLink && (
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <ZoomLogo size={18} />
              <a href={s.zoomLink} target="_blank" rel="noreferrer" className="btn-primary text-[12px] px-3 py-1.5" style={{ borderRadius: '0.5rem' }}>Entrar</a>
            </span>
          )}
        </div></div>
      ))}
    </div>
  )
}

function AttendanceTab({ courseId, sessions, roster }: { courseId: string; sessions: any[]; roster: any[] | null }) {
  const [sessionId, setSessionId] = useState<string>('')
  const [records, setRecords] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (sessions[0] && !sessionId) setSessionId(sessions[0].id) }, [sessions, sessionId])
  useEffect(() => {
    if (!sessionId) return
    api.get<any[]>(`/sessions/${sessionId}/attendance`).then(list => {
      const ex: Record<string, string> = {}; list.forEach(a => { ex[a.studentId] = a.status }); setRecords(ex)
    }).catch(() => setRecords({}))
  }, [sessionId])

  async function save() {
    if (!sessionId || !roster) return
    setSaving(true)
    try {
      await api.post(`/sessions/${sessionId}/attendance`, { records: roster.map(s => ({ studentId: s.studentId, status: records[s.studentId] ?? 'absent' })) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {} finally { setSaving(false) }
  }

  if (!sessions.length) return <Empty icon="check-circle" text="Programa una sesión para registrar asistencia" />
  if (roster === null) return <Loading />

  return (
    <div className="bezel"><div className="bezel-inner">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
        <select value={sessionId} onChange={e => setSessionId(e.target.value)} className="px-3 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'rgb(var(--s2))', border: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--ink))' }}>
          {sessions.map((s: any) => <option key={s.id} value={s.id}>{new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} · {s.title ?? 'Sesión'}</option>)}
        </select>
        <button onClick={save} disabled={saving} className="btn-primary text-[12px] px-3 py-1.5 disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>{saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar'}</button>
      </div>
      {!roster.length ? <p className="text-[13px] p-6 text-center" style={{ color: 'rgb(var(--ink2))' }}>Sin estudiantes</p> : roster.map((s: any) => (
        <div key={s.studentId} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>{initials(s.fullName)}</div>
          <p className="text-[13px] flex-1" style={{ color: 'rgb(var(--ink))' }}>{s.fullName}</p>
          <div className="flex gap-1">
            {(['present','absent','excused'] as const).map(st => {
              const on = records[s.studentId] === st; const c = ATT[st]
              return <button key={st} onClick={() => setRecords(r => ({ ...r, [s.studentId]: st }))} className="w-7 h-7 rounded-lg text-[11px] font-bold transition-all"
                style={{ background: on ? c.bg : 'rgb(var(--s2))', color: on ? c.color : 'rgb(var(--ink3))', border: on ? `1px solid ${c.border}` : '1px solid transparent' }}>{c.label}</button>
            })}
          </div>
        </div>
      ))}
    </div></div>
  )
}

function HomeworkTab({ courseId }: { courseId: string }) {
  const [homework, setHomework] = useState<any[] | null>(null)
  const [form, setForm] = useState({ title: '', instructions: '', dueAt: '', maxScore: 100 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => api.get<any[]>(`/courses/${courseId}/homework`).then(setHomework).catch(() => setHomework([])), [courseId])
  useEffect(() => { load() }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.dueAt) { setError('Título y fecha de entrega son obligatorios'); return }
    setSaving(true); setError('')
    try {
      await api.post(`/courses/${courseId}/homework`, { title: form.title, instructions: form.instructions || undefined, dueAt: new Date(form.dueAt).toISOString(), maxScore: Number(form.maxScore) })
      setForm({ title: '', instructions: '', dueAt: '', maxScore: 100 }); load()
    } catch (e: any) { setError(e.message ?? 'Error') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      <div className="bezel"><div className="bezel-inner p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgb(var(--ink2))' }}>Nueva tarea</p>
        <form onSubmit={add} className="space-y-2">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la tarea" className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
          <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={2} placeholder="Instrucciones / ejercicios en línea..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={inputStyle} />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} className="px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle} />
            <input type="number" min={1} max={100} value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))} placeholder="Puntos" className="px-3 py-2 rounded-lg text-[13px] outline-none font-mono" style={inputStyle} />
          </div>
          {error && <p className="text-[12px] flex items-center gap-1.5" style={{ color: 'rgb(var(--err))' }}><Icon name="alert-circle" size={13} /> {error}</p>}
          <button type="submit" disabled={saving} className="btn-primary py-2 text-[13px] w-full disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>{saving ? 'Creando...' : 'Crear tarea'}</button>
        </form>
      </div></div>

      {homework === null ? <Loading /> : !homework.length ? <Empty icon="clipboard" text="Sin tareas creadas" /> : (
        <div className="space-y-2">
          {homework.map((hw: any) => (
            <div key={hw.id} className="bezel"><div className="bezel-inner p-4 flex items-center justify-between">
              <div><p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{hw.title}</p><p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>Vence: {new Date(hw.dueAt).toLocaleDateString('es')}</p></div>
              <span className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{hw._count?.submissions ?? 0} entregas</span>
            </div></div>
          ))}
        </div>
      )}
    </div>
  )
}

function GradesTab({ courseId }: { courseId: string }) {
  const [homework, setHomework] = useState<any[] | null>(null)
  useEffect(() => { api.get<any[]>(`/courses/${courseId}/homework`).then(setHomework).catch(() => setHomework([])) }, [courseId])
  if (homework === null) return <Loading />
  const withSubs = homework.filter((hw: any) => (hw._count?.submissions ?? 0) > 0)
  if (!withSubs.length) return <Empty icon="bar-chart" text="Sin entregas por calificar" />
  return (
    <div className="space-y-2">
      {withSubs.map((hw: any) => (
        <div key={hw.id} className="bezel"><div className="bezel-inner p-4 flex items-center justify-between">
          <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{hw.title}</p>
          <span className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ background: 'rgba(245,166,35,0.12)', color: 'rgb(var(--gold))' }}>{hw._count?.submissions} por calificar</span>
        </div></div>
      ))}
    </div>
  )
}

const MAT_ICON: Record<string, IconName> = { pdf: 'file-text', image: 'file-text', video: 'video', audio: 'message', link: 'arrow-right', exercise: 'edit' }

function MaterialsTab({ courseId }: { courseId: string }) {
  const [materials, setMaterials] = useState<any[] | null>(null)
  const [mode, setMode] = useState<'file' | 'link'>('file')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('pdf')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => api.get<any[]>(`/courses/${courseId}/materials`).then(setMaterials).catch(() => setMaterials([])), [courseId])
  useEffect(() => { load() }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Pon un título'); return }
    if (mode === 'file' && !file) { setError('Elige un archivo'); return }
    if (mode === 'link' && !url.trim()) { setError('Pon el enlace'); return }
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('type', mode === 'link' ? 'link' : type)
      if (mode === 'file' && file) fd.append('file', file)
      if (mode === 'link') fd.append('url', url)
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${API_URL}/courses/${courseId}/materials`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al subir')
      setTitle(''); setUrl(''); setFile(null); load()
    } catch (e: any) { setError(e.message ?? 'Error') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      {/* Upload form */}
      <div className="bezel"><div className="bezel-inner p-4">
        <div className="flex gap-1.5 mb-3">
          {(['file','link'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{ background: mode === m ? 'rgba(79,142,247,0.15)' : 'rgb(var(--s2))', color: mode === m ? 'rgb(var(--blue))' : 'rgb(var(--ink2))', border: mode === m ? '1px solid rgba(79,142,247,0.3)' : '1px solid transparent' }}>
              {m === 'file' ? 'Archivo (PDF/imagen)' : 'Enlace'}
            </button>
          ))}
        </div>
        <form onSubmit={add} className="grid grid-cols-2 gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="px-3 py-2 rounded-lg text-[13px] outline-none col-span-2" style={inputStyle} />
          {mode === 'file' ? (
            <>
              <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2 rounded-lg text-[13px] outline-none" style={inputStyle}>
                <option value="pdf">PDF</option><option value="image">Imagen</option><option value="video">Video</option><option value="audio">Audio</option>
              </select>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.mp3" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }} />
            </>
          ) : (
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="px-3 py-2 rounded-lg text-[13px] outline-none col-span-2 font-mono" style={inputStyle} />
          )}
          {error && <p className="text-[12px] col-span-2 flex items-center gap-1.5" style={{ color: 'rgb(var(--err))' }}><Icon name="alert-circle" size={13} /> {error}</p>}
          <button type="submit" disabled={saving} className="btn-primary py-2 text-[13px] col-span-2 disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>{saving ? 'Subiendo...' : 'Añadir material'}</button>
        </form>
      </div></div>

      {/* List */}
      {materials === null ? <Loading /> : !materials.length ? <Empty icon="folder" text="Sin materiales subidos" /> : (
        <div className="grid grid-cols-2 gap-3">
          {materials.map((m: any) => (
            <a key={m.id} href={fileHref(m.storagePath)} target="_blank" rel="noreferrer" className="bezel"><div className="bezel-inner p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}><Icon name={MAT_ICON[m.type] ?? 'file-text'} size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{m.title}</p>
                <p className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>{String(m.type).toUpperCase()}</p>
              </div>
            </div></a>
          ))}
        </div>
      )}
    </div>
  )
}
