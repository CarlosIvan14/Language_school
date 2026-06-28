import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markSession(sessionId: string, records: Array<{ studentId: string; status: string }>) {
    const session = await this.prisma.classSession.findUnique({ where: { id: sessionId } })
    if (!session) throw new NotFoundException('Session not found')

    const upserts = records.map(r =>
      this.prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId, studentId: r.studentId } },
        create: { sessionId, studentId: r.studentId, status: r.status as any },
        update: { status: r.status as any },
      })
    )
    return Promise.all(upserts)
  }

  async getSessionAttendance(sessionId: string) {
    return this.prisma.attendance.findMany({
      where: { sessionId },
      include: { student: { include: { user: { select: { fullName: true, avatarUrl: true } } } } },
    })
  }

  async getStudentAttendance(userId: string, courseId?: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new NotFoundException('Student not found')

    return this.prisma.attendance.findMany({
      where: {
        studentId: student.id,
        ...(courseId ? { session: { courseId } } : {}),
      },
      include: { session: { include: { course: { select: { title: true, level: true } } } } },
      orderBy: { session: { scheduledAt: 'desc' } },
    })
  }
}
