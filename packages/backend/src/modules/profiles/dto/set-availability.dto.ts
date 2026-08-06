import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsArray, ValidateNested, IsBoolean, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDayDto {
  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  end?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

export class SpecialDateDto {
  @ApiProperty({ example: '2026-12-25' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class SetAvailabilityDto {
  @ApiProperty({
    example: {
      monday: { start: '09:00', end: '17:00', isOpen: true },
      tuesday: { start: '09:00', end: '17:00', isOpen: true },
      wednesday: { start: '09:00', end: '17:00', isOpen: true },
      thursday: { start: '09:00', end: '17:00', isOpen: true },
      friday: { start: '09:00', end: '15:00', isOpen: true },
      saturday: { isOpen: false },
      sunday: { isOpen: false },
    },
  })
  @IsObject()
  schedule: Record<string, ScheduleDayDto>;

  @ApiPropertyOptional({ type: [SpecialDateDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialDateDto)
  specialDates?: SpecialDateDto[];
}
