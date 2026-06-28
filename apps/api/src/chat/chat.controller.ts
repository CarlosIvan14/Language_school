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
}
