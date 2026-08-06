import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Verification')
@ApiBearerAuth('JWT')
@Controller('api/verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get my verification status' })
  getMyStatus(@CurrentUser('id') userId: string) {
    return this.verificationService.getStatus(userId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit documents for 18+ age verification' })
  submit(@CurrentUser('id') userId: string, @Body() dto: SubmitVerificationDto) {
    return this.verificationService.submit(userId, dto);
  }

  @Get('pending')
  @ApiOperation({ summary: '[Admin] List pending verifications' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  listPending(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.verificationService.listPending(Number(skip) || 0, Number(take) || 20);
  }

  @Post(':userId/approve')
  @ApiOperation({ summary: '[Admin] Approve user verification' })
  approve(@Param('userId') userId: string, @CurrentUser('id') adminId: string) {
    return this.verificationService.approve(userId, adminId);
  }

  @Post(':userId/reject')
  @ApiOperation({ summary: '[Admin] Reject user verification' })
  reject(
    @Param('userId') userId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.verificationService.reject(userId, adminId, reason);
  }
}
