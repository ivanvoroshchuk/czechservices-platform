import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Media')
@ApiBearerAuth('JWT')
@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/photo')
  @ApiOperation({ summary: 'Upload a photo to my profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.mediaService.uploadToProfile(userId, file, 'photo');
  }

  @Post('upload/video')
  @ApiOperation({ summary: 'Upload a video to my profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.mediaService.uploadToProfile(userId, file, 'video');
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all my media (photos + videos)' })
  getMyMedia(@CurrentUser('id') userId: string) {
    return this.mediaService.getMyMedia(userId);
  }

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Get media for a specific profile' })
  getProfileMedia(@Param('profileId') profileId: string) {
    return this.mediaService.getProfileMedia(profileId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my media file' })
  delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.mediaService.delete(userId, id);
  }

  @Patch(':id/order')
  @ApiOperation({ summary: 'Change display order of a media item' })
  reorder(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('displayOrder') displayOrder: number,
  ) {
    return this.mediaService.reorder(userId, id, displayOrder);
  }

  // ── Admin ──

  @Get('pending')
  @ApiOperation({ summary: '[Admin] List media pending moderation' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  listPending(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.mediaService.listPending(Number(skip) || 0, Number(take) || 20);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '[Admin] Approve media' })
  approve(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.mediaService.approve(id, adminId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '[Admin] Reject media' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('notes') notes: string,
  ) {
    return this.mediaService.reject(id, adminId, notes);
  }
}
