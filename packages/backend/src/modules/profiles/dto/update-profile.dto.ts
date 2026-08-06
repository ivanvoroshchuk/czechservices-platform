import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEmergencyEnabled?: boolean;

  @ApiPropertyOptional({ example: 50000, description: 'Emergency fee in CZK cents' })
  @IsOptional()
  @IsInt()
  @Min(0)
  emergencyFee?: number;

  @ApiPropertyOptional({ example: 30, description: 'Emergency response time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  emergencyResponseTime?: number;
}
