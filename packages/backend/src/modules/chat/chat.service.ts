import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateEmergencyChatDto } from './dto/create-emergency-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Direct Messages ──

  async sendMessage(senderId: string, dto: SendMessageDto) {
    if (senderId === dto.receiverId) throw new BadRequestException('Cannot send a message to yourself');

    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId, isActive: true },
    });
    if (!receiver) throw new NotFoundException('Receiver not found');

    return this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        attachment: dto.attachment,
        attachmentType: dto.attachmentType,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
      },
    });
  }

  async getConversation(userId: string, partnerId: string, skip = 0, take = 50) {
    const partner = await this.prisma.user.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('User not found');

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
          receiver: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        },
      }),
      this.prisma.chatMessage.count({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark received messages as read
    await this.prisma.chatMessage.updateMany({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { messages: messages.reverse(), total };
  }

  async getMyConversations(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
      },
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, any>();
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(partnerId)) {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
    }

    // Count unread
    const unreadCounts = await this.prisma.chatMessage.groupBy({
      by: ['senderId'],
      where: { receiverId: userId, isRead: false },
      _count: { id: true },
    });
    for (const uc of unreadCounts) {
      const conv = conversationsMap.get(uc.senderId);
      if (conv) conv.unreadCount = uc._count.id;
    }

    return Array.from(conversationsMap.values());
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.chatMessage.count({
      where: { receiverId: userId, isRead: false },
    });
    return { unreadCount: count };
  }

  // ── Emergency Chat ──

  async createEmergencyChat(userId: string, dto: CreateEmergencyChatDto) {
    return this.prisma.emergencyChat.create({
      data: {
        userId,
        reason: dto.reason,
        description: dto.description,
        priority: dto.priority || 'HIGH',
      },
      include: { messages: true },
    });
  }

  async getMyEmergencyChats(userId: string) {
    return this.prisma.emergencyChat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async getEmergencyChatById(chatId: string, userId: string) {
    const chat = await this.prisma.emergencyChat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
          },
        },
      },
    });
    if (!chat) throw new NotFoundException('Emergency chat not found');
    if (chat.userId !== userId) throw new ForbiddenException('Access denied');
    return chat;
  }

  async sendEmergencyMessage(chatId: string, senderId: string, content: string) {
    const chat = await this.prisma.emergencyChat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Emergency chat not found');
    if (chat.userId !== senderId) throw new ForbiddenException('Access denied');
    if (chat.status === 'RESOLVED') throw new BadRequestException('Chat is already resolved');

    return this.prisma.emergencyMessage.create({
      data: { emergencyChatId: chatId, senderId, content },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
      },
    });
  }

  async listOpenEmergencyChats(skip = 0, take = 20) {
    const [chats, total] = await Promise.all([
      this.prisma.emergencyChat.findMany({
        where: { status: 'OPEN' },
        skip,
        take,
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.emergencyChat.count({ where: { status: 'OPEN' } }),
    ]);
    return { chats, total };
  }

  async resolveEmergencyChat(chatId: string, adminId: string, resolution: string) {
    const chat = await this.prisma.emergencyChat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Emergency chat not found');

    return this.prisma.emergencyChat.update({
      where: { id: chatId },
      data: {
        status: 'RESOLVED',
        resolvedBy: adminId,
        resolution,
        resolvedAt: new Date(),
      },
    });
  }
}
