import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateProfileDto {
  @ApiPropertyOptional({ example: 'Досвідчений масажист з 5-річним досвідом' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: 'Спортивний масажист' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @ApiProperty({ example: 'region-cuid-here' })
  @IsString()
  regionId: string;

  @ApiProperty({ example: 'city-cuid-here' })
  @IsString()
  cityId: string;

  @ApiProperty({ example: 'Václavské náměstí 1, Praha 1' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ example: 50.0755 })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: 14.4378 })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;
}
