import { Router, Request, Response } from 'express';
import { z } from 'zod';
import BillingService from '../services/BillingService';
import { authenticateToken, requireOrganization } from '../middleware/auth';
import { prisma } from '../index';
import Stripe from 'stripe';
import crypto from 'crypto';

const router = Router();

const updatePlanSchema = z.object({
  plan: z.enum(['free', 'starter', 'business', 'enterprise']),
});

/**
 * GET /api/v1/billing/subscription
 * Get current subscription
 */
router.get(
  '/subscription',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;

      const subscription = await BillingService.getSubscription(organizationId);
      const plan = subscription?.plan ? BillingService.getPlan(subscription.plan) : null;

      res.json({
        subscription,
        plan,
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  }
);

/**
 * GET /api/v1/billing/plans
 * Get available plans
 */
router.get('/plans', (req: Request, res: Response) => {
  const plans = [
    BillingService.getPlan('free'),
    BillingService.getPlan('starter'),
    BillingService.getPlan('business'),
    BillingService.getPlan('enterprise'),
  ];

  res.json({ plans });
});

/**
 * POST /api/v1/billing/checkout
 * Create checkout session
 */
router.post(
  '/checkout',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId, userId } = req;
      const { plan } = updatePlanSchema.parse(req.body);

      if (plan === 'free') {
        return res.status(400).json({ error: 'Cannot checkout to free plan' });
      }

      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!org || !user) {
        return res.status(404).json({ error: 'Organization or user not found' });
      }

      const customerId = await BillingService.getOrCreateCustomer(
        organizationId,
        user.email,
        org.name
      );

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: BillingService.getPlan(plan)?.id,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(400).json({ error: 'Failed to create checkout session' });
    }
  }
);

/**
 * POST /api/v1/billing/update-plan
 * Update subscription plan
 */
router.post(
  '/update-plan',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;
      const { plan } = updatePlanSchema.parse(req.body);

      if (plan === 'free') {
        await BillingService.cancelSubscription(organizationId);
        return res.json({ success: true, message: 'Downgraded to free plan' });
      }

      const planDetails = BillingService.getPlan(plan);
      if (!planDetails) {
        return res.status(400).json({ error: 'Invalid plan' });
      }

      await BillingService.updateSubscriptionPlan(organizationId, planDetails.id);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update plan error:', error);
      res.status(400).json({ error: error.message || 'Failed to update plan' });
    }
  }
);

/**
 * POST /api/v1/billing/cancel
 * Cancel subscription
 */
router.post(
  '/cancel',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;

      await BillingService.cancelSubscription(organizationId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      res.status(400).json({ error: error.message || 'Failed to cancel subscription' });
    }
  }
);

/**
 * POST /api/v1/billing/portal
 * Get billing portal session
 */
router.post(
  '/portal',
  authenticateToken,
  requireOrganization,
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req;

      const subscription = await prisma.subscription.findUnique({
        where: { organizationId },
      });

      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ error: 'No customer found' });
      }

      const session = await BillingService.createBillingPortalSession(
        subscription.stripeCustomerId,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Portal session error:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }
);

/**
 * POST /api/v1/billing/webhook
 * Stripe webhook handler
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    await BillingService.handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

export default router;
