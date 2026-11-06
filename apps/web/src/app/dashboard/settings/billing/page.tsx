import type { Metadata } from 'next';
import { BillingManager } from './BillingManager';

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Organization plan and pricing.',
};

export default function BillingSettingsPage() {
  return <BillingManager />;
}
