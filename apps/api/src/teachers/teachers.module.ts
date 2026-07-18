import { Module } from '@nestjs/common'
import { TeachersController } from './teachers.controller'
import { TeachersService } from './teachers.service'
import { RolesGuard } from '../common/guards/roles.guard'

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, RolesGuard],
  exports: [TeachersService],
})
export class TeachersModule {}
