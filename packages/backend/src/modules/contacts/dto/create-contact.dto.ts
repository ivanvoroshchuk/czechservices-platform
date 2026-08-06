import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'TELEGRAM', enum: ['PHONE', 'TELEGRAM', 'WHATSAPP', 'VIBER', 'EMAIL'] })
  @IsString()
  @IsIn(['PHONE', 'TELEGRAM', 'WHATSAPP', 'VIBER', 'EMAIL'])
  type: string;

  @ApiProperty({ example: '@myusername' })
  @IsString()
  @MaxLength(100)
  value: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
