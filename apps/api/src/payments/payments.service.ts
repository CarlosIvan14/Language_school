import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PaymentsService {
  private stripe: Stripe

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    })
  }

  async createPaymentIntent(userId: string, courseId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new BadRequestException('Not a student')

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
      include: { course: { select: { title: true, priceCents: true } } },
    })
    if (!enrollment) throw new NotFoundException('Enrollment not found')
    if (!enrollment.course.priceCents) throw new BadRequestException('Course has no price')

    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    const intent = await this.stripe.paymentIntents.create({
      amount: enrollment.course.priceCents,
      currency: 'usd',
      metadata: { enrollmentId: enrollment.id, studentId: student.id, courseId },
      receipt_email: user?.email,
      description: `EspañolPro — ${enrollment.course.title}`,
    })

    const payment = await this.prisma.payment.create({
      data: {
        studentId: student.id,
        courseId,
        amountCents: enrollment.course.priceCents,
        currency: 'usd',
        stripeIntentId: intent.id,
        status: 'pending',
        type: 'tuition',
      },
    })

    return {
      clientSecret: intent.client_secret,
      paymentId: payment.id,
      amount: enrollment.course.priceCents,
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? ''
    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret)
    } catch {
      throw new BadRequestException('Invalid webhook signature')
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent
      await this.prisma.payment.updateMany({
        where: { stripeIntentId: intent.id },
        data: { status: 'paid', paidAt: new Date() },
      })
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent
      await this.prisma.payment.updateMany({
        where: { stripeIntentId: intent.id },
        data: { status: 'failed' },
      })
    }

    return { received: true }
  }

  async getMyPayments(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } })
    if (!student) throw new NotFoundException('Student not found')
    return this.prisma.payment.findMany({
      where: { studentId: student.id },
      include: { course: { select: { title: true, level: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }
}
