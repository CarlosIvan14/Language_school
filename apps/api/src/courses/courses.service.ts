import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateCourseDto } from './dto/create-course.dto'

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

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

  async create(dto: CreateCourseDto) {
    // Auto-generate a unique course code if none was provided (e.g. ESP-B2-4821)
    const code = dto.code?.trim() || `ESP-${dto.level}-${Math.floor(1000 + Math.random() * 9000)}`
    return this.prisma.course.create({ data: { ...dto, code } as any })
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
