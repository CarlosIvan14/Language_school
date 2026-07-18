import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { TeachersService } from './teachers.service'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CreateTeacherDto, SetAvailabilityDto } from './dto/create-teacher.dto'

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ── Admin: create + list teachers ──
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.createTeacher(dto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  list(@Query('search') search?: string, @Query('level') level?: string) {
    return this.teachersService.listTeachers(search, level)
  }

  // ── Teacher: own dashboard + availability ──
  @Get('me/dashboard')
  getDashboard(@Req() req: any) {
    return this.teachersService.getDashboard(req.user.id)
  }

  @Get('me/availability')
  getMyAvailability(@Req() req: any) {
    return this.teachersService.getMyAvailability(req.user.id)
  }

  @Put('me/availability')
  setMyAvailability(@Req() req: any, @Body() dto: SetAvailabilityDto) {
    return this.teachersService.setMyAvailability(req.user.id, dto.slots)
  }

  // ── Any authenticated user: view a teacher's free hours ──
  @Get(':id/availability')
  getAvailability(@Param('id') id: string) {
    return this.teachersService.getAvailabilityByTeacherId(id)
  }
}
