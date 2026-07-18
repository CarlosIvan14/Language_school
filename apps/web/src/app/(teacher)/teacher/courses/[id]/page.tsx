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
const card = 'rgb(var(--s1))'

export default function TeacherCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('students')

  const [roster, setRoster] = useState<any[] | null>(null)
  const [homework, setHomework] = useState<any[] | null>(null)
  const [materials, setMaterials] = useState<any[] | null>(null)

  useEffect(() => { api.get(`/courses/${id}`).then(setCourse).catch(() => {}) }, [id])

  const loadRoster = useCallback(() => { if (roster === null) api.get<any[]>(`/courses/${id}/students`).then(setRoster).catch(() => setRoster([])) }, [id, roster])
  const loadHomework = useCallback(() => { if (homework === null) api.get<any[]>(`/courses/${id}/homework`).then(setHomework).catch(() => setHomework([])) }, [id, homework])
  const loadMaterials = useCallback(() => { if (materials === null) api.get<any[]>(`/courses/${id}/materials`).then(setMaterials).catch(() => setMaterials([])) }, [id, materials])

  useEffect(() => {
    if (tab === 'students' || tab === 'attendance') loadRoster()
    if (tab === 'homework' || tab === 'grades') loadHomework()
    if (tab === 'materials') loadMaterials()
  }, [tab, loadRoster, loadHomework, loadMaterials])

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
        {tab === 'homework' && <HomeworkTab homework={homework} />}
        {tab === 'grades' && <GradesTab homework={homework} />}
        {tab === 'materials' && <MaterialsTab materials={materials} />}
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

function HomeworkTab({ homework }: { homework: any[] | null }) {
  if (homework === null) return <Loading />
  if (!homework.length) return <Empty icon="clipboard" text="Sin tareas creadas" />
  return (
    <div className="space-y-2">
      {homework.map((hw: any) => (
        <div key={hw.id} className="bezel"><div className="bezel-inner p-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{hw.title}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>Vence: {new Date(hw.dueAt).toLocaleDateString('es')}</p>
          </div>
          <span className="px-2 py-1 rounded-full text-[11px] font-medium" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}>{hw._count?.submissions ?? 0} entregas</span>
        </div></div>
      ))}
    </div>
  )
}

function GradesTab({ homework }: { homework: any[] | null }) {
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

function MaterialsTab({ materials }: { materials: any[] | null }) {
  if (materials === null) return <Loading />
  if (!materials.length) return <Empty icon="folder" text="Sin materiales subidos" />
  return (
    <div className="grid grid-cols-2 gap-3">
      {materials.map((m: any) => (
        <a key={m.id} href={m.fileUrl ?? '#'} target="_blank" rel="noreferrer" className="bezel"><div className="bezel-inner p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,142,247,0.12)', color: 'rgb(var(--blue))' }}><Icon name="file-text" size={18} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'rgb(var(--ink))' }}>{m.title}</p>
            <p className="text-[10px]" style={{ color: 'rgb(var(--ink3))' }}>{String(m.type).toUpperCase()}</p>
          </div>
        </div></a>
      ))}
    </div>
  )
}
