import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth('JWT')
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Get('my/client')
  @ApiOperation({ summary: 'Get my bookings as a client' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getMyClientBookings(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.bookingsService.findMyBookings(userId, 'client', Number(skip) || 0, Number(take) || 20);
  }

  @Get('my/provider')
  @ApiOperation({ summary: 'Get my bookings as a provider' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getMyProviderBookings(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.bookingsService.findMyBookings(userId, 'provider', Number(skip) || 0, Number(take) || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.findById(id, userId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a booking (provider only)' })
  confirm(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.confirm(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancel(id, userId, reason);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark booking as completed (provider only)' })
  complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.complete(id, userId);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Leave a review for completed booking (client only)' })
  addReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.bookingsService.addReview(id, userId, dto);
  }

  @Get('reviews/:userId')
  @ApiOperation({ summary: 'Get public reviews for a user/provider' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getReviews(
    @Param('userId') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.bookingsService.getReviewsForUser(userId, Number(skip) || 0, Number(take) || 20);
  }
}
