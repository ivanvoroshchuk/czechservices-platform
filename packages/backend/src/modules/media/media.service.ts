import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadToProfile(
    userId: string,
    file: Express.Multer.File,
    type: 'photo' | 'video',
  ) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
      include: { photos: true, videos: true },
    });
    if (!profile) throw new NotFoundException('Profile not found. Create one first.');

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
    const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(file.originalname);

    if (type === 'photo' && !isImage) throw new BadRequestException('File must be an image');
    if (type === 'video' && !isVideo) throw new BadRequestException('File must be a video');

    const url = `/uploads/${file.filename}`;
    const mediaType = isImage ? 'IMAGE' : 'VIDEO';

    const displayOrder =
      type === 'photo' ? profile.photos.length : profile.videos.length;

    return this.prisma.media.create({
      data: {
        ...(type === 'photo' ? { profilePhotosId: profile.id } : { profileVideosId: profile.id }),
        type: mediaType,
        mimeType: file.mimetype,
        fileSize: file.size,
        url,
        displayOrder,
      },
    });
  }

  async getProfileMedia(profileId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const [photos, videos] = await Promise.all([
      this.prisma.media.findMany({
        where: { profilePhotosId: profileId },
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.media.findMany({
        where: { profileVideosId: profileId },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    return { photos, videos };
  }

  async getMyMedia(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return this.getProfileMedia(profile.id);
  }

  async delete(userId: string, mediaId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    const profile = await this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!profile) throw new ForbiddenException('Access denied');

    const isOwner =
      media.profilePhotosId === profile.id || media.profileVideosId === profile.id;
    if (!isOwner) throw new ForbiddenException('Access denied');

    // Delete local file
    const filePath = join(process.cwd(), media.url);
    if (existsSync(filePath)) {
      try { unlinkSync(filePath); } catch {}
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
  }

  async reorder(userId: string, mediaId: string, displayOrder: number) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    const profile = await this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!profile) throw new ForbiddenException('Access denied');

    const isOwner =
      media.profilePhotosId === profile.id || media.profileVideosId === profile.id;
    if (!isOwner) throw new ForbiddenException('Access denied');

    return this.prisma.media.update({
      where: { id: mediaId },
      data: { displayOrder },
    });
  }

  // ── Admin ──

  async approve(mediaId: string, adminId: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    return this.prisma.media.update({
      where: { id: mediaId },
      data: {
        isApproved: true,
        moderationStatus: 'APPROVED',
        moderatedBy: adminId,
        moderatedAt: new Date(),
      },
    });
  }

  async reject(mediaId: string, adminId: string, notes: string) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');

    return this.prisma.media.update({
      where: { id: mediaId },
      data: {
        isApproved: false,
        moderationStatus: 'REJECTED',
        moderationNotes: notes,
        moderatedBy: adminId,
        moderatedAt: new Date(),
      },
    });
  }

  async listPending(skip = 0, take = 20) {
    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where: { moderationStatus: 'PENDING' },
        skip,
        take,
        orderBy: { uploadedAt: 'asc' },
      }),
      this.prisma.media.count({ where: { moderationStatus: 'PENDING' } }),
    ]);
    return { items, total };
  }
}
