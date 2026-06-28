import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { CoursesModule } from './courses/courses.module'
import { StudentsModule } from './students/students.module'
import { TeachersModule } from './teachers/teachers.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60_000, limit: 60 },
    ]),
    AuthModule,
    CoursesModule,
    StudentsModule,
    TeachersModule,
  ],
})
export class AppModule {}
