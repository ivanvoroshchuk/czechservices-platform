import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class SubmitVerificationDto {
  @ApiProperty({ example: 'PASSPORT', enum: ['PASSPORT', 'ID_CARD', 'DRIVERS_LICENSE'] })
  @IsString()
  @IsIn(['PASSPORT', 'ID_CARD', 'DRIVERS_LICENSE'])
  documentType: string;

  @ApiProperty({ example: 'AB123456' })
  @IsString()
  documentNumber: string;

  @ApiPropertyOptional({ example: 'CZ' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '2030-01-01' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/document.jpg' })
  @IsString()
  documentImageUrl: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/selfie.jpg' })
  @IsString()
  selfieImageUrl: string;
}
