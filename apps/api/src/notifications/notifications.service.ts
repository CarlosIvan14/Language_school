import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async getMyNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { sentAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async markRead(notificationIds: string[], userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: { in: notificationIds }, userId },
      data: { sentAt: new Date() },
    })
  }

  async send(userId: string, type: string, payload: object, channel: 'email' | 'in_app' = 'in_app') {
    const notification = await this.prisma.notification.create({
      data: { userId, type, payload, channel },
    })

    if (channel === 'email') {
      await this.sendEmail(userId, type, payload)
    }

    return notification
  }

  private async sendEmail(userId: string, type: string, payload: any) {
    const apiKey = this.config.get<string>('RESEND_API_KEY')
    if (!apiKey) return

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    const subjects: Record<string, string> = {
      enrollment_confirmed: '¡Inscripción confirmada! — EspañolPro',
      payment_received: 'Pago recibido — EspañolPro',
      homework_graded: 'Tu tarea fue calificada — EspañolPro',
      session_reminder: 'Recordatorio de clase — EspañolPro',
      certificate_issued: '¡Certificado disponible! — EspañolPro',
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EspañolPro <noreply@espanolpro.com>',
        to: user.email,
        subject: subjects[type] ?? 'Notificación — EspañolPro',
        html: `<p>Hola ${user.fullName},</p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
      }),
    })

    await this.prisma.notification.updateMany({
      where: { userId, type },
      data: { sentAt: new Date(), status: 'sent' },
    })
  }
}
