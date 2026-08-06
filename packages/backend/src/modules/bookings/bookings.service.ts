import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, dto: CreateBookingDto) {
    const profileService = await this.prisma.profileService.findUnique({
      where: { id: dto.profileServiceId },
      include: { profile: true },
    });
    if (!profileService) throw new NotFoundException('Service not found');
    if (!profileService.isActive) throw new BadRequestException('Service is not active');
    if (!profileService.profile.isPublished) throw new BadRequestException('Profile is not published');

    const providerId = profileService.profile.userId;
    if (providerId === clientId) throw new BadRequestException('Cannot book your own service');

    const scheduledAt = new Date(dto.scheduledAt);
    const endAt = new Date(scheduledAt.getTime() + profileService.durationMinutes * 60 * 1000);

    // Check for conflicting bookings
    const conflict = await this.prisma.booking.findFirst({
      where: {
        providerId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        AND: [
          { scheduledAt: { lt: endAt } },
          { endAt: { gt: scheduledAt } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Provider has a conflicting booking at this time');

    return this.prisma.booking.create({
      data: {
        providerId,
        clientId,
        profileServiceId: dto.profileServiceId,
        title: dto.title,
        description: dto.description,
        scheduledAt,
        durationMinutes: profileService.durationMinutes,
        endAt,
        location: dto.location,
        amountCZK: profileService.pricePerHour,
      },
      include: this.bookingIncludes(),
    });
  }

  async findMyBookings(userId: string, role: 'client' | 'provider', skip = 0, take = 20) {
    const where = role === 'client' ? { clientId: userId } : { providerId: userId };
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledAt: 'desc' },
        include: this.bookingIncludes(),
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { bookings, total };
  }

  async findById(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.bookingIncludes(),
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return booking;
  }

  async confirm(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.providerId !== userId) throw new ForbiddenException('Only the provider can confirm bookings');
    if (booking.status !== 'PENDING') throw new BadRequestException('Booking is not in PENDING status');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: this.bookingIncludes(),
    });
  }

  async cancel(bookingId: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel a completed or already cancelled booking');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledBy: userId,
        cancellationReason: reason,
        cancellationTime: new Date(),
      },
      include: this.bookingIncludes(),
    });
  }

  async complete(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.providerId !== userId) throw new ForbiddenException('Only the provider can mark as complete');
    if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Booking must be CONFIRMED or IN_PROGRESS to complete');
    }

    await this.prisma.profile.update({
      where: { userId },
      data: { totalBookings: { increment: 1 } },
    });

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
      include: this.bookingIncludes(),
    });
  }

  async addReview(bookingId: string, reviewerId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== reviewerId) throw new ForbiddenException('Only the client can leave a review');
    if (booking.status !== 'COMPLETED') throw new BadRequestException('Booking must be completed to leave a review');
    if (booking.review) throw new ConflictException('Review already exists for this booking');

    const review = await this.prisma.review.create({
      data: {
        bookingId,
        reviewerId,
        revieweeId: booking.providerId,
        rating: dto.rating,
        title: dto.title,
        text: dto.text,
        isPublic: dto.isPublic ?? true,
      },
    });

    // Recalculate provider's average rating
    const stats = await this.prisma.review.aggregate({
      where: { revieweeId: booking.providerId, isPublic: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.profile.updateMany({
      where: { userId: booking.providerId },
      data: {
        rating: stats._avg.rating || 5.0,
        reviewCount: stats._count.rating,
        totalReviews: stats._count.rating,
      },
    });

    return review;
  }

  async getReviewsForUser(userId: string, skip = 0, take = 20) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { revieweeId: userId, isPublic: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: { id: true, firstName: true, lastName: true, profilePicture: true },
          },
        },
      }),
      this.prisma.review.count({ where: { revieweeId: userId, isPublic: true } }),
    ]);
    return { reviews, total };
  }

  private bookingIncludes() {
    return {
      profileService: {
        include: { service: true },
      },
      review: true,
      provider: {
        select: { id: true, firstName: true, lastName: true, profilePicture: true },
      },
      client: {
        select: { id: true, firstName: true, lastName: true, profilePicture: true },
      },
    };
  }
}
