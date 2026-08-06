import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateEmergencyChatDto {
  @ApiProperty({ example: 'Небезпечна ситуація з клієнтом' })
  @IsString()
  @MaxLength(200)
  reason: string;

  @ApiPropertyOptional({ example: 'Потрібна термінова допомога, клієнт поводиться агресивно' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;
}
