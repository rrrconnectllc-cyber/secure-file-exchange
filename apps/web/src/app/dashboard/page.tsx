import type { Metadata } from 'next';
import { Overview } from './Overview';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Organization overview and recent file activity.',
};

export default function DashboardPage() {
  return <Overview />;
}
