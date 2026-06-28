import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ExamsService } from './exams.service'

@ApiTags('exams')
@Controller()
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('courses/:courseId/exams')
  findByCourse(@Param('courseId') courseId: string) {
    return this.examsService.findByCourse(courseId)
  }

  @Post('courses/:courseId/exams')
  create(@Param('courseId') courseId: string, @Body() body: any, @Req() req: any) {
    return this.examsService.create({ ...body, courseId }, req.user.id)
  }

  @Post('exams/:id/attempt')
  startAttempt(@Param('id') id: string, @Req() req: any) {
    return this.examsService.startAttempt(id, req.user.id)
  }

  @Post('exams/attempts/:id/submit')
  submitAttempt(@Param('id') id: string, @Body() body: { answers: Record<string, string> }, @Req() req: any) {
    return this.examsService.submitAttempt(id, req.user.id, body.answers)
  }

  @Get('students/me/exams')
  getMyAttempts(@Req() req: any) {
    return this.examsService.getMyAttempts(req.user.id)
  }
}
