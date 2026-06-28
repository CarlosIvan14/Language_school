import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { CoursesModule } from './courses/courses.module'
import { StudentsModule } from './students/students.module'
import { TeachersModule } from './teachers/teachers.module'
import { AdminModule } from './admin/admin.module'
import { MaterialsModule } from './materials/materials.module'
import { HomeworkModule } from './homework/homework.module'
import { PaymentsModule } from './payments/payments.module'
import { CertificatesModule } from './certificates/certificates.module'
import { ChatModule } from './chat/chat.module'
import { ExamsModule } from './exams/exams.module'
import { AttendanceModule } from './attendance/attendance.module'
import { CrmModule } from './crm/crm.module'
import { GamificationModule } from './gamification/gamification.module'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60_000, limit: 60 },
      { name: 'auth', ttl: 60_000, limit: 5 },
    ]),
    PrismaModule,
    AuthModule,
    CoursesModule,
    StudentsModule,
    TeachersModule,
    AdminModule,
    MaterialsModule,
    HomeworkModule,
    PaymentsModule,
    CertificatesModule,
    ChatModule,
    ExamsModule,
    AttendanceModule,
    CrmModule,
    GamificationModule,
    NotificationsModule,
  ],
})
export class AppModule {}
