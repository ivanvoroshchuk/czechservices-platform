import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateEmergencyChatDto } from './dto/create-emergency-chat.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth('JWT')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ── Direct Messages ──

  @Post('messages')
  @ApiOperation({ summary: 'Send a direct message' })
  sendMessage(@CurrentUser('id') userId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(userId, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all my conversations (last message per partner)' })
  getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getMyConversations(userId);
  }

  @Get('conversations/:partnerId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getConversation(
    @CurrentUser('id') userId: string,
    @Param('partnerId') partnerId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.chatService.getConversation(userId, partnerId, Number(skip) || 0, Number(take) || 50);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.chatService.getUnreadCount(userId);
  }

  // ── Emergency Chat ──

  @Post('emergency')
  @ApiOperation({ summary: 'Create an emergency chat request' })
  createEmergency(@CurrentUser('id') userId: string, @Body() dto: CreateEmergencyChatDto) {
    return this.chatService.createEmergencyChat(userId, dto);
  }

  @Get('emergency/my')
  @ApiOperation({ summary: 'Get my emergency chat history' })
  getMyEmergencyChats(@CurrentUser('id') userId: string) {
    return this.chatService.getMyEmergencyChats(userId);
  }

  @Get('emergency/open')
  @ApiOperation({ summary: '[Admin] List all open emergency chats' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  listOpenEmergencyChats(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.chatService.listOpenEmergencyChats(Number(skip) || 0, Number(take) || 20);
  }

  @Get('emergency/:id')
  @ApiOperation({ summary: 'Get emergency chat by ID' })
  getEmergencyChat(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.chatService.getEmergencyChatById(id, userId);
  }

  @Post('emergency/:id/message')
  @ApiOperation({ summary: 'Send message in emergency chat' })
  sendEmergencyMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.chatService.sendEmergencyMessage(id, userId, content);
  }

  @Post('emergency/:id/resolve')
  @ApiOperation({ summary: '[Admin] Resolve emergency chat' })
  resolveEmergencyChat(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('resolution') resolution: string,
  ) {
    return this.chatService.resolveEmergencyChat(id, adminId, resolution);
  }
}
