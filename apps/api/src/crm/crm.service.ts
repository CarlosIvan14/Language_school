import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async findAll(stage?: string, assignedToId?: string) {
    return this.prisma.prospect.findMany({
      where: {
        ...(stage ? { stage: stage as any } : {}),
        ...(assignedToId ? { assignedToId } : {}),
      },
      include: {
        _count: { select: { activities: true } },
        activities: { orderBy: { performedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { name: string; email?: string; phone?: string; source?: string; notes?: string }, assignedToId: string) {
    return this.prisma.prospect.create({
      data: { ...data, stage: 'lead', assignedToId } as any,
    })
  }

  async updateStage(id: string, stage: string) {
    return this.prisma.prospect.update({
      where: { id },
      data: { stage: stage as any },
    })
  }

  async addActivity(prospectId: string, data: { type: string; notes?: string }, performedById: string) {
    const prospect = await this.prisma.prospect.findUnique({ where: { id: prospectId } })
    if (!prospect) throw new NotFoundException('Prospect not found')
    return this.prisma.crmActivity.create({
      data: { prospectId, type: data.type as any, notes: data.notes, performedById } as any,
    })
  }

  async getFunnel() {
    const stages = ['lead', 'contacted', 'demo', 'converted', 'lost']
    const counts = await Promise.all(
      stages.map(s => this.prisma.prospect.count({ where: { stage: s as any } }))
    )
    return stages.map((s, i) => ({ stage: s, count: counts[i] }))
  }

  // ── Convert a client (prospect) into a registered student account ──
  async convertToStudent(prospectId: string, opts: { password?: string; nativeLanguage?: string; spanishLevel?: string }) {
    const prospect = await this.prisma.prospect.findUnique({ where: { id: prospectId } })
    if (!prospect) throw new NotFoundException('Cliente no encontrado')
    if (!prospect.email) throw new BadRequestException('El cliente no tiene correo — agrégalo antes de convertir')

    const existing = await this.prisma.user.findUnique({ where: { email: prospect.email } })
    if (existing) throw new ConflictException('Ya existe una cuenta con ese correo')

    // Use provided password or generate a temporary one to share with the client
    const tempPassword = opts.password?.trim() || `Est-${Math.random().toString(36).slice(2, 8)}`
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const user = await this.prisma.user.create({
      data: {
        email: prospect.email,
        passwordHash,
        fullName: prospect.name,
        phone: prospect.phone,
        role: 'student',
        student: {
          create: {
            nativeLanguage: opts.nativeLanguage ?? 'en',
            spanishLevel: (opts.spanishLevel as any) ?? 'A1',
          },
        },
      },
      include: { student: true },
    })

    // Mark the prospect as converted
    await this.prisma.prospect.update({
      where: { id: prospectId },
      data: { stage: 'converted' as any },
    })

    return {
      studentId: user.student!.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      tempPassword,           // returned once so the admin can share it
      generated: !opts.password,
    }
  }
}
