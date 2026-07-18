import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import type { CreateCourseDto } from './dto/create-course.dto'

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  // ── Class sessions (scheduled by the manager within a course) ──
  async listSessions(courseId: string) {
    return this.prisma.classSession.findMany({
      where: { courseId },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async createSession(courseId: string, data: { title?: string; scheduledAt: string; durationMin?: number }) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { include: { user: { select: { email: true } } } },
        enrollments: { where: { status: 'active' }, include: { student: { include: { user: { select: { email: true } } } } } },
      },
    })
    if (!course) throw new NotFoundException('Curso no encontrado')

    const session = await this.prisma.classSession.create({
      data: {
        courseId,
        title: data.title || course.title,
        scheduledAt: new Date(data.scheduledAt),
        durationMin: data.durationMin ?? 60,
        zoomLink: course.teacher?.zoomLink ?? null, // always the teacher's Zoom room
        status: 'scheduled',
      },
    })

    // Notify enrolled students that a class was scheduled (dev/console email)
    const startsAt = session.scheduledAt
    for (const e of course.enrollments) {
      const to = e.student.user.email
      if (to) this.email.sendClassScheduled(to, { courseTitle: course.title, startsAt, zoomLink: session.zoomLink ?? undefined }).catch(() => {})
    }

    return session
  }

  async deleteSession(sessionId: string) {
    await this.prisma.classSession.delete({ where: { id: sessionId } }).catch(() => {})
    return { ok: true }
  }

  async findAll(filters: { level?: string; modality?: string } = {}) {
    return this.prisma.course.findMany({
      where: {
        status: { in: ['active', 'full'] },
        ...(filters.level ? { level: filters.level as any } : {}),
        ...(filters.modality ? { modality: filters.modality as any } : {}),
      },
      include: {
        teacher: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        _count: { select: { enrollments: { where: { status: 'active' } } } },
      },
      orderBy: { startsAt: 'asc' },
    })
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        sessions: { orderBy: { scheduledAt: 'asc' }, take: 10 },
        _count: { select: { enrollments: { where: { status: 'active' } } } },
      },
    })
    if (!course) throw new NotFoundException(`Course ${id} not found`)
    return course
  }

  // Enrolled students of a course (for teacher/admin course management)
  async getRoster(courseId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: { student: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } } } },
      orderBy: { enrolledAt: 'asc' },
    })
    return enrollments.map(e => ({
      enrollmentId: e.id,
      status: e.status,
      enrolledAt: e.enrolledAt,
      studentId: e.studentId,
      userId: e.student.user.id,
      fullName: e.student.user.fullName,
      email: e.student.user.email,
      avatarUrl: e.student.user.avatarUrl,
      spanishLevel: e.student.spanishLevel,
    }))
  }

  async create(dto: CreateCourseDto) {
    // Auto-generate a unique course code if none was provided (e.g. ESP-B2-4821)
    const code = dto.code?.trim() || `ESP-${dto.level}-${Math.floor(1000 + Math.random() * 9000)}`
    // Map snake_case DTO fields to Prisma's camelCase model fields
    return this.prisma.course.create({
      data: {
        code,
        title: dto.title,
        description: dto.description,
        level: dto.level as any,
        teacherId: dto.teacher_id,
        modality: dto.modality as any,
        capacity: dto.capacity,
        durationWeeks: dto.duration_weeks,
        priceCents: dto.price_cents,
        currency: dto.currency ?? 'USD',
        startsAt: new Date(dto.starts_at),
        endsAt: dto.ends_at ? new Date(dto.ends_at) : null,
        status: 'active',
      },
    })
  }

  async update(id: string, dto: Partial<CreateCourseDto>) {
    await this.findOne(id)
    return this.prisma.course.update({ where: { id }, data: dto as any })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.course.update({ where: { id }, data: { status: 'cancelled' } })
  }

  async enroll(courseId: string, userId: string) {
    const course = await this.findOne(courseId)

    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new BadRequestException('User is not a student')

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
    })
    if (existing) throw new ConflictException('Already enrolled in this course')

    const activeCount = await this.prisma.enrollment.count({
      where: { courseId, status: 'active' },
    })

    const status = activeCount >= course.capacity ? 'waitlist' : 'active'

    const enrollment = await this.prisma.enrollment.create({
      data: { studentId: student.id, courseId, status },
    })

    if (status === 'active') {
      await this.prisma.pointsEntry.create({
        data: { studentId: student.id, points: 50, reason: 'Inscripción a nuevo curso' },
      })
    }

    return {
      enrollment,
      status,
      message: status === 'waitlist' ? 'Añadido a lista de espera' : 'Inscripción exitosa',
    }
  }

  async unenroll(courseId: string, userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new BadRequestException('User is not a student')

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
    })
    if (!enrollment) throw new NotFoundException('Enrollment not found')

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'cancelled' },
    })
  }
}
