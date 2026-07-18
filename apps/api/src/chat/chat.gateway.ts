import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private userSockets = new Map<string, string>()

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token ?? client.handshake.headers.authorization?.split(' ')[1]
      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') })
      client.data.userId = payload.sub
      this.userSockets.set(payload.sub, client.id)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId)
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string; body: string; courseId?: string; attachmentUrl?: string; attachmentType?: string },
  ) {
    const senderId = client.data.userId
    // Allow a message with just an attachment (empty body)
    if (!senderId || (!data.body?.trim() && !data.attachmentUrl)) return

    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId: data.recipientId,
        courseId: data.courseId ?? null,
        body: data.body?.trim() ?? '',
        attachmentUrl: data.attachmentUrl ?? null,
        attachmentType: data.attachmentType ?? null,
      },
      include: {
        sender: { select: { fullName: true, avatarUrl: true } },
      },
    })

    // Deliver to the recipient (if online) and echo back to the sender so both
    // sides get the persisted message with its real DB id.
    const recipientSocketId = this.userSockets.get(data.recipientId)
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('message', message)
    }
    client.emit('message', message)
  }

  // Recipient opened a conversation → mark all messages from `fromUser` as read,
  // then tell the sender so their ticks flip to "read" (double check).
  @SubscribeMessage('mark_read')
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { fromUser: string }) {
    const me = client.data.userId
    if (!me || !data?.fromUser) return

    await this.prisma.message.updateMany({
      where: { senderId: data.fromUser, recipientId: me, readAt: null },
      data: { readAt: new Date() },
    })

    const senderSocketId = this.userSockets.get(data.fromUser)
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('read', { by: me })
    }
  }
}
