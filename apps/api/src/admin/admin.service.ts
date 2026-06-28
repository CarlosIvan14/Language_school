import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalStudents, activeCourses, monthlyRevenue,
      totalCertificates, activeProspects, recentEnrollments,
      recentPayments, attendanceData,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.course.count({ where: { status: { in: ['active', 'full'] } } }),
      this.prisma.payment.aggregate({
        where: { status: 'paid', createdAt: { gte: monthStart } },
        _sum: { amountCents: true },
      }),
      this.prisma.certificate.count(),
      this.prisma.prospect.count({ where: { stage: { in: ['lead', 'contacted', 'demo'] } } }),
      this.prisma.enrollment.findMany({
        where: { enrolledAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        include: {
          student: { include: { user: { select: { fullName: true } } } },
          course: { select: { title: true } },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5,
      }),
      this.prisma.payment.findMany({
        where: { createdAt: { gte: monthStart } },
        include: { student: { include: { user: { select: { fullName: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      Promise.all([
        this.prisma.attendance.count({ where: { status: 'present' } }),
        this.prisma.attendance.count(),
      ]),
    ])

    const [presentCount, totalCount] = attendanceData
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    return {
      totalStudents,
      activeCourses,
      monthlyRevenueCents: monthlyRevenue._sum.amountCents ?? 0,
      totalCertificates,
      activeProspects,
      attendanceRate,
      recentEnrollments,
      recentPayments,
    }
  }

  async getStudents(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit
    const where = search ? {
      user: { fullName: { contains: search, mode: 'insensitive' as const } },
    } : {}

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true, avatarUrl: true, createdAt: true } },
          enrollments: { where: { status: 'active' }, select: { id: true } },
        },
        skip,
        take: limit,
        orderBy: { user: { fullName: 'asc' } },
      }),
      this.prisma.student.count({ where }),
    ])

    return { items, total, page, pages: Math.ceil(total / limit) }
  }
}
