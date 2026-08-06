import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics dashboard' })
  getStats() {
    return this.adminService.getStats();
  }

  // ── Moderation ──

  @Get('moderation')
  @ApiOperation({ summary: 'Get profiles pending moderation' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getModerationQueue(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.adminService.getModerationQueue(Number(skip) || 0, Number(take) || 20);
  }

  @Post('moderation/:profileId/approve')
  @ApiOperation({ summary: 'Approve a profile' })
  approveProfile(
    @Param('profileId') profileId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveProfile(profileId, adminId);
  }

  @Post('moderation/:profileId/reject')
  @ApiOperation({ summary: 'Reject a profile' })
  rejectProfile(
    @Param('profileId') profileId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectProfile(profileId, adminId, reason);
  }

  // ── Flagged Content ──

  @Get('flagged')
  @ApiOperation({ summary: 'Get flagged content' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'RESOLVED', 'DISMISSED'] })
  getFlaggedContent(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getFlaggedContent(Number(skip) || 0, Number(take) || 20, status || 'PENDING');
  }

  @Post('flagged/:id/resolve')
  @ApiOperation({ summary: 'Resolve flagged content' })
  resolveFlaggedContent(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('resolution') resolution: string,
    @Body('action') action?: string,
  ) {
    return this.adminService.resolveFlaggedContent(id, adminId, resolution, action);
  }

  // ── Admin Actions Log ──

  @Get('actions')
  @ApiOperation({ summary: 'Get admin actions log' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'adminId', required: false })
  getAdminActions(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('adminId') adminId?: string,
  ) {
    return this.adminService.getAdminActions(Number(skip) || 0, Number(take) || 50, adminId);
  }

  // ── User action: flag a profile ──

  @Post('flag')
  @ApiOperation({ summary: 'Flag a profile for review' })
  flagContent(
    @CurrentUser('id') userId: string,
    @Body('profileId') profileId: string,
    @Body('reason') reason: string,
    @Body('description') description?: string,
  ) {
    return this.adminService.flagContent(userId, profileId, reason, description);
  }
}
