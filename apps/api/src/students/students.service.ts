import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    })
    if (!user?.student) throw new NotFoundException('Student profile not found')
    return user
  }

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    })
    if (!user?.student) throw new NotFoundException('Student not found')

    const studentId = user.student.id
    const now = new Date()

    const [enrollments, upcomingSessions, pendingHomework, pointsAgg, attendanceStats] =
      await Promise.all([
        this.prisma.enrollment.findMany({
          where: { studentId, status: 'active' },
          include: {
            course: {
              include: { teacher: { include: { user: { select: { fullName: true } } } } },
            },
          },
        }),

        this.prisma.classSession.findMany({
          where: {
            scheduledAt: { gte: now },
            status: 'scheduled',
            course: {
              enrollments: { some: { studentId, status: 'active' } },
            },
          },
          include: { course: { select: { title: true, level: true } } },
          orderBy: { scheduledAt: 'asc' },
          take: 5,
        }),

        this.prisma.homework.findMany({
          where: {
            dueAt: { gte: now },
            course: {
              enrollments: { some: { studentId, status: 'active' } },
            },
            submissions: { none: { studentId } },
          },
          orderBy: { dueAt: 'asc' },
          take: 10,
        }),

        this.prisma.pointsEntry.aggregate({
          where: { studentId },
          _sum: { points: true },
        }),

        this.prisma.attendance.count({
          where: { studentId, status: 'present' },
        }),
      ])

    const totalSessions = await this.prisma.attendance.count({ where: { studentId } })
    const attendancePercent =
      totalSessions > 0 ? Math.round((attendanceStats / totalSessions) * 100) : 0

    return {
      enrollments,
      upcomingSessions,
      pendingHomework,
      totalPoints: pointsAgg._sum.points ?? 0,
      attendancePercent,
    }
  }
}
