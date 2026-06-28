import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { CoursesService } from './courses.service'
import { CreateCourseDto } from './dto/create-course.dto'
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
