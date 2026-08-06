import { IsEmail, IsPhoneNumber, IsString, MinLength, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'ivan@example.com',
    description: 'Email address (must be unique)',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+420 777 123 456',
    description: 'Phone number (must be unique)',
  })
  @IsPhoneNumber('CZ')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'First name',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Voroshchuk',
    description: 'Last name',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth (ISO 8601 format)',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;
}
