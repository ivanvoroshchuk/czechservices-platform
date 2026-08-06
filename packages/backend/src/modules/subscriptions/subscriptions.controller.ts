import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get all available subscription plans (public)' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my current subscription' })
  getMySubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get my subscription history' })
  getHistory(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getHistory(userId);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to a plan (or change plan)' })
  subscribe(@CurrentUser('id') userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptionsService.subscribe(userId, dto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription (downgrade to FREE)' })
  cancel(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.cancel(userId);
  }

  @Post('webhook')
  @Public()
  @ApiExcludeEndpoint()
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.subscriptionsService.handleStripeWebhook(req.rawBody, sig);
  }
}
