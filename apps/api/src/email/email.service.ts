import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Pluggable email service.
 *
 * Dev mode (default): logs the message to the API console — no external
 * account or API key required, and no real inbox is touched.
 *
 * To switch to a real provider later, implement `deliver()` with Resend,
 * nodemailer/SMTP, etc., gated on an env var (e.g. EMAIL_PROVIDER=resend).
 * The rest of the app only calls the high-level helpers below, so nothing
 * else needs to change.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService')

  constructor(private readonly config: ConfigService) {}

  private async deliver(opts: SendEmailOptions): Promise<void> {
    const provider = this.config.get<string>('EMAIL_PROVIDER', 'console')

    if (provider === 'console') {
      this.logger.log(
        `\n──────────── ✉  EMAIL (dev/console) ────────────\n` +
        `To:      ${opts.to}\n` +
        `Subject: ${opts.subject}\n` +
        `${opts.text}\n` +
        `────────────────────────────────────────────────`,
      )
      return
    }

    // TODO: real providers — plug in here (Resend / SMTP) when configured.
    this.logger.warn(`EMAIL_PROVIDER="${provider}" not implemented; falling back to console`)
    this.logger.log(`[${opts.subject}] -> ${opts.to}\n${opts.text}`)
  }

  // ── High-level helpers ──

  async sendPasswordResetCode(to: string, code: string) {
    await this.deliver({
      to,
      subject: 'Código para restablecer tu contraseña — EspañolPro',
      text:
        `Tu código para restablecer la contraseña es: ${code}\n` +
        `Este código expira en 15 minutos. Si no lo solicitaste, ignora este correo.`,
    })
  }

  async sendEmailChangeCode(to: string, code: string) {
    await this.deliver({
      to,
      subject: 'Confirma tu nuevo correo — EspañolPro',
      text:
        `Usa este código para confirmar tu nuevo correo: ${code}\n` +
        `El código expira en 15 minutos.`,
    })
  }

  async sendClassReminder(to: string, opts: { courseTitle: string; startsAt: Date; minutes: number; zoomLink?: string }) {
    const when = opts.startsAt.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    await this.deliver({
      to,
      subject: `Tu clase de ${opts.courseTitle} empieza en ${opts.minutes} min`,
      text:
        `Recordatorio: tu clase "${opts.courseTitle}" comienza a las ${when} (en ${opts.minutes} minutos).\n` +
        (opts.zoomLink ? `Entra por Zoom: ${opts.zoomLink}\n` : '') +
        `¡Te esperamos!`,
    })
  }

  async sendClassScheduled(to: string, opts: { courseTitle: string; startsAt: Date; zoomLink?: string }) {
    const when = opts.startsAt.toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })
    await this.deliver({
      to,
      subject: `Nueva clase programada — ${opts.courseTitle}`,
      text:
        `Se ha programado una clase de "${opts.courseTitle}" para el ${when}.\n` +
        (opts.zoomLink ? `Enlace de Zoom: ${opts.zoomLink}\n` : '') +
        `Recibirás recordatorios antes de que inicie.`,
    })
  }
}
