import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user info (same as /api/auth/me but in users controller)
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.usersService.getUserById(user.userId);
  }

  /**
   * Get user by ID (admin or self)
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user profile by their ID (admin can view any user, regular users can only view themselves)',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile found',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(userId);
  }

  /**
   * Get all users (admin only)
   */
  @Get()
  @ApiOperation({
    summary: 'Get all users (admin)',
    description: 'List all users with optional filters and pagination',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of users to skip (for pagination)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of users to return (for pagination)',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email (case-insensitive)',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: 'Filter by phone',
  })
  @ApiQuery({
    name: 'isAgeVerified',
    required: false,
    type: Boolean,
    description: 'Filter by age verification status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  async getAllUsers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('isAgeVerified') isAgeVerified?: boolean,
    @Query('isActive') isActive?: boolean,
    @Query('role') role?: string,
  ) {
    return this.usersService.getAllUsers(
      skip || 0,
      take || 10,
      {
        email,
        phone,
        isAgeVerified,
        isActive,
        role,
      },
    );
  }

  /**
   * Update user profile
   */
  @Patch('me')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the profile of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  async updateCurrentUser(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(user.userId, updateUserDto);
  }

  /**
   * Change current user password
   */
  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }

  /**
   * Update another user (admin only)
   */
  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update user profile (admin)',
    description: 'Update any user profile (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  /**
   * Delete user account
   */
  @Delete('me')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete current user account',
    description: 'Soft delete the authenticated user account',
  })
  @ApiResponse({
    status: 204,
    description: 'User account deleted',
  })
  async deleteCurrentUser(@CurrentUser() user: any): Promise<void> {
    return this.usersService.deleteUser(user.userId);
  }

  /**
   * Delete user (admin only)
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete user account (admin)',
    description: 'Soft delete any user account (admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'User account deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(@Param('id') userId: string): Promise<void> {
    return this.usersService.deleteUser(userId);
  }

  /**
   * Suspend user (admin only)
   */
  @Patch(':id/suspend')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Suspend user (admin)',
    description: 'Suspend a user account with optional expiration date',
  })
  @ApiResponse({
    status: 200,
    description: 'User suspended',
    type: UserResponseDto,
  })
  async suspendUser(
    @Param('id') userId: string,
    @Body() body: { reason: string; suspendedUntil?: Date },
  ): Promise<UserResponseDto> {
    return this.usersService.suspendUser(
      userId,
      body.reason,
      body.suspendedUntil,
    );
  }

  /**
   * Unsuspend user (admin only)
   */
  @Patch(':id/unsuspend')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Unsuspend user (admin)',
    description: 'Remove suspension from a user account',
  })
  @ApiResponse({
    status: 200,
    description: 'User unsuspended',
    type: UserResponseDto,
  })
  async unsuspendUser(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.unsuspendUser(userId);
  }
}
