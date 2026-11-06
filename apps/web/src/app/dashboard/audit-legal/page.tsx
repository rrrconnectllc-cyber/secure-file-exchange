import type { Metadata } from 'next';
import { ComplianceManager } from './ComplianceManager';

export const metadata: Metadata = {
  title: 'Compliance reports',
  description: 'Activity recorded for this firm.',
};

export default function CompliancePage() {
  return <ComplianceManager />;
}
