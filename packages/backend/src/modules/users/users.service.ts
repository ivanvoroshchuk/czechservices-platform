import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.toResponseDto(user);
  }

  /**
   * Get all users (admin)
   */
  async getAllUsers(
    skip: number = 0,
    take: number = 10,
    filter?: {
      email?: string;
      phone?: string;
      isAgeVerified?: boolean;
      isActive?: boolean;
      role?: string;
    },
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const where: any = {};

    if (filter) {
      if (filter.email) {
        where.email = { contains: filter.email, mode: 'insensitive' };
      }
      if (filter.phone) {
        where.phone = { contains: filter.phone, mode: 'insensitive' };
      }
      if (filter.isAgeVerified !== undefined) {
        where.isAgeVerified = filter.isAgeVerified;
      }
      if (filter.isActive !== undefined) {
        where.isActive = filter.isActive;
      }
      if (filter.role) {
        where.role = filter.role;
      }
      where.deletedAt = null;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => this.toResponseDto(user)),
      total,
    };
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already taken');
      }
    }

    // Check if phone is already taken
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone: updateUserDto.phone },
      });
      if (existingUser) {
        throw new ConflictException('Phone already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: updateUserDto.email || user.email,
        phone: updateUserDto.phone || user.phone,
        firstName: updateUserDto.firstName || user.firstName,
        lastName: updateUserDto.lastName || user.lastName,
        profilePicture: updateUserDto.profilePicture || user.profilePicture,
      },
    });

    return this.toResponseDto(updatedUser);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  /**
   * Suspend user
   */
  async suspendUser(
    userId: string,
    reason: string,
    suspendedUntil?: Date,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const suspendedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedReason: reason,
        suspendedUntil,
      },
    });

    return this.toResponseDto(suspendedUser);
  }

  /**
   * Unsuspend user
   */
  async unsuspendUser(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const unsuspendedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedReason: null,
        suspendedUntil: null,
      },
    });

    return this.toResponseDto(unsuspendedUser);
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return !!user;
  }

  /**
   * Convert user to response DTO
   */
  private toResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      isAgeVerified: user.isAgeVerified,
      ageVerificationStatus: user.ageVerificationStatus,
      role: user.role,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
