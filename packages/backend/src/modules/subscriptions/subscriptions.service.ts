import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@database/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { SUBSCRIPTION_PLANS } from './subscriptions.config';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    }
  }

  getPlans() {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  async getMySubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, firstName: true } } },
    });
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    const plan = SUBSCRIPTION_PLANS[dto.tier];
    if (!plan) throw new BadRequestException('Invalid subscription tier');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.subscription.findUnique({ where: { userId } });

    if (dto.tier === 'FREE') {
      return this.subscribeToFree(userId, existing);
    }

    if (!this.stripe) {
      return this.subscribeWithoutStripe(userId, dto.tier, plan, existing);
    }

    return this.subscribeWithStripe(userId, user.email, dto, plan, existing);
  }

  private async subscribeToFree(userId: string, existing: any) {
    const plan = SUBSCRIPTION_PLANS.FREE;

    if (existing) {
      if (existing.stripeSubscriptionId && this.stripe) {
        await this.stripe.subscriptions.cancel(existing.stripeSubscriptionId).catch(() => {});
      }

      await this.prisma.subscriptionHistory.create({
        data: { userId, fromTier: existing.tier, toTier: 'FREE', action: 'DOWNGRADE' },
      });

      return this.prisma.subscription.update({
        where: { userId },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          isActive: true,
          endDate: null,
          renewalDate: null,
          pricePerMonth: 0,
          maxPhotos: plan.maxPhotos,
          maxVideos: plan.maxVideos,
          maxServices: plan.maxServices,
        },
      });
    }

    await this.prisma.subscriptionHistory.create({
      data: { userId, toTier: 'FREE', action: 'CREATE' },
    });

    return this.prisma.subscription.create({
      data: {
        userId,
        tier: 'FREE',
        stripeCustomerId: `free_${userId}`,
        isActive: true,
        pricePerMonth: 0,
        maxPhotos: plan.maxPhotos,
        maxVideos: plan.maxVideos,
        maxServices: plan.maxServices,
      },
    });
  }

  private async subscribeWithoutStripe(
    userId: string,
    tier: string,
    plan: typeof SUBSCRIPTION_PLANS.BASIC,
    existing: any,
  ) {
    const mockCustomerId = existing?.stripeCustomerId || `mock_${userId}`;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const action = !existing ? 'CREATE'
      : existing.tier < tier ? 'UPGRADE'
      : 'DOWNGRADE';

    await this.prisma.subscriptionHistory.create({
      data: { userId, fromTier: existing?.tier, toTier: tier, action },
    });

    if (existing) {
      return this.prisma.subscription.update({
        where: { userId },
        data: {
          tier,
          isActive: true,
          renewalDate,
          pricePerMonth: plan.pricePerMonth,
          maxPhotos: plan.maxPhotos,
          maxVideos: plan.maxVideos,
          maxServices: plan.maxServices,
        },
      });
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        tier,
        stripeCustomerId: mockCustomerId,
        isActive: true,
        renewalDate,
        pricePerMonth: plan.pricePerMonth,
        maxPhotos: plan.maxPhotos,
        maxVideos: plan.maxVideos,
        maxServices: plan.maxServices,
      },
    });
  }

  private async subscribeWithStripe(
    userId: string,
    email: string,
    dto: SubscribeDto,
    plan: typeof SUBSCRIPTION_PLANS.BASIC,
    existing: any,
  ) {
    let customerId = existing?.stripeCustomerId;

    if (!customerId || customerId.startsWith('free_') || customerId.startsWith('mock_')) {
      const customer = await this.stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;
    }

    if (dto.paymentMethodId) {
      await this.stripe.paymentMethods.attach(dto.paymentMethodId, { customer: customerId });
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: dto.paymentMethodId },
      });
    }

    const stripePriceId = this.configService.get<string>(`STRIPE_PRICE_${dto.tier}`);
    if (!stripePriceId) throw new BadRequestException(`Stripe price not configured for ${dto.tier}`);

    let stripeSubscription: Stripe.Subscription;

    if (existing?.stripeSubscriptionId) {
      stripeSubscription = await this.stripe.subscriptions.update(existing.stripeSubscriptionId, {
        items: [{ price: stripePriceId }],
        proration_behavior: 'create_prorations',
      });
    } else {
      stripeSubscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: stripePriceId }],
        expand: ['latest_invoice.payment_intent'],
      });
    }

    const action = !existing ? 'CREATE' : existing.tier < dto.tier ? 'UPGRADE' : 'DOWNGRADE';
    await this.prisma.subscriptionHistory.create({
      data: { userId, fromTier: existing?.tier, toTier: dto.tier, action },
    });

    const renewalDate = new Date(stripeSubscription.current_period_end * 1000);

    if (existing) {
      return this.prisma.subscription.update({
        where: { userId },
        data: {
          tier: dto.tier,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSubscription.id,
          isActive: true,
          renewalDate,
          pricePerMonth: plan.pricePerMonth,
          maxPhotos: plan.maxPhotos,
          maxVideos: plan.maxVideos,
          maxServices: plan.maxServices,
        },
      });
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        tier: dto.tier,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        isActive: true,
        renewalDate,
        pricePerMonth: plan.pricePerMonth,
        maxPhotos: plan.maxPhotos,
        maxVideos: plan.maxVideos,
        maxServices: plan.maxServices,
      },
    });
  }

  async cancel(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('No active subscription');
    if (sub.tier === 'FREE') throw new BadRequestException('Cannot cancel a free plan');

    if (sub.stripeSubscriptionId && this.stripe) {
      await this.stripe.subscriptions.cancel(sub.stripeSubscriptionId).catch(() => {});
    }

    await this.prisma.subscriptionHistory.create({
      data: { userId, fromTier: sub.tier, toTier: 'FREE', action: 'CANCEL' },
    });

    const freePlan = SUBSCRIPTION_PLANS.FREE;
    return this.prisma.subscription.update({
      where: { userId },
      data: {
        tier: 'FREE',
        stripeSubscriptionId: null,
        isActive: true,
        endDate: new Date(),
        renewalDate: null,
        pricePerMonth: 0,
        maxPhotos: freePlan.maxPhotos,
        maxVideos: freePlan.maxVideos,
        maxServices: freePlan.maxServices,
      },
    });
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) return { received: true };

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) return { received: true };

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await this.prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: { isActive: false },
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const freePlan = SUBSCRIPTION_PLANS.FREE;
      await this.prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          pricePerMonth: 0,
          maxPhotos: freePlan.maxPhotos,
          maxVideos: freePlan.maxVideos,
          maxServices: freePlan.maxServices,
        },
      });
    }

    return { received: true };
  }

  async getHistory(userId: string) {
    return this.prisma.subscriptionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
