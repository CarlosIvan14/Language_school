'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

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
      const [attendanceList, enrollments] = await Promise.all([
        api.get<any[]>(`/sessions/${session.id}/attendance`),
        api.get<any>(`/courses/${session.course?.id || session.courseId}`),
      ])
      const existing: Record<string, string> = {}
      attendanceList.forEach((a: any) => { existing[a.studentId] = a.status })

      const courseEnrollments = enrollments?.enrollments ?? []
      const studentList = courseEnrollments.map((e: any) => e.student)
      setStudents(studentList)
      setRecords(existing)
    } catch {}
  }

  async function saveAttendance() {
    if (!selectedSession) return
    setSaving(true)
    try {
      const recordsArray = students.map(s => ({
        studentId: s.id,
        status: records[s.id] ?? 'absent',
      }))
      await api.post(`/sessions/${selectedSession.id}/attendance`, { records: recordsArray })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-medium text-foreground">Asistencia</h1>
        <p className="text-sm text-muted-foreground">Registra la asistencia de tus sesiones</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Sesiones</p>
          <div className="space-y-2">
            {!sessions.length ? (
              <p className="text-sm text-muted-foreground">Sin sesiones próximas.</p>
            ) : (
              sessions.map(s => (
                <button key={s.id} onClick={() => loadAttendance(s)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedSession?.id === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
                  <p className="text-xs font-medium text-foreground">{s.course?.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(s.scheduledAt).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {!selectedSession ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Selecciona una sesión</div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">{selectedSession.course?.title}</p>
                <button onClick={saveAttendance} disabled={saving}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'} disabled:opacity-50`}>
                  {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {!students.length ? (
                  <p className="text-sm text-muted-foreground p-4">Sin estudiantes en este curso.</p>
                ) : (
                  students.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
                        {s.user?.fullName?.charAt(0) ?? '?'}
                      </div>
                      <p className="text-sm text-foreground flex-1">{s.user?.fullName}</p>
                      <div className="flex gap-1">
                        {(['present', 'absent', 'excused'] as const).map(status => (
                          <button key={status} onClick={() => setRecords(r => ({ ...r, [s.id]: status }))}
                            className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${records[s.id] === status ? {
                              present: 'bg-green-500 text-white border-green-500',
                              absent: 'bg-red-500 text-white border-red-500',
                              excused: 'bg-amber-500 text-white border-amber-500',
                            }[status] : 'border-border text-muted-foreground hover:bg-secondary'}`}>
                            {status === 'present' ? 'P' : status === 'absent' ? 'A' : 'J'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
