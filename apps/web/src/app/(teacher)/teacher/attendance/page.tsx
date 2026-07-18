// FILE: apps/web/src/app/(teacher)/teacher/attendance/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Icon } from '@/components/Icon'

const STATUS = {
  present: { label: 'P', color: 'rgb(var(--ok))', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)' },
  absent:  { label: 'A', color: 'rgb(var(--err))', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)' },
  excused: { label: 'J', color: 'rgb(var(--gold))', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)' },
} as const

export default function TeacherAttendancePage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [records, setRecords] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<any>('/teachers/me/dashboard').then(d => setSessions(d.upcomingSessions ?? [])).catch(() => {})
  }, [])

  async function loadAttendance(session: any) {
    setSelectedSession(session)
    try {
      const [attendanceList, course] = await Promise.all([
        api.get<any[]>(`/sessions/${session.id}/attendance`),
        api.get<any>(`/courses/${session.course?.id || session.courseId}`),
      ])
      const existing: Record<string, string> = {}
      attendanceList.forEach((a: any) => { existing[a.studentId] = a.status })
      setStudents((course?.enrollments ?? []).map((e: any) => e.student))
      setRecords(existing)
    } catch {}
  }

  async function saveAttendance() {
    if (!selectedSession) return
    setSaving(true)
    try {
      await api.post(`/sessions/${selectedSession.id}/attendance`, {
        records: students.map(s => ({ studentId: s.id, status: records[s.id] ?? 'absent' })),
      })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {} finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-[960px] mx-auto relative z-10">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'rgb(var(--ink))' }}>Asistencia</h1>
        <p className="text-[13px] mt-1" style={{ color: 'rgb(var(--ink2))' }}>Registra la asistencia de tus sesiones</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Sessions list */}
        <div className="col-span-1 animate-fade-up" style={{ animationDelay: '40ms' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgb(var(--ink3))' }}>Sesiones</p>
          <div className="space-y-2">
            {!sessions.length ? (
              <p className="text-[12px]" style={{ color: 'rgb(var(--ink2))' }}>Sin sesiones próximas</p>
            ) : sessions.map(s => (
              <button key={s.id} onClick={() => loadAttendance(s)}
                className="w-full text-left p-3 rounded-xl transition-all"
                style={{
                  background: selectedSession?.id === s.id ? 'rgba(79,142,247,0.08)' : 'rgb(var(--s1))',
                  border: selectedSession?.id === s.id ? '1px solid rgba(79,142,247,0.3)' : '1px solid rgb(var(--bd))',
                }}>
                <p className="text-[12px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{s.course?.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--ink2))' }}>
                  {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Roster */}
        <div className="col-span-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
          {!selectedSession ? (
            <div className="bezel h-full"><div className="bezel-inner h-48 flex items-center justify-center text-[13px]" style={{ color: 'rgb(var(--ink3))' }}>
              Selecciona una sesión
            </div></div>
          ) : (
            <div className="bezel"><div className="bezel-inner">
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--bd))' }}>
                <p className="text-[13px] font-medium" style={{ color: 'rgb(var(--ink))' }}>{selectedSession.course?.title}</p>
                <button onClick={saveAttendance} disabled={saving} className="btn-primary text-[12px] px-3 py-1.5 disabled:opacity-50" style={{ borderRadius: '0.5rem' }}>
                  {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar'}
                </button>
              </div>
              {!students.length ? (
                <p className="text-[13px] p-6 text-center" style={{ color: 'rgb(var(--ink2))' }}>Sin estudiantes en este curso</p>
              ) : (
                <div>
                  {students.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(var(--bd-soft))' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                        style={{ background: 'rgba(79,142,247,0.15)', color: 'rgb(var(--blue))' }}>
                        {s.user?.fullName?.charAt(0) ?? '?'}
                      </div>
                      <p className="text-[13px] flex-1" style={{ color: 'rgb(var(--ink))' }}>{s.user?.fullName}</p>
                      <div className="flex gap-1">
                        {(['present', 'absent', 'excused'] as const).map(status => {
                          const on = records[s.id] === status
                          const st = STATUS[status]
                          return (
                            <button key={status} onClick={() => setRecords(r => ({ ...r, [s.id]: status }))}
                              className="w-7 h-7 rounded-lg text-[11px] font-bold transition-all"
                              style={{
                                background: on ? st.bg : 'rgb(var(--s2))',
                                color: on ? st.color : 'rgb(var(--ink3))',
                                border: on ? `1px solid ${st.border}` : '1px solid transparent',
                              }}>
                              {st.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div></div>
          )}
        </div>
      </div>
    </div>
  )
}
