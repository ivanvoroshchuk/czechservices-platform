import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ example: 'BASIC', enum: ['FREE', 'BASIC', 'PREMIUM', 'PRO'] })
  @IsString()
  @IsIn(['FREE', 'BASIC', 'PREMIUM', 'PRO'])
  tier: string;

  @ApiPropertyOptional({ example: 'pm_1234567890', description: 'Stripe payment method ID' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
