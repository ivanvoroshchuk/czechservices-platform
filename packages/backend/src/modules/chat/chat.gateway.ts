import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface AuthSocket extends Socket {
  userId?: string;
  userFullName?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  // userId → Set of socket IDs (user can have multiple tabs)
  private readonly onlineUsers = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Chat Gateway initialized');
  }

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userFullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();

      // Register in online users
      if (!this.onlineUsers.has(client.userId)) {
        this.onlineUsers.set(client.userId, new Set());
      }
      this.onlineUsers.get(client.userId).add(client.id);

      // Join personal room
      client.join(`user:${client.userId}`);

      // Notify user's contacts that they're online
      this.server.emit('user:online', { userId: client.userId });

      // Send unread count on connect
      const unread = await this.chatService.getUnreadCount(client.userId);
      client.emit('unread:count', unread);

      this.logger.log(`Client connected: ${client.userId} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (!client.userId) return null;

    const sockets = this.onlineUsers.get(client.userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(client.userId);
        this.server.emit('user:offline', { userId: client.userId });
      }
    }

    this.logger.log(`Client disconnected: ${client.userId} (${client.id})`);
  }

  // ── Send message ──

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    data: { receiverId: string; content: string; attachment?: string; attachmentType?: string },
  ) {
    if (!client.userId) return null;

    try {
      const message = await this.chatService.sendMessage(client.userId, {
        receiverId: data.receiverId,
        content: data.content,
        attachment: data.attachment,
        attachmentType: data.attachmentType,
      });

      // Deliver to sender (all their tabs)
      this.server.to(`user:${client.userId}`).emit('message:new', message);

      // Deliver to receiver if online
      if (this.onlineUsers.has(data.receiverId)) {
        this.server.to(`user:${data.receiverId}`).emit('message:new', message);
      }

      return { success: true, message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ── Typing indicator ──

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!client.userId) return null;
    this.server.to(`user:${data.receiverId}`).emit('typing:start', {
      userId: client.userId,
      name: client.userFullName,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { receiverId: string },
  ) {
    if (!client.userId) return null;
    this.server.to(`user:${data.receiverId}`).emit('typing:stop', { userId: client.userId });
  }

  // ── Mark as read ──

  @SubscribeMessage('message:read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { partnerId: string },
  ) {
    if (!client.userId) return null;
    await this.chatService.getConversation(client.userId, data.partnerId, 0, 1);

    // Notify sender that messages were read
    this.server.to(`user:${data.partnerId}`).emit('message:read', { by: client.userId });

    const unread = await this.chatService.getUnreadCount(client.userId);
    client.emit('unread:count', unread);
  }

  // ── Online status ──

  @SubscribeMessage('user:is-online')
  handleIsOnline(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { userId: string },
  ) {
    return { userId: data.userId, online: this.onlineUsers.has(data.userId) };
  }

  @SubscribeMessage('online:list')
  handleOnlineList() {
    return { onlineUsers: Array.from(this.onlineUsers.keys()) };
  }

  // ── Emergency ──

  @SubscribeMessage('emergency:create')
  async handleEmergencyCreate(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { reason: string; description?: string; priority?: string },
  ) {
    if (!client.userId) return null;

    try {
      const chat = await this.chatService.createEmergencyChat(client.userId, {
        reason: data.reason,
        description: data.description,
        priority: data.priority,
      });

      client.join(`emergency:${chat.id}`);

      // Notify all admins
      this.server.emit('emergency:new', {
        chatId: chat.id,
        userId: client.userId,
        reason: data.reason,
        priority: chat.priority,
      });

      return { success: true, chat };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('emergency:message')
  async handleEmergencyMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    if (!client.userId) return null;

    try {
      const msg = await this.chatService.sendEmergencyMessage(
        data.chatId,
        client.userId,
        data.content,
      );

      this.server.to(`emergency:${data.chatId}`).emit('emergency:message', msg);
      return { success: true, message: msg };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Helper: send event to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
