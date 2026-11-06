import type { Metadata } from 'next';
import { MatterDetail } from './MatterDetail';

export const metadata: Metadata = {
  title: 'Matter',
  description: 'Documents filed on a matter.',
};

export default function MatterPage() {
  return <MatterDetail />;
}
