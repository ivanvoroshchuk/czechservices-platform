import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'receiver-user-cuid' })
  @IsString()
  receiverId: string;

  @ApiProperty({ example: 'Привіт! Чи є у вас вільний час в п\'ятницю?' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/bucket/photo.jpg' })
  @IsOptional()
  @IsString()
  attachment?: string;

  @ApiPropertyOptional({ example: 'IMAGE', enum: ['IMAGE', 'VIDEO', 'FILE'] })
  @IsOptional()
  @IsString()
  attachmentType?: string;
}
