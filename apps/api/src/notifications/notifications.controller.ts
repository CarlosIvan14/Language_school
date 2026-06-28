import { Controller, Get, Patch, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { NotificationsService } from './notifications.service'

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(@Req() req: any, @Query('unread') unread?: string) {
    return this.notificationsService.getMyNotifications(req.user.id, unread === 'true')
  }

  @Patch('read')
  markRead(@Req() req: any, @Body() body: { ids: string[] }) {
    return this.notificationsService.markRead(body.ids, req.user.id)
  }
}
