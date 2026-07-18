import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { CoursesService } from './courses.service'
import { CreateCourseDto } from './dto/create-course.dto'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query('level') level?: string, @Query('modality') modality?: string) {
    return this.coursesService.findAll({ level, modality })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id)
  }

  @Get(':id/students')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  roster(@Param('id') id: string) {
    return this.coursesService.getRoster(id)
  }

  @Get(':id/sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  listSessions(@Param('id') id: string) {
    return this.coursesService.listSessions(id)
  }

  @Post(':id/sessions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  createSession(@Param('id') id: string, @Body() body: { title?: string; scheduledAt: string; durationMin?: number }) {
    return this.coursesService.createSession(id, body)
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  deleteSession(@Param('sessionId') sessionId: string) {
    return this.coursesService.deleteSession(sessionId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles('admin')
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles('admin', 'teacher')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCourseDto>) {
    return this.coursesService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id)
  }

  @Post(':id/enroll')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  enroll(@Param('id') id: string, @Req() req: any) {
    return this.coursesService.enroll(id, req.user.id)
  }

  @Delete(':id/enroll')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  unenroll(@Param('id') id: string, @Req() req: any) {
    return this.coursesService.unenroll(id, req.user.id)
  }
}
