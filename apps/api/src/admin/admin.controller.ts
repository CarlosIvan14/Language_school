import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { AdminService } from './admin.service'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard()
  }

  @Get('students')
  getStudents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getStudents(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    )
  }
}
