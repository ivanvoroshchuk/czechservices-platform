import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateProfileServiceDto {
  @ApiProperty({ example: 'service-cuid-here' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 'Спортивний масаж для відновлення' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Глибокий масаж для відновлення м\'язів після тренувань' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 200000, description: 'Price per hour in CZK cents (200000 = 2000 CZK)' })
  @IsInt()
  @Min(0)
  pricePerHour: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 'INTERMEDIATE', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ example: ['cs', 'en', 'uk'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
