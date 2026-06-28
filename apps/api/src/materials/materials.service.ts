import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserRole } from '@prisma/client'

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string, userId: string, role: UserRole) {
    if (role === 'student') {
      const student = await this.prisma.student.findUnique({ where: { userId } })
      const enrolled = student ? await this.prisma.enrollment.findFirst({
        where: { studentId: student.id, courseId, status: 'active' },
      }) : null
      if (!enrolled) throw new ForbiddenException('Not enrolled in this course')
    }
    return this.prisma.material.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { courseId: string; title: string; type: string; storagePath?: string; description?: string }, uploadedById: string) {
    return this.prisma.material.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        type: data.type as any,
        storagePath: data.storagePath ?? '',
        description: data.description,
        uploadedById,
      },
    })
  }

  async remove(id: string, userId: string, role: UserRole) {
    const material = await this.prisma.material.findUnique({ where: { id } })
    if (!material) throw new NotFoundException('Material not found')
    if (role !== 'admin' && material.uploadedById !== userId) throw new ForbiddenException()
    return this.prisma.material.delete({ where: { id } })
  }
}
