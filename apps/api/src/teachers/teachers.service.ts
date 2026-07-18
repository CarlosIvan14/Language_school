import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateTeacherDto, AvailabilitySlotDto } from './dto/create-teacher.dto'

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  // ── Admin: create a teacher (User + Teacher profile) ──
  async createTeacher(dto: CreateTeacherDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Ya existe una cuenta con ese correo')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: 'teacher',
        teacher: {
          create: {
            specialties: dto.specialties ?? [],
            bio: dto.bio,
            zoomLink: dto.zoomLink,
            hourlyRate: dto.hourlyRate,
          },
        },
      },
      include: { teacher: true },
    })

    return {
      id: user.teacher!.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      specialties: user.teacher!.specialties,
      bio: user.teacher!.bio,
      zoomLink: user.teacher!.zoomLink,
    }
  }

  // ── Admin: list teachers with optional search (name/email) + level filter ──
  async listTeachers(search?: string, level?: string) {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        ...(level ? { specialties: { has: level as any } } : {}),
        ...(search
          ? {
              user: {
                OR: [
                  { fullName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            }
          : {}),
      },
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        _count: { select: { courses: true } },
      },
      orderBy: { user: { fullName: 'asc' } },
    })

    return teachers.map(t => ({
      id: t.id,
      fullName: t.user.fullName,
      email: t.user.email,
      avatarUrl: t.user.avatarUrl,
      specialties: t.specialties,
      bio: t.bio,
      zoomLink: t.zoomLink,
      hourlyRate: t.hourlyRate,
      courseCount: t._count.courses,
    }))
  }

  // ── Teacher: read own availability ──
  async getMyAvailability(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } })
    if (!teacher) throw new NotFoundException('Teacher not found')
    return this.prisma.teacherAvailability.findMany({
      where: { teacherId: teacher.id },
      orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
    })
  }

  // ── Teacher: replace all availability slots ──
  async setMyAvailability(userId: string, slots: AvailabilitySlotDto[]) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } })
    if (!teacher) throw new NotFoundException('Teacher not found')

    await this.prisma.$transaction([
      this.prisma.teacherAvailability.deleteMany({ where: { teacherId: teacher.id } }),
      this.prisma.teacherAvailability.createMany({
        data: slots.map(s => ({
          teacherId: teacher.id,
          weekday: s.weekday,
          startMin: s.startMin,
          endMin: s.endMin,
        })),
      }),
    ])

    return this.prisma.teacherAvailability.findMany({
      where: { teacherId: teacher.id },
      orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
    })
  }

  // ── Anyone (auth): view a teacher's availability by teacher id ──
  async getAvailabilityByTeacherId(teacherId: string) {
    return this.prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
    })
  }

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
