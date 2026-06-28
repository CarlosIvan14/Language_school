import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } })
    if (!teacher) throw new NotFoundException('Teacher not found')

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [courses, upcomingSessions, pendingGrading, totalStudents] = await Promise.all([
      this.prisma.course.findMany({
        where: { teacherId: teacher.id, status: { in: ['active', 'full'] } },
        include: { _count: { select: { enrollments: { where: { status: 'active' } } } } },
      }),

      this.prisma.classSession.findMany({
        where: {
          course: { teacherId: teacher.id },
          scheduledAt: { gte: now },
          status: 'scheduled',
        },
        include: { course: { select: { title: true, level: true } } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),

      this.prisma.homeworkSubmission.count({
        where: {
          homework: { course: { teacherId: teacher.id } },
          score: null,
        },
      }),

      this.prisma.enrollment.count({
        where: {
          course: { teacherId: teacher.id },
          status: 'active',
        },
      }),
    ])

    const sessionsThisWeek = await this.prisma.classSession.count({
      where: {
        course: { teacherId: teacher.id },
        scheduledAt: { gte: weekStart, lt: weekEnd },
      },
    })

    return {
      totalCourses: courses.length,
      totalStudents,
      sessionsThisWeek,
      pendingGrading,
      courses,
      upcomingSessions,
    }
  }
}
