import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    return this.prisma.exam.findMany({
      where: { courseId },
      include: { _count: { select: { attempts: true } } },
    })
  }

  async create(data: { courseId: string; title: string; questions: object; timeLimitMin?: number; passScore?: number }, createdById: string) {
    return this.prisma.exam.create({
      data: { ...data, passScore: data.passScore ?? 70, createdById } as any,
    })
  }

  async startAttempt(examId: string, userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new ForbiddenException('Not a student')

    const exam = await this.prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) throw new NotFoundException('Exam not found')

    const existing = await this.prisma.examAttempt.findFirst({
      where: { examId, studentId: student.id, completedAt: { not: null } },
    })
    if (existing?.passed) throw new BadRequestException('Already passed this exam')

    return this.prisma.examAttempt.create({
      data: { examId, studentId: student.id, answers: {} },
    })
  }

  async submitAttempt(attemptId: string, userId: string, answers: Record<string, string>) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new ForbiddenException('Not a student')

    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    })
    if (!attempt || attempt.studentId !== student.id) throw new ForbiddenException()
    if (attempt.completedAt) throw new BadRequestException('Already submitted')

    const questions = attempt.exam.questions as any[]
    let correct = 0
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) correct++
    }
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    const passScore = Number(attempt.exam.passScore ?? 70)
    const passed = score >= passScore

    const updated = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: { answers, score, passed, completedAt: new Date() },
    })

    if (passed) {
      await this.prisma.pointsEntry.create({
        data: { studentId: student.id, points: 100, reason: `Examen aprobado: ${attempt.exam.title}` },
      })
    }

    return { ...updated, score, passed }
  }

  async getMyAttempts(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new NotFoundException('Student not found')
    return this.prisma.examAttempt.findMany({
      where: { studentId: student.id },
      include: { exam: { include: { course: { select: { title: true } } } } },
      orderBy: { startedAt: 'desc' },
    })
  }
}
