import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { CrmService } from './crm.service'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('crm')
@Controller('crm')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Roles('admin', 'teacher')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('prospects')
  findAll(@Query('stage') stage?: string, @Req() req?: any) {
    return this.crmService.findAll(stage, req.user.role === 'admin' ? undefined : req.user.id)
  }

  @Post('prospects')
  create(@Body() body: any, @Req() req: any) {
    return this.crmService.create(body, req.user.id)
  }

  @Patch('prospects/:id/stage')
  updateStage(@Param('id') id: string, @Body() body: { stage: string }) {
    return this.crmService.updateStage(id, body.stage)
  }

  @Post('prospects/:id/activities')
  addActivity(@Param('id') id: string, @Body() body: { type: string; notes?: string }) {
    return this.crmService.addActivity(id, body)
  }

  @Get('funnel')
  getFunnel() {
    return this.crmService.getFunnel()
  }
}
