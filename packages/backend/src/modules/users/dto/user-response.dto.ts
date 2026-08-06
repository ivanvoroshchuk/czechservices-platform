import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'clu123456789',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'ivan@example.com',
    description: 'Email address',
  })
  email: string;

  @ApiProperty({
    example: '+420777123456',
    description: 'Phone number',
  })
  phone: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'First name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Voroshchuk',
    description: 'Last name',
  })
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
    nullable: true,
  })
  profilePicture: string | null;

  @ApiProperty({
    example: false,
    description: 'Is user age verified (18+)',
  })
  isAgeVerified: boolean;

  @ApiProperty({
    example: 'PENDING',
    description: 'Age verification status',
  })
  ageVerificationStatus: string;

  @ApiProperty({
    example: 'USER',
    description: 'User role',
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'Is user active',
  })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Is user suspended',
  })
  isSuspended: boolean;

  @ApiProperty({
    example: '2026-08-06T12:00:00.000Z',
    description: 'Account creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-08-06T12:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
