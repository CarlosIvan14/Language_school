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
    @MessageBody() data: { recipientId: string; body: string; courseId?: string },
  ) {
    const senderId = client.data.userId
    if (!senderId || !data.body?.trim()) return

    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId: data.recipientId,
        courseId: data.courseId ?? null,
        body: data.body.trim(),
      },
      include: {
        sender: { select: { fullName: true, avatarUrl: true } },
      },
    })

    const recipientSocketId = this.userSockets.get(data.recipientId)
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('new_message', message)
    }

    client.emit('message_sent', message)
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { messageIds: string[] }) {
    await this.prisma.message.updateMany({
      where: { id: { in: data.messageIds }, recipientId: client.data.userId },
      data: { readAt: new Date() },
    })
  }
}
