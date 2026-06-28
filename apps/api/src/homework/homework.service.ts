import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    return this.prisma.homework.findMany({
      where: { courseId },
      include: { _count: { select: { submissions: true } } },
      orderBy: { dueAt: 'asc' },
    })
  }

  async create(data: { courseId: string; title: string; instructions?: string; dueAt: string; maxScore?: number }) {
    return this.prisma.homework.create({ data: { ...data, dueAt: new Date(data.dueAt), maxScore: data.maxScore ?? 100 } })
  }

  async submit(homeworkId: string, userId: string, fileUrl?: string, textContent?: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new ForbiddenException('Not a student')

    const hw = await this.prisma.homework.findUnique({ where: { id: homeworkId } })
    if (!hw) throw new NotFoundException('Homework not found')
    if (new Date() > hw.dueAt) throw new BadRequestException('Homework past due date')

    const existing = await this.prisma.homeworkSubmission.findUnique({
      where: { homeworkId_studentId: { homeworkId, studentId: student.id } },
    })
    if (existing) throw new BadRequestException('Already submitted')

    const submission = await this.prisma.homeworkSubmission.create({
      data: { homeworkId, studentId: student.id, fileUrl, textContent },
    })

    await this.prisma.pointsEntry.create({
      data: { studentId: student.id, points: 20, reason: 'Tarea entregada' },
    })

    return submission
  }

  async grade(submissionId: string, score: number, feedback?: string) {
    const sub = await this.prisma.homeworkSubmission.findUnique({ where: { id: submissionId } })
    if (!sub) throw new NotFoundException('Submission not found')
    return this.prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: { score, feedback, gradedAt: new Date() },
    })
  }

  async getMySubmissions(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new NotFoundException('Student not found')
    return this.prisma.homeworkSubmission.findMany({
      where: { studentId: student.id },
      include: { homework: { include: { course: { select: { title: true } } } } },
      orderBy: { submittedAt: 'desc' },
    })
  }
}
