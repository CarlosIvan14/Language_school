import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private prisma: PrismaService) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const userId = req.user.id
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
        recipient: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const seen = new Set<string>()
    const conversations: any[] = []
    for (const m of messages) {
      const otherId = m.senderId === userId ? m.recipientId : m.senderId
      if (!seen.has(otherId)) {
        seen.add(otherId)
        const other = m.senderId === userId ? m.recipient : m.sender
        conversations.push({ with: other, lastMessage: m })
      }
    }
    return conversations
  }

  @Get('messages')
  async getMessages(@Req() req: any, @Query('withUser') withUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, recipientId: withUserId },
          { senderId: withUserId, recipientId: req.user.id },
        ],
      },
      include: { sender: { select: { fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })
  }

  @Get('unread')
  getUnread(@Req() req: any) {
    return this.prisma.message.count({
      where: { recipientId: req.user.id, readAt: null },
    })
  }

  /**
   * Contacts a user is allowed to chat with, by role:
   * - admin (manager): everyone
   * - teacher: admins + other teachers + students in their courses
   * - student: admins + teachers of their courses + classmates
   */
  @Get('contacts')
  async getContacts(@Req() req: any) {
    const userId: string = req.user.id
    const role: string = req.user.role
    const ids = new Set<string>()

    // Everyone can reach admins (the manager)
    const admins = await this.prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } })
    admins.forEach(a => ids.add(a.id))

    if (role === 'admin') {
      const all = await this.prisma.user.findMany({ where: { NOT: { id: userId } }, select: { id: true } })
      all.forEach(u => ids.add(u.id))
    } else if (role === 'teacher') {
      // other teachers
      const teachers = await this.prisma.user.findMany({ where: { role: 'teacher' }, select: { id: true } })
      teachers.forEach(t => ids.add(t.id))
      // students enrolled in this teacher's courses
      const teacher = await this.prisma.teacher.findUnique({ where: { userId } })
      if (teacher) {
        const enrollments = await this.prisma.enrollment.findMany({
          where: { course: { teacherId: teacher.id } },
          select: { student: { select: { userId: true } } },
        })
        enrollments.forEach(e => ids.add(e.student.userId))
      }
    } else if (role === 'student') {
      const student = await this.prisma.student.findUnique({ where: { userId } })
      if (student) {
        const myCourses = await this.prisma.enrollment.findMany({
          where: { studentId: student.id },
          select: { courseId: true },
        })
        const courseIds = myCourses.map(c => c.courseId)
        if (courseIds.length) {
          // teachers of those courses
          const courses = await this.prisma.course.findMany({
            where: { id: { in: courseIds } },
            select: { teacher: { select: { userId: true } } },
          })
          courses.forEach(c => c.teacher?.userId && ids.add(c.teacher.userId))
          // classmates
          const classmates = await this.prisma.enrollment.findMany({
            where: { courseId: { in: courseIds } },
            select: { student: { select: { userId: true } } },
          })
          classmates.forEach(e => ids.add(e.student.userId))
        }
      }
    }

    ids.delete(userId) // never list yourself

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, fullName: true, avatarUrl: true, role: true },
      orderBy: { fullName: 'asc' },
    })
    return users
  }
}
