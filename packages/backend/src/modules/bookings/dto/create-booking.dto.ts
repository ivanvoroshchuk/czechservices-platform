import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsInt, Min, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'profile-service-cuid' })
  @IsString()
  profileServiceId: string;

  @ApiProperty({ example: 'Спортивний масаж' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Хочу зробити масаж після тренування' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: '2026-08-15T10:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 'Václavské náměstí 1, Praha 1' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
