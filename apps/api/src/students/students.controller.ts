import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { StudentsService } from './students.service'

@ApiTags('students')
@Controller('students')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me/dashboard')
  getDashboard(@Req() req: any) {
    return this.studentsService.getDashboard(req.user.id)
  }

  @Get('me/profile')
  getProfile(@Req() req: any) {
    return this.studentsService.getProfile(req.user.id)
  }
}
