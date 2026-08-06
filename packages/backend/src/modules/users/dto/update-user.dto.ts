import { IsEmail, IsPhoneNumber, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'ivan@newmail.com',
    description: 'New email (optional)',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+420 777 654 321',
    description: 'New phone number (optional)',
    required: false,
  })
  @IsPhoneNumber('CZ')
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'First name (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'Voroshchuk',
    description: 'Last name (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL (optional)',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  profilePicture?: string;
}
