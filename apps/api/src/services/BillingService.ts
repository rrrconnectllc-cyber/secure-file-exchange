import { Stripe } from 'stripe';
import { prisma } from '../index';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  storageQuota: number;
  userLimit: number;
}

const PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: ['2 users', '1 exchange room', '5GB storage', 'Email support'],
    storageQuota: 5 * 1024 * 1024 * 1024,
    userLimit: 2,
  },
  starter: {
    id: 'price_starter',
    name: 'Starter',
    price: 2900,
    currency: 'usd',
    interval: 'month',
    features: ['3 users', '10 exchange rooms', '100GB storage', 'Email support'],
    storageQuota: 100 * 1024 * 1024 * 1024,
    userLimit: 3,
  },
  business: {
    id: 'price_business',
    name: 'Business',
    price: 9900,
    currency: 'usd',
    interval: 'month',
    features: ['15 users', 'Unlimited rooms', '1TB storage', 'Priority support', 'API access'],
    storageQuota: 1024 * 1024 * 1024 * 1024,
    userLimit: 15,
  },
  enterprise: {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 49900,
    currency: 'usd',
    interval: 'month',
    features: ['Unlimited users', 'Unlimited rooms', 'Unlimited storage', 'Dedicated support', 'SSO'],
    storageQuota: 10 * 1024 * 1024 * 1024 * 1024,
    userLimit: 999999,
  },
};

export class BillingService {
  /**
   * Create subscription for organization
   */
  async createSubscription(
    organizationId: string,
    customerId: string,
    priceId: string
  ) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    await prisma.subscription.update({
      where: { organizationId },
      data: {
        stripeSubscriptionId: subscription.id,
        plan: this.getPlanFromPriceId(priceId),
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    return subscription;
  }

  /**
   * Create customer in Stripe
   */
  async createCustomer(organizationId: string, email: string, name: string) {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { organizationId },
    });

    await prisma.subscription.upsert({
      where: { organizationId },
      update: { stripeCustomerId: customer.id },
      create: {
        organizationId,
        stripeCustomerId: customer.id,
        status: 'trialing',
      },
    });

    return customer;
  }

  /**
   * Get or create customer
   */
  async getOrCreateCustomer(organizationId: string, email: string, name: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    const customer = await this.createCustomer(organizationId, email, name);
    return customer.id;
  }

  /**
   * Get subscription details
   */
  async getSubscription(organizationId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId },
    });
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(
    organizationId: string,
    newPriceId: string
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
    });

    await prisma.subscription.update({
      where: { organizationId },
      data: {
        plan: this.getPlanFromPriceId(newPriceId),
      },
    });

    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(organizationId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    await stripe.subscriptions.del(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { organizationId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        stripeSubscriptionId: null,
      },
    });
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        return this.handlePaymentSucceeded(event.data.object);
      case 'invoice.payment_failed':
        return this.handlePaymentFailed(event.data.object);
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data.object);
      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event.data.object);
      default:
        return null;
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(invoice: any) {
    const customerId = invoice.customer;

    const customer = await stripe.customers.retrieve(customerId);
    const orgId = (customer.metadata as any)?.organizationId;

    if (orgId) {
      await prisma.subscription.update({
        where: { organizationId: orgId },
        data: { status: 'active' },
      });
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(invoice: any) {
    const customerId = invoice.customer;

    const customer = await stripe.customers.retrieve(customerId);
    const orgId = (customer.metadata as any)?.organizationId;

    if (orgId) {
      await prisma.subscription.update({
        where: { organizationId: orgId },
        data: { status: 'past_due' },
      });
    }
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(subscription: any) {
    const customerId = subscription.customer;

    const customer = await stripe.customers.retrieve(customerId);
    const orgId = (customer.metadata as any)?.organizationId;

    if (orgId) {
      await prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
    }
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(subscription: any) {
    const customerId = subscription.customer;

    const customer = await stripe.customers.retrieve(customerId);
    const orgId = (customer.metadata as any)?.organizationId;

    if (orgId) {
      await prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
        },
      });
    }
  }

  /**
   * Create payment intent for one-time payment
   */
  async createPaymentIntent(
    customerId: string,
    amount: number,
    description: string
  ) {
    return stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      description,
    });
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string) {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  /**
   * Get plan details
   */
  getPlan(planId: string): SubscriptionPlan | null {
    return PLANS[planId] || null;
  }

  /**
   * Get plan from Stripe price ID
   */
  private getPlanFromPriceId(priceId: string): string {
    for (const [key, plan] of Object.entries(PLANS)) {
      if (plan.id === priceId) {
        return key;
      }
    }
    return 'free';
  }

  /**
   * Check if organization can perform action based on subscription
   */
  async canPerformAction(
    organizationId: string,
    action: 'upload_file' | 'create_room' | 'add_user' | 'api_call'
  ): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    const plan = subscription?.plan ? PLANS[subscription.plan] : PLANS['free'];

    if (!plan) return false;

    if (action === 'upload_file' || action === 'create_room' || action === 'api_call') {
      // Check storage quota
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { storageQuota: true },
      });

      const storageUsed = await prisma.file.aggregate({
        where: { organizationId },
        _sum: { sizeBytes: true },
      });

      return (storageUsed._sum.sizeBytes || 0) < (org?.storageQuota || plan.storageQuota);
    }

    if (action === 'add_user') {
      const userCount = await prisma.organizationMembership.count({
        where: { organizationId },
      });

      return userCount < plan.userLimit;
    }

    return true;
  }
}

export default new BillingService();
