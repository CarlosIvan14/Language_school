import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async findAll(stage?: string, assignedTo?: string) {
    return this.prisma.prospect.findMany({
      where: {
        ...(stage ? { stage: stage as any } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      },
      include: {
        _count: { select: { activities: true } },
        activities: { orderBy: { performedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { name: string; email?: string; phone?: string; source?: string; notes?: string }, assignedTo: string) {
    return this.prisma.prospect.create({
      data: { ...data, stage: 'lead', assignedTo },
    })
  }

  async updateStage(id: string, stage: string) {
    return this.prisma.prospect.update({
      where: { id },
      data: { stage: stage as any },
    })
  }

  async addActivity(prospectId: string, data: { type: string; notes?: string }) {
    const prospect = await this.prisma.prospect.findUnique({ where: { id: prospectId } })
    if (!prospect) throw new NotFoundException('Prospect not found')
    return this.prisma.crmActivity.create({
      data: { prospectId, type: data.type as any, notes: data.notes },
    })
  }

  async getFunnel() {
    const stages = ['lead', 'contacted', 'demo', 'converted', 'lost']
    const counts = await Promise.all(
      stages.map(s => this.prisma.prospect.count({ where: { stage: s as any } }))
    )
    return stages.map((s, i) => ({ stage: s, count: counts[i] }))
  }
}
