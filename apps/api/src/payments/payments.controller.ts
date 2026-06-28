import { Controller, Get, Post, Body, Headers, Req, RawBodyRequest, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { PaymentsService } from './payments.service'
import type { Request } from 'express'

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  createIntent(@Body() body: { courseId: string }, @Req() req: any) {
    return this.paymentsService.createPaymentIntent(req.user.id, body.courseId)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getMyPayments(@Req() req: any) {
    return this.paymentsService.getMyPayments(req.user.id)
  }

  @Post('webhook')
  webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleWebhook(req.rawBody as Buffer, sig)
  }
}
