import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { AttendanceService } from './attendance.service'

@ApiTags('attendance')
@Controller()
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('sessions/:id/attendance')
  markSession(@Param('id') id: string, @Body() body: { records: Array<{ studentId: string; status: string }> }) {
    return this.attendanceService.markSession(id, body.records)
  }

  @Get('sessions/:id/attendance')
  getSessionAttendance(@Param('id') id: string) {
    return this.attendanceService.getSessionAttendance(id)
  }

  @Get('students/me/attendance')
  getMyAttendance(@Req() req: any, @Query('courseId') courseId?: string) {
    return this.attendanceService.getStudentAttendance(req.user.id, courseId)
  }
}
