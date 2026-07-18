import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'

/**
 * Sends class reminder emails 10 and 5 minutes before each scheduled session.
 * Runs every minute. Dedup is tracked via remind10SentAt / remind5SentAt on
 * the session, so a reminder is sent at most once per window.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger('RemindersService')

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async dispatchReminders() {
    const now = new Date()
    await this.sendWindow(now, 10)
    await this.sendWindow(now, 5)
  }

  private async sendWindow(now: Date, minutes: number) {
    // Sessions starting within [minutes, minutes+1) from now that haven't been
    // reminded for this window yet.
    const from = new Date(now.getTime() + minutes * 60_000)
    const to = new Date(now.getTime() + (minutes + 1) * 60_000)
    const sentField = minutes === 10 ? 'remind10SentAt' : 'remind5SentAt'

    const sessions = await this.prisma.classSession.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { gte: from, lt: to },
        [sentField]: null,
      },
      include: {
        course: {
          select: {
            title: true,
            teacher: { select: { zoomLink: true } },
            enrollments: {
              where: { status: 'active' },
              select: { student: { select: { user: { select: { email: true } } } } },
            },
          },
        },
      },
    })

    for (const session of sessions) {
      const zoom = session.zoomLink ?? session.course.teacher?.zoomLink ?? undefined
      const recipients = session.course.enrollments
        .map(e => e.student.user.email)
        .filter(Boolean)

      for (const to of recipients) {
        try {
          await this.email.sendClassReminder(to, {
            courseTitle: session.course.title,
            startsAt: session.scheduledAt,
            minutes,
            zoomLink: zoom,
          })
        } catch (err) {
          this.logger.error(`Failed reminder to ${to}: ${err}`)
        }
      }

      await this.prisma.classSession.update({
        where: { id: session.id },
        data: { [sentField]: new Date() },
      })

      if (recipients.length) {
        this.logger.log(`Sent ${minutes}-min reminder for "${session.course.title}" to ${recipients.length} student(s)`)
      }
    }
  }
}
