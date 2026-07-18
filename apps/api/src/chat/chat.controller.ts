import { Controller, Get, Post, Query, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
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

    // Per-conversation unread count (messages the other party sent me, still unread)
    const unreadRows = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { recipientId: userId, readAt: null },
      _count: { _all: true },
    })
    const unreadBy = new Map(unreadRows.map(r => [r.senderId, r._count._all]))
    for (const c of conversations) c.unread = unreadBy.get(c.with.id) ?? 0

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

  // Upload an image or PDF to attach to a chat message
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.UPLOAD_DIR ?? './uploads',
      filename: (_req, file, cb) => cb(null, `chat-${randomUUID()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    fileFilter: (_req, file, cb) => {
      if (/^(image\/(png|jpe?g|webp|gif)|application\/pdf)$/.test(file.mimetype)) cb(null, true)
      else cb(new BadRequestException('Solo imágenes o PDF'), false)
    },
  }))
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No se recibió archivo')
    const type = file.mimetype.startsWith('image/') ? 'image' : 'file'
    return { url: `/uploads/${file.filename}`, type }
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
