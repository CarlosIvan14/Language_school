import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { HomeworkService } from './homework.service'
import { IsString, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator'

class CreateHomeworkDto {
  @IsString() courseId: string
  @IsString() title: string
  @IsOptional() @IsString() instructions?: string
  @IsDateString() dueAt: string
  @IsOptional() @IsNumber() @Min(1) @Max(100) maxScore?: number
}

class SubmitHomeworkDto {
  @IsOptional() @IsString() fileUrl?: string
  @IsOptional() @IsString() textContent?: string
}

class GradeSubmissionDto {
  @IsNumber() @Min(0) @Max(100) score: number
  @IsOptional() @IsString() feedback?: string
}

@ApiTags('homework')
@Controller()
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Get('courses/:courseId/homework')
  findByCourse(@Param('courseId') courseId: string) {
    return this.homeworkService.findByCourse(courseId)
  }

  @Post('courses/:courseId/homework')
  create(@Param('courseId') courseId: string, @Body() body: Omit<CreateHomeworkDto, 'courseId'>) {
    return this.homeworkService.create({ ...body, courseId })
  }

  @Post('homework/:id/submit')
  submit(@Param('id') id: string, @Body() body: SubmitHomeworkDto, @Req() req: any) {
    return this.homeworkService.submit(id, req.user.id, body.fileUrl, body.textContent)
  }

  @Patch('homework/submissions/:id/grade')
  grade(@Param('id') id: string, @Body() body: GradeSubmissionDto) {
    return this.homeworkService.grade(id, body.score, body.feedback)
  }

  @Get('students/me/homework')
  getMySubmissions(@Req() req: any) {
    return this.homeworkService.getMySubmissions(req.user.id)
  }
}
