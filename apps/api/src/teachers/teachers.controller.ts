import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { TeachersService } from './teachers.service'

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('me/dashboard')
  getDashboard(@Req() req: any) {
    return this.teachersService.getDashboard(req.user.id)
  }
}
