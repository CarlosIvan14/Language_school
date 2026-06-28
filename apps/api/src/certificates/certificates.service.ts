import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { createHash, randomBytes } from 'crypto'

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async issue(studentId: string, courseId: string) {
    const [student, course] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: studentId }, include: { user: { select: { fullName: true } } } }),
      this.prisma.course.findUnique({ where: { id: courseId }, select: { title: true, level: true } }),
    ])
    if (!student || !course) throw new NotFoundException('Student or course not found')

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, courseId, status: 'active' },
    })
    if (!enrollment) throw new ForbiddenException('Student not enrolled in this course')

    const existing = await this.prisma.certificate.findFirst({ where: { studentId, courseId } })
    if (existing) return existing

    const validationHash = createHash('sha256')
      .update(`${studentId}-${courseId}-${Date.now()}-${randomBytes(16).toString('hex')}`)
      .digest('hex')

    const certificate = await this.prisma.certificate.create({
      data: {
        studentId,
        courseId,
        validationHash,
        qrUrl: `/api/v1/certificates/verify/${validationHash}`,
        pdfPath: `/certificates/${validationHash}.pdf`,
        level: course.level,
      } as any,
    })

    await this.prisma.pointsEntry.create({
      data: { studentId, points: 500, reason: `Certificado: ${course.title}` },
    })

    return certificate
  }

  async verify(hash: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { validationHash: hash },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        course: { select: { title: true, level: true } },
      },
    })
    if (!cert) throw new NotFoundException('Certificate not found or invalid')
    return {
      valid: true,
      studentName: cert.student.user.fullName,
      courseTitle: cert.course.title,
      level: cert.course.level,
      issuedAt: cert.issuedAt,
    }
  }

  async getMyCertificates(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new NotFoundException('Student not found')
    return this.prisma.certificate.findMany({
      where: { studentId: student.id },
      include: { course: { select: { title: true, level: true } } },
      orderBy: { issuedAt: 'desc' },
    })
  }
}
