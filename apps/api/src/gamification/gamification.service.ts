import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const BADGES = [
  { name: 'Primer paso', description: 'Inscribiste tu primer curso', icon: '🎯', trigger: 'first_enrollment', points: 0 },
  { name: 'Dedicado', description: '10 clases asistidas', icon: '📚', trigger: 'attendance_10', points: 0 },
  { name: '100 puntos', description: 'Alcanzaste 100 puntos', icon: '⭐', trigger: 'points_100', points: 100 },
  { name: 'Examinado', description: 'Aprobaste tu primer examen', icon: '🏆', trigger: 'exam_passed', points: 0 },
  { name: 'Certificado', description: 'Obtuviste tu primer certificado', icon: '🎓', trigger: 'first_cert', points: 0 },
]

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(limit = 10) {
    const points = await this.prisma.pointsEntry.groupBy({
      by: ['studentId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    })

    const students = await Promise.all(
      points.map(async p => {
        const student = await this.prisma.student.findUnique({
          where: { id: p.studentId },
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        })
        return { student, totalPoints: p._sum.points ?? 0 }
      })
    )
    return students.filter(s => s.student)
  }

  async getMyStats(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new NotFoundException('Student not found')

    const [pointsAgg, badges, entries] = await Promise.all([
      this.prisma.pointsEntry.aggregate({ where: { studentId: student.id }, _sum: { points: true } }),
      this.prisma.studentBadge.findMany({
        where: { studentId: student.id },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
      this.prisma.pointsEntry.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    return {
      totalPoints: pointsAgg._sum.points ?? 0,
      badges,
      recentActivity: entries,
    }
  }

  async seedBadges() {
    for (const b of BADGES) {
      await this.prisma.badge.upsert({
        where: { name: b.name },
        create: b,
        update: {},
      })
    }
    return { seeded: BADGES.length }
  }

  async checkAndAwardBadges(studentId: string, trigger: string) {
    const badge = await this.prisma.badge.findFirst({ where: { trigger } })
    if (!badge) return

    const already = await this.prisma.studentBadge.findUnique({
      where: { studentId_badgeId: { studentId, badgeId: badge.id } },
    })
    if (already) return

    await this.prisma.studentBadge.create({ data: { studentId, badgeId: badge.id } })

    if (badge.points > 0) {
      await this.prisma.pointsEntry.create({
        data: { studentId, points: badge.points, reason: `Badge: ${badge.name}` },
      })
    }
  }
}
