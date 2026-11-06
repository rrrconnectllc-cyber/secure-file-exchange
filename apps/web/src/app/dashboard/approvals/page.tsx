import type { Metadata } from 'next';
import { ApprovalsManager } from './ApprovalsManager';

export const metadata: Metadata = {
  title: 'Approvals',
  description: 'Approve or reject documents before they leave the firm.',
};

export default function ApprovalsPage() {
  return <ApprovalsManager />;
}
