import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      totalProfiles,
      publishedProfiles,
      totalBookings,
      completedBookings,
      totalRevenue,
      pendingVerifications,
      pendingMedia,
      openEmergencyChats,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.profile.count({ where: { deletedAt: null } }),
      this.prisma.profile.count({ where: { isPublished: true, deletedAt: null } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.booking.aggregate({
        where: { status: 'COMPLETED', paymentStatus: 'PAID' },
        _sum: { amountCZK: true },
      }),
      this.prisma.verificationDocument.count({ where: { veriffStatus: 'PENDING' } }),
      this.prisma.media.count({ where: { moderationStatus: 'PENDING' } }),
      this.prisma.emergencyChat.count({ where: { status: 'OPEN' } }),
    ]);

    const newUsersToday = await this.prisma.user.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    return {
      users: { total: totalUsers, active: activeUsers, newToday: newUsersToday },
      profiles: { total: totalProfiles, published: publishedProfiles },
      bookings: { total: totalBookings, completed: completedBookings },
      revenue: { totalCZK: (totalRevenue._sum.amountCZK || 0) / 100 },
      pending: {
        verifications: pendingVerifications,
        media: pendingMedia,
        emergencyChats: openEmergencyChats,
      },
    };
  }

  // ── Moderation Queue ──

  async getModerationQueue(skip = 0, take = 20) {
    const [items, total] = await Promise.all([
      this.prisma.moderationQueue.findMany({
        where: { status: 'PENDING' },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          profile: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
              region: true,
              city: true,
              services: { include: { service: true } },
              photos: { take: 3 },
            },
          },
        },
      }),
      this.prisma.moderationQueue.count({ where: { status: 'PENDING' } }),
    ]);
    return { items, total };
  }

  async approveProfile(profileId: string, adminId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.moderationQueue.upsert({
      where: { profileId },
      create: { profileId, status: 'APPROVED', moderatedBy: adminId, moderatedAt: new Date() },
      update: { status: 'APPROVED', moderatedBy: adminId, moderatedAt: new Date(), notes: null },
    });

    await this.prisma.adminAction.create({
      data: { adminId, action: 'APPROVE_PROFILE', actionTarget: 'Profile', actionTargetId: profileId },
    });

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { isPublished: true, publicationDate: new Date() },
      include: { user: { select: { id: true, firstName: true, email: true } } },
    });
  }

  async rejectProfile(profileId: string, adminId: string, reason: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.moderationQueue.upsert({
      where: { profileId },
      create: { profileId, status: 'REJECTED', reason, moderatedBy: adminId, moderatedAt: new Date() },
      update: { status: 'REJECTED', reason, moderatedBy: adminId, moderatedAt: new Date() },
    });

    await this.prisma.adminAction.create({
      data: { adminId, action: 'REJECT_PROFILE', actionTarget: 'Profile', actionTargetId: profileId, reason },
    });

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { isPublished: false },
    });
  }

  // ── Flagged Content ──

  async getFlaggedContent(skip = 0, take = 20, status = 'PENDING') {
    const [items, total] = await Promise.all([
      this.prisma.flaggedContent.findMany({
        where: { status },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          flagger: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.flaggedContent.count({ where: { status } }),
    ]);
    return { items, total };
  }

  async resolveFlaggedContent(
    flagId: string,
    adminId: string,
    resolution: string,
    action?: string,
  ) {
    const flag = await this.prisma.flaggedContent.findUnique({ where: { id: flagId } });
    if (!flag) throw new NotFoundException('Flagged content not found');

    await this.prisma.adminAction.create({
      data: { adminId, action: 'RESOLVE_FLAG', actionTarget: 'FlaggedContent', actionTargetId: flagId },
    });

    return this.prisma.flaggedContent.update({
      where: { id: flagId },
      data: {
        status: 'RESOLVED',
        resolution,
        actionTaken: action,
        actionTakenBy: adminId,
        actionTakenAt: new Date(),
      },
    });
  }

  // ── Admin Actions Log ──

  async getAdminActions(skip = 0, take = 50, adminId?: string) {
    const where: any = {};
    if (adminId) where.adminId = adminId;

    const [actions, total] = await Promise.all([
      this.prisma.adminAction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.adminAction.count({ where }),
    ]);
    return { actions, total };
  }

  // ── Flag Content (user action) ──

  async flagContent(flaggerId: string, profileId: string, reason: string, description?: string) {
    return this.prisma.flaggedContent.create({
      data: { flaggerId, profileId, reason, description },
    });
  }
}
